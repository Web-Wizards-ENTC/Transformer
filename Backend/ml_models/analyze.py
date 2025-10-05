import sys
import json
import base64
import io
import os
from typing import Tuple, List, Dict
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
from collections import deque

# =============================================================================
# SEGMENTATION MODULE 
# =============================================================================

def load_image(path: str) -> Image.Image:
    return Image.open(path).convert('RGB')

def image_to_features(img: Image.Image) -> np.ndarray:
    W, H = img.size
    arr = np.array(img, dtype=np.float32)  # H x W x 3
    R = arr[:,:,0]
    G = arr[:,:,1]
    B = arr[:,:,2]
    I = (0.299*R + 0.587*G + 0.114*B)
    # coordinate features normalized 0..1
    xs = np.tile(np.linspace(0,1,W, dtype=np.float32), (H,1))
    ys = np.tile(np.linspace(0,1,H, dtype=np.float32)[:,None], (1,W))
    # stack features (H, W, F)
    feats = np.stack([R, G, B, I, xs*255.0, ys*255.0], axis=-1)  # scale coords similar range
    flat = feats.reshape(-1, feats.shape[-1])
    # standardize features (z-score)
    mean = flat.mean(axis=0, keepdims=True)
    std = flat.std(axis=0, keepdims=True) + 1e-6
    flat = (flat - mean)/std
    return flat

def kmeans(data: np.ndarray, k: int, iterations: int = 15, seed: int = 42) -> Tuple[np.ndarray, np.ndarray]:
    """Return (centroids, labels)"""
    n, f = data.shape
    rnd = np.random.RandomState(seed)
    # init: pick k random points
    idx = rnd.choice(n, k, replace=False)
    centroids = data[idx].copy()
    labels = np.zeros(n, dtype=np.int32)
    for it in range(iterations):
        # assign
        dists = np.zeros((n, k), dtype=np.float32)
        for ci in range(k):
            diff = data - centroids[ci]
            dists[:,ci] = np.sum(diff*diff, axis=1)
        new_labels = np.argmin(dists, axis=1)
        if it > 0 and np.all(new_labels == labels):
            break  # converged
        labels = new_labels
        # update
        for ci in range(k):
            mask = labels == ci
            if np.any(mask):
                centroids[ci] = data[mask].mean(axis=0)
            else:
                # re-init empty centroid
                centroids[ci] = data[rnd.choice(n)]
    return centroids, labels

def local_mean(gray: np.ndarray, k: int = 7) -> np.ndarray:
    pad = k//2
    padded = np.pad(gray, pad, mode='reflect')
    out = np.zeros_like(gray)
    for y in range(gray.shape[0]):
        for x in range(gray.shape[1]):
            out[y,x] = padded[y:y+k, x:x+k].mean()
    return out

def score_clusters(labels: np.ndarray, img: Image.Image, k: int) -> Dict:
    W, H = img.size
    arr = np.array(img, dtype=np.float32)
    gray = (0.299*arr[:,:,0] + 0.587*arr[:,:,1] + 0.114*arr[:,:,2]) / 255.0

    # local contrast
    try:
        mean_local = local_mean(gray, 7)
    except Exception:
        mean_local = local_mean(gray, 7)
    contrast = np.abs(gray - mean_local)

    total_pixels = W*H
    cluster_info = []
    for ci in range(k):
        mask_flat = (labels == ci)
        count = int(mask_flat.sum())
        area_frac = count / total_pixels
        if count == 0:
            cluster_info.append({
                'cluster': ci,
                'areaFrac': 0.0,
                'contrastMean': 0.0,
                'compactness': 0.0,
                'score': -1e9,
            })
            continue
        # bounding box
        ys, xs = np.nonzero(mask_flat.reshape(H, W))
        minx, maxx = int(xs.min()), int(xs.max())
        miny, maxy = int(ys.min()), int(ys.max())
        bbox_area = (maxx-minx+1)*(maxy-miny+1)
        compactness = count / (bbox_area + 1e-6)
        contrast_mean = float(contrast.reshape(-1)[mask_flat].mean())
        cluster_info.append({
            'cluster': ci,
            'areaFrac': float(area_frac),
            'contrastMean': contrast_mean,
            'compactness': float(compactness),
            'bbox': [minx, miny, maxx, maxy]
        })

    # normalize metrics (z-like) for scoring
    def z(vals):
        v = np.array(vals, dtype=np.float32)
        if len(v) == 0:
            return v
        m = v.mean(); s = v.std() + 1e-6
        return (v - m)/s

    contrast_z = z([c['contrastMean'] for c in cluster_info])
    compact_z = z([c['compactness'] for c in cluster_info])
    area_deviation = [1 - abs(0.25 - c['areaFrac']) for c in cluster_info]

    min_area_frac = 0.02
    max_area_frac = 0.75

    best_idx = -1
    best_score = -1e9
    for i, info in enumerate(cluster_info):
        if info['areaFrac'] < min_area_frac or info['areaFrac'] > max_area_frac:
            score = -1e9
        else:
            score = float(contrast_z[i] + compact_z[i] + area_deviation[i])
        info['score'] = score
        if score > best_score:
            best_score = score
            best_idx = i

    return {
        'clusters': cluster_info,
        'bestClusterIdx': best_idx,
        'width': W,
        'height': H
    }

def segment_and_reconstruct(path: str, k: int = 4, iterations: int = 12, seed: int = 42) -> Image.Image:
    """Return a reconstructed color Image (transformer region only) without saving intermediates.
    Falls back to original image if segmentation fails.
    """
    img = load_image(path)
    W, H = img.size
    feats = image_to_features(img)
    try:
        _, labels = kmeans(feats, k=k, iterations=iterations, seed=seed)
    except Exception:
        return img
    labels_img = labels.reshape(H, W)
    meta = score_clusters(labels, img, k)
    best_idx = meta['bestClusterIdx']
    if best_idx < 0:
        return img
    best_mask_bool = (labels_img == best_idx).astype(np.uint8)
    # Simple refinement: remove tiny comps
    visited = np.zeros_like(best_mask_bool, dtype=bool)
    refined = np.zeros_like(best_mask_bool, dtype=np.uint8)
    min_area = int(0.002 * W * H)
    dirs = [(1,0),(-1,0),(0,1),(0,-1)]
    for y in range(H):
        for x in range(W):
            if best_mask_bool[y, x] == 0 or visited[y, x]:
                continue
            q = deque([(x, y)])
            visited[y, x] = True
            pixels = []
            while q:
                px, py = q.popleft()
                pixels.append((px, py))
                for dx, dy in dirs:
                    nx, ny = px + dx, py + dy
                    if nx < 0 or ny < 0 or nx >= W or ny >= H:
                        continue
                    if not visited[ny, nx] and best_mask_bool[ny, nx] == 1:
                        visited[ny, nx] = True
                        q.append((nx, ny))
            if len(pixels) >= min_area:
                for (px, py) in pixels:
                    refined[py, px] = 1
    arr = np.array(img)
    recon = np.zeros_like(arr)
    recon[refined == 1] = arr[refined == 1]
    return Image.fromarray(recon)

# =============================================================================
# THERMAL ANALYSIS MODULE 
# =============================================================================

def rgb_to_hsv(r, g, b):
    r_, g_, b_ = r/255.0, g/255.0, b/255.0
    mx = max(r_, g_, b_)
    mn = min(r_, g_, b_)
    diff = mx - mn
    if diff == 0:
        h = 0.0
    elif mx == r_:
        h = (60 * ((g_-b_)/diff) + 360) % 360
    elif mx == g_:
        h = (60 * ((b_-r_)/diff) + 120) % 360
    else:
        h = (60 * ((r_-g_)/diff) + 240) % 360
    s = 0.0 if mx == 0 else diff / mx
    v = mx
    return h/360.0, s, v

def analyze_pair(base_img: Image.Image, cand_img: Image.Image):
    W, H = cand_img.size
    # Hist parameters
    h_bins, s_bins = 30, 32
    hist_base = [0.0]*(h_bins*s_bins)
    hist_cand = [0.0]*(h_bins*s_bins)

    # Prepare pixel access
    base_px = base_img.convert('RGB').load()
    cand_px = cand_img.convert('RGB').load()

    # dv95 sampling approx 10% pixels
    sample_every = 10
    dv_vals = []

    # Warm mask
    mask = [[False]*W for _ in range(H)]

    for y in range(H):
        for x in range(W):
            rB, gB, bB = base_px[x, y]
            rC, gC, bC = cand_px[x, y]
            hB, sB, vB = rgb_to_hsv(rB, gB, bB)
            hC, sC, vC = rgb_to_hsv(rC, gC, bC)

            hBinB = min(h_bins-1, max(0, int(hB*h_bins)))
            sBinB = min(s_bins-1, max(0, int(sB*s_bins)))
            hist_base[hBinB*s_bins + sBinB] += 1.0

            hBinC = min(h_bins-1, max(0, int(hC*h_bins)))
            sBinC = min(s_bins-1, max(0, int(sC*s_bins)))
            hist_cand[hBinC*s_bins + sBinC] += 1.0

            if ((x + y*W) % sample_every) == 0:
                dv_vals.append(max(0.0, vC - vB))

            warm_hue = (hC <= 0.17) or (hC >= 0.95)
            warm_sat = sC >= 0.35
            warm_val = vC >= 0.5
            contrast = (vC - vB) >= 0.15
            mask[y][x] = warm_hue and warm_sat and warm_val and contrast

    def normalize(hist):
        s = sum(hist)
        if s > 0:
            for i in range(len(hist)):
                hist[i] /= s

    def l2(a, b):
        return sum((ai-bi)*(ai-bi) for ai, bi in zip(a, b)) ** 0.5

    normalize(hist_base)
    normalize(hist_cand)
    hist_dist = l2(hist_base, hist_cand)

    dv_vals.sort()
    if dv_vals:
        idx = round(0.95*(len(dv_vals)-1))
        dv95 = dv_vals[idx]
    else:
        dv95 = 0.0

    warm_count = sum(1 for y in range(H) for x in range(W) if mask[y][x])
    warm_frac = warm_count/(W*H)

    # Connected components to boxes
    visited = [[False]*W for _ in range(H)]
    dirs = [(1,0),(-1,0),(0,1),(0,-1)]
    boxes = []
    min_area = max(32, int(W*H*0.001))

    for y in range(H):
        for x in range(W):
            if not mask[y][x] or visited[y][x]:
                continue
            q = deque([(x,y)])
            visited[y][x] = True
            minX = maxX = x
            minY = maxY = y
            area = 0
            while q:
                px, py = q.popleft()
                area += 1
                minX = min(minX, px)
                minY = min(minY, py)
                maxX = max(maxX, px)
                maxY = max(maxY, py)
                for dx, dy in dirs:
                    nx, ny = px+dx, py+dy
                    if nx < 0 or ny < 0 or nx >= W or ny >= H:
                        continue
                    if not visited[ny][nx] and mask[ny][nx]:
                        visited[ny][nx] = True
                        q.append((nx, ny))
            if area >= min_area:
                boxes.append([minX, minY, maxX-minX+1, maxY-minY+1])

    # Classify potential faults
    def classify_fault(img_w, img_h, boxes_list):
        if not boxes_list:
            return "none", []
        center_x0, center_y0 = int(img_w * 0.33), int(img_h * 0.33)
        center_x1, center_y1 = int(img_w * 0.67), int(img_h * 0.67)
        total_area = float(img_w * img_h)

        info = []
        has_large_central = False
        has_rectangular = False
        max_area_frac = 0.0

        for (x, y, w, h) in boxes_list:
            area = float(w * h)
            area_frac = area / total_area if total_area > 0 else 0.0
            short_side = max(1.0, float(min(w, h)))
            long_side = float(max(w, h))
            aspect = long_side / short_side

            bx0, by0, bx1, by1 = x, y, x + w, y + h
            ox0, oy0 = max(bx0, center_x0), max(by0, center_y0)
            ox1, oy1 = min(bx1, center_x1), min(by1, center_y1)
            overlap = max(0, ox1 - ox0) * max(0, oy1 - oy0)
            overlap_frac = (overlap / area) if area > 0 else 0.0

            max_area_frac = max(max_area_frac, area_frac)
            if aspect >= 2.0:
                has_rectangular = True

            if area_frac >= 0.10:
                box_label = 'Loose joint'
            elif aspect >= 2.0:
                box_label = 'Wire overload'
            else:
                box_label = 'Point overload'

            if area_frac >= 0.30 and overlap_frac >= 0.4:
                has_large_central = True

            info.append({
                'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h),
                'areaFrac': float(area_frac), 'aspect': float(aspect),
                'overlapCenterFrac': float(overlap_frac), 'label': box_label
            })

        if has_large_central:
            return "loose joint", info
        if max_area_frac < 0.30:
            return "point overload", info
        if has_rectangular:
            return "wire overload", info
        return "none", info

    fault_type_raw, _ = classify_fault(W, H, boxes)

    # Filter nested boxes
    def overlap_area(a, b):
        ax, ay, aw, ah = a
        bx, by, bw, bh = b
        ax1, ay1, bx1, by1 = ax + aw, ay + ah, bx + bw, by + bh
        ix0, iy0 = max(ax, bx), max(ay, by)
        ix1, iy1 = min(ax1, bx1), min(ay1, by1)
        w = max(0, ix1 - ix0)
        h = max(0, iy1 - iy0)
        return w * h

    keep = [True] * len(boxes)
    areas = [w * h for (x, y, w, h) in boxes]
    for i in range(len(boxes)):
        if not keep[i]:
            continue
        for j in range(len(boxes)):
            if i == j or not keep[j]:
                continue
            inter = overlap_area(boxes[i], boxes[j])
            if areas[i] > 0 and inter / areas[i] >= 0.8:
                keep[i] = False
                break
    filtered = [b for b, k in zip(boxes, keep) if k]

    # Score and prob
    score = (hist_dist/0.5) + dv95 + (warm_frac*2.0)
    prob = 1.0 / (1.0 + pow(2.718281828, -score))

    _, box_info = classify_fault(W, H, filtered)
    fault_type = fault_type_raw

    enriched = []
    for bi in box_info:
        area_frac = bi['areaFrac']
        aspect = bi['aspect']
        overlap_center = bi['overlapCenterFrac']
        
        if area_frac >= 0.10 and (overlap_center >= 0.4 or area_frac >= 0.30):
            box_fault = 'loose joint'
        elif aspect >= 2.0:
            box_fault = 'wire overload'
        else:
            box_fault = 'point overload'
        bi2 = dict(bi)
        bi2['boxFault'] = box_fault
        enriched.append(bi2)

    return {
        'prob': float(prob),
        'histDistance': float(hist_dist),
        'dv95': float(dv95),
        'warmFraction': float(warm_frac),
        'imageWidth': int(W),
        'imageHeight': int(H),
        'boxes': filtered,
        'boxInfo': enriched,
        'faultType': fault_type,
        'annotated': '',
    }

def draw_bounding_boxes(image, box_info):
    """Draw bounding boxes with labels on the image"""
    img_copy = image.copy()
    draw = ImageDraw.Draw(img_copy)
    
    colors = {
        'loose joint': '#FF0000',
        'wire overload': '#00FF00',
        'point overload': '#0000FF',
        'default': '#FFFF00'
    }
    
    for box in box_info:
        x, y, w, h = box['x'], box['y'], box['w'], box['h']
        fault_type = box.get('boxFault', 'default')
        color = colors.get(fault_type, colors['default'])
        
        draw.rectangle([x, y, x + w, y + h], outline=color, width=3)
        
        label = f"{fault_type} ({box['areaFrac']:.1%})"
        
        try:
            font = ImageFont.load_default()
        except:
            font = None
            
        if font:
            bbox = draw.textbbox((x, y-20), label, font=font)
            draw.rectangle(bbox, fill=color)
            draw.text((x, y-20), label, fill='white', font=font)
        else:
            draw.text((x, y-20), label, fill=color)
    
    return img_copy

# =============================================================================
# MAIN INTEGRATED FUNCTION
# =============================================================================

def main():
    if len(sys.argv) != 3:
        print(json.dumps({'error': 'usage: integrated_analyzer.py BASELINE CANDIDATE'}))
        sys.exit(2)
    base_path, cand_path = sys.argv[1], sys.argv[2]
    
    # Create result folder
    script_dir = os.path.dirname(os.path.abspath(__file__))
    result_dir = os.path.join(script_dir, 'result')
    os.makedirs(result_dir, exist_ok=True)
    
    try:
        # Load originals
        orig_base = Image.open(base_path).convert('RGB')
        orig_cand = Image.open(cand_path).convert('RGB')

        # Apply segmentation
        seg_base = segment_and_reconstruct(base_path)
        seg_cand = segment_and_reconstruct(cand_path)

        # Ensure same size
        if seg_base.size != seg_cand.size:
            seg_base = seg_base.resize(seg_cand.size, Image.BILINEAR)

        # Save segmented images
        seg_base_name = os.path.splitext(os.path.basename(base_path))[0] + '_seg.png'
        seg_cand_name = os.path.splitext(os.path.basename(cand_path))[0] + '_seg.png'
        seg_base_path = os.path.join(result_dir, seg_base_name)
        seg_cand_path = os.path.join(result_dir, seg_cand_name)
        seg_base.save(seg_base_path)
        seg_cand.save(seg_cand_path)

        # Analyze
        res = analyze_pair(seg_base, seg_cand)
        res['segmentedBaseline'] = seg_base_path
        res['segmentedCandidate'] = seg_cand_path

        # Draw bounding boxes if any
        if res['boxInfo']:
            annotated_img = draw_bounding_boxes(seg_cand, res['boxInfo'])
            base_name_root = os.path.splitext(os.path.basename(base_path))[0]
            cand_name_root = os.path.splitext(os.path.basename(cand_path))[0]
            output_filename = f"{base_name_root}_vs_{cand_name_root}_result.jpg"
            output_path = os.path.join(result_dir, output_filename)
            annotated_img.save(output_path, 'JPEG')
            res['saved_image'] = output_path
            res['num_boxes'] = len(res['boxInfo'])
        else:
            res['saved_image'] = None
            res['num_boxes'] = 0

        # Output the result
        print(json.dumps(res, separators=(',', ':')))
        
        # Cleanup: Delete all intermediate images after generating output
        try:
            if os.path.exists(seg_base_path):
                os.remove(seg_base_path)
            if os.path.exists(seg_cand_path):
                os.remove(seg_cand_path)
            # Also delete the final annotated result image
            if res.get('saved_image') and os.path.exists(res['saved_image']):
                os.remove(res['saved_image'])
        except Exception as cleanup_error:
            # Don't fail the entire process if cleanup fails
            pass
        
        sys.exit(0)
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()