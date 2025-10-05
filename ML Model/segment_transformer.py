"""
Unsupervised transformer part segmentation (simple, dependency-light).

Approach:
1. Load image (RGB) with Pillow.
2. Build a feature vector per pixel: [R, G, B, intensity, x/W, y/H].
3. Run a lightweight custom K-Means (no sklearn dependency) with K clusters (default 4).
4. For each cluster create a binary mask.
5. Score clusters to guess the transformer body region:
   - Reject masks with area fraction < min_area_frac (default 0.02) or > max_area_frac (default 0.75).
   - Compute average local contrast (difference vs 7x7 mean blurred image) inside mask.
   - Compute compactness score = area / (bbox_area + 1e-6).
   - Composite score = (contrast_z + compactness_z + (1 - |0.25 - area_frac|))
   Highest composite wins.
6. Save:
   - result/mask_best.png : best guess mask (white=transformer candidate)
   - result/mask_cluster_<i>.png : mask per cluster
   - result/overlay_cluster_<i>.png : image with that cluster highlighted
   - result/overlay_best.png : highlight of chosen cluster
   - result/segments_meta.json : metrics per cluster & chosen index

Usage:
    python segment_transformer.py input.jpg
    (Outputs to ./result directory.)

Optional args:
    --k 4            Number of clusters (2-8 reasonable)
    --iterations 15  K-Means iterations
    --seed 42        Random seed

Integration idea with analyze.py:
    1. Run this script once per image to isolate transformer.
    2. Multiply candidate image by mask (or crop to mask bbox) before calling analyze_pair for more robust thermal comparison.

No external heavy libs; only Pillow and numpy.
"""
from __future__ import annotations
import sys, os, json, math, random
from typing import Tuple, List, Dict
from PIL import Image, ImageFilter, ImageDraw
import numpy as np

# ------------------------------ Utility functions ------------------------------

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

# ------------------------------ K-Means (simple) ------------------------------

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
        # compute distances to centroids (k-means++ style not needed here)
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

# ------------------------------ Scoring clusters ------------------------------

def compute_local_contrast(gray: np.ndarray) -> np.ndarray:
    from scipy.signal import convolve2d  # optional; fallback manual if missing
    # If scipy unavailable, we'll catch and use a simple box filter with numpy

# Provide a pure numpy fallback for local contrast without scipy

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

    # local contrast (slow but OK for moderate images)
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
    area_deviation = [1 - abs(0.25 - c['areaFrac']) for c in cluster_info]  # prefer ~25% region but flexible

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

# ------------------------------ Main segmentation pipeline ------------------------------

def segment_image(path: str, k: int = 4, iterations: int = 15, seed: int = 42):
    img = load_image(path)
    W, H = img.size
    feats = image_to_features(img)
    _, labels = kmeans(feats, k=k, iterations=iterations, seed=seed)
    meta = score_clusters(labels, img, k)
    best_idx = meta['bestClusterIdx']

    # Prepare result directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(script_dir, 'result')
    os.makedirs(out_dir, exist_ok=True)

    labels_img = labels.reshape(H, W)

    # Save masks & overlays
    arr = np.array(img)
    for ci in range(k):
        mask = (labels_img == ci).astype(np.uint8) * 255
        mask_img = Image.fromarray(mask, mode='L')
        mask_img.save(os.path.join(out_dir, f"mask_cluster_{ci}.png"))

        # overlay: dim others
        overlay_arr = arr.copy()
        dim_factor = 0.15
        overlay_arr[labels_img != ci] = (overlay_arr[labels_img != ci] * dim_factor).astype(np.uint8)
        overlay_img = Image.fromarray(overlay_arr)
        # Draw bbox
        info = [c for c in meta['clusters'] if c['cluster'] == ci][0]
        if 'bbox' in info:
            minx, miny, maxx, maxy = info['bbox']
            draw = ImageDraw.Draw(overlay_img)
            draw.rectangle([minx, miny, maxx, maxy], outline='yellow', width=3)
            draw.text((minx, max(0, miny-15)), f"c{ci} a={info['areaFrac']*100:.1f}% s={info.get('score',0):.2f}", fill='yellow')
        overlay_img.save(os.path.join(out_dir, f"overlay_cluster_{ci}.png"))

    best_mask_path = None
    refined_mask_path = None
    color_recon_path = None
    color_recon_transparent_path = None
    if best_idx >= 0:
        # Initial mask (boolean 0/1)
        best_mask_bool = (labels_img == best_idx).astype(np.uint8)

        # --- Refinement: remove small / text-like components ---
        # Connected components via simple BFS on numpy (4-neighbor)
        visited = np.zeros_like(best_mask_bool, dtype=bool)
        refined = np.zeros_like(best_mask_bool, dtype=np.uint8)
        min_area = int(0.002 * W * H)  # drop very small specks
        max_aspect_for_text = 8.0      # extremely long thin shapes likely text/lines
        from collections import deque
        dirs = [(1,0),(-1,0),(0,1),(0,-1)]
        for y in range(H):
            for x in range(W):
                if best_mask_bool[y, x] == 0 or visited[y, x]:
                    continue
                q = deque([(x, y)])
                visited[y, x] = True
                pixels = []
                minx = maxx = x
                miny = maxy = y
                while q:
                    px, py = q.popleft()
                    pixels.append((px, py))
                    if px < minx: minx = px
                    if px > maxx: maxx = px
                    if py < miny: miny = py
                    if py > maxy: maxy = py
                    for dx, dy in dirs:
                        nx, ny = px + dx, py + dy
                        if nx < 0 or ny < 0 or nx >= W or ny >= H:
                            continue
                        if not visited[ny, nx] and best_mask_bool[ny, nx] == 1:
                            visited[ny, nx] = True
                            q.append((nx, ny))
                area = len(pixels)
                if area < min_area:
                    continue  # discard tiny
                bw = maxx - minx + 1
                bh = maxy - miny + 1
                aspect = max(bw, bh) / max(1, min(bw, bh))
                fill_ratio = area / float(bw * bh)
                # Heuristics: likely text/number overlays are narrow & low fill
                if aspect > max_aspect_for_text and fill_ratio < 0.25:
                    continue  # discard elongated thin component
                # Keep component
                for (px, py) in pixels:
                    refined[py, px] = 1

        # Slight morphological closing to fill small gaps (3x3)
        if refined.any():
            ref_pad = np.pad(refined, 1, mode='constant')
            closed = np.zeros_like(refined)
            for y in range(H):
                for x in range(W):
                    window = ref_pad[y:y+3, x:x+3]
                    if window.sum() >= 5:  # majority
                        closed[y, x] = 1
            refined = closed

        # Save original best (pre-refine) and refined mask
        best_mask_img = Image.fromarray((best_mask_bool*255).astype(np.uint8), mode='L')
        best_mask_path = os.path.join(out_dir, 'mask_best.png')
        best_mask_img.save(best_mask_path)

        refined_mask_img = Image.fromarray((refined*255).astype(np.uint8), mode='L')
        refined_mask_path = os.path.join(out_dir, 'mask_best_refined.png')
        refined_mask_img.save(refined_mask_path)

        # overlay best (using refined for highlight)
        overlay_best_arr = arr.copy()
        dim_factor = 0.1
        overlay_best_arr[refined == 0] = (overlay_best_arr[refined == 0] * dim_factor).astype(np.uint8)
        overlay_best_img = Image.fromarray(overlay_best_arr)
        overlay_best_img.save(os.path.join(out_dir, 'overlay_best.png'))

        # Color reconstruction: keep original colors where refined==1 else black
        recon_arr = np.zeros_like(arr)
        recon_arr[refined == 1] = arr[refined == 1]
        color_recon_img = Image.fromarray(recon_arr)
        color_recon_path = os.path.join(out_dir, 'transformer_reconstructed.png')
        color_recon_img.save(color_recon_path)

        # Transparent version (RGBA)
        recon_rgba = np.zeros((H, W, 4), dtype=np.uint8)
        recon_rgba[refined == 1, :3] = arr[refined == 1]
        recon_rgba[refined == 1, 3] = 255
        color_recon_transparent = Image.fromarray(recon_rgba, mode='RGBA')
        color_recon_transparent_path = os.path.join(out_dir, 'transformer_reconstructed_transparent.png')
        color_recon_transparent.save(color_recon_transparent_path)

    # Save metadata
    meta_path = os.path.join(out_dir, 'segments_meta.json')
    # augment meta with refinement info
    meta_aug = dict(meta)
    meta_aug['refined'] = bool(refined_mask_path is not None)
    meta_aug['paths'] = {
        'bestMask': best_mask_path,
        'refinedMask': refined_mask_path,
        'colorReconstruction': color_recon_path,
        'colorReconstructionTransparent': color_recon_transparent_path
    }
    with open(meta_path, 'w') as f:
        json.dump(meta_aug, f, indent=2)

    return {
        'meta': meta_aug,
        'best_mask_path': best_mask_path,
        'refined_mask_path': refined_mask_path,
        'color_reconstruction_path': color_recon_path,
        'color_reconstruction_transparent_path': color_recon_transparent_path,
        'output_dir': out_dir
    }

# ------------------------------ Minimal API (no extra saves) ------------------------------
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
    from collections import deque
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

# ------------------------------ CLI ------------------------------

def parse_args(argv: List[str]):
    import argparse
    p = argparse.ArgumentParser(description='Unsupervised transformer segmentation (simple K-Means).')
    p.add_argument('image', help='Input image path')
    p.add_argument('--k', type=int, default=4, help='Number of clusters (2-8)')
    p.add_argument('--iterations', type=int, default=15, help='K-Means iterations')
    p.add_argument('--seed', type=int, default=42, help='Random seed')
    p.add_argument('--minimal', action='store_true', help='Only output single reconstructed image (transformer_reconstructed.png)')
    return p.parse_args(argv)

def main():
    args = parse_args(sys.argv[1:])
    if args.k < 2 or args.k > 12:
        print(json.dumps({'error': 'k must be between 2 and 12'}))
        sys.exit(2)
    try:
        if args.minimal:
            # Use full pipeline but only keep color reconstruction
            res = segment_image(args.image, k=args.k, iterations=args.iterations, seed=args.seed)
            print(json.dumps({
                'colorReconstruction': res['color_reconstruction_path']
            }, separators=(',', ':')))
        else:
            result = segment_image(args.image, k=args.k, iterations=args.iterations, seed=args.seed)
            print(json.dumps({
                'bestClusterIdx': result['meta']['bestClusterIdx'],
                'bestMask': result['best_mask_path'],
                'refinedMask': result['refined_mask_path'],
                'colorReconstruction': result['color_reconstruction_path'],
                'colorReconstructionTransparent': result['color_reconstruction_transparent_path'],
                'outputDir': result['output_dir']
            }, separators=(',', ':')))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
