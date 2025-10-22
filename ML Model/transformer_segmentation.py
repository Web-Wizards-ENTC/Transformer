""""""

Transformer Segmentation IntegrationTransformer segmentation module that integrates with the existing thermal analysis workflow.

This module provides functions to segment transformer parts and apply analysis only to segmented regions.

This module integrates U-Net segmentation with thermal analysis."""

It provides functions to segment transformers before thermal analysis.

"""import os

import osimport sys

import sysimport numpy as np

from PIL import Imageimport cv2

import numpy as npfrom PIL import Image

import torch

# Import segmentation functions

try:# Import local modules

    from segment_thermal import load_model, preprocess_image, segment_image, postprocess_mask, apply_maskfrom segment_thermal import ThermalSegmentationInference

    import torchfrom data_utils import preprocess_thermal_image, postprocess_mask

    SEGMENTATION_AVAILABLE = True

except ImportError:

    SEGMENTATION_AVAILABLE = Falseclass TransformerSegmentation:

    print("Warning: Segmentation not available (missing dependencies)")    """

    Wrapper class for transformer segmentation that integrates with thermal analysis.

    """

def segment_before_analysis(image_path, model_path='models/best_model.pth', use_segmentation=True):    

    """    def __init__(self, model_path=None, device=None, image_size=(256, 256)):

    Segment transformer from thermal image before analysis        """

            Initialize the segmentation module.

    Args:        

        image_path: Path to thermal image or PIL Image object        Args:

        model_path: Path to pre-trained U-Net model            model_path: Path to trained U-Net model. If None, will look for default locations.

        use_segmentation: If False, returns original image            device: Device to run inference on

                image_size: Input size for the model

    Returns:        """

        PIL Image (segmented if use_segmentation=True, otherwise original)        self.device = device if device else torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    """        self.image_size = image_size

    if not use_segmentation:        self.model_loaded = False

        if isinstance(image_path, str):        

            return Image.open(image_path).convert('RGB')        # Try to load model

        return image_path        if model_path is None:

                model_path = self._find_model_path()

    if not SEGMENTATION_AVAILABLE:        

        print("Warning: Segmentation not available, using original image")        if model_path and os.path.exists(model_path):

        if isinstance(image_path, str):            try:

            return Image.open(image_path).convert('RGB')                self.inference = ThermalSegmentationInference(

        return image_path                    model_path=model_path,

                        device=self.device,

    try:                    image_size=image_size

        # Check if model exists                )

        if not os.path.exists(model_path):                self.model_loaded = True

            print(f"Warning: Model not found at {model_path}, using original image")                print(f"Segmentation model loaded successfully from: {model_path}")

            if isinstance(image_path, str):            except Exception as e:

                return Image.open(image_path).convert('RGB')                print(f"Warning: Could not load segmentation model: {str(e)}")

            return image_path                print("Analysis will proceed without segmentation.")

                        self.model_loaded = False

        # Load image if path is provided        else:

        if isinstance(image_path, str):            print("Warning: No segmentation model found. Analysis will proceed without segmentation.")

            img_to_segment = image_path            self.model_loaded = False

        else:    

            # Save PIL Image temporarily    def _find_model_path(self):

            temp_path = 'temp_segment.png'        """Find the model in common locations"""

            image_path.save(temp_path)        possible_paths = [

            img_to_segment = temp_path            "models/best_model.pth",

                    "models/latest_checkpoint.pth",

        # Run segmentation            "best_model.pth",

        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')            "unet_model.pth"

        model = load_model(model_path, device)        ]

                

        img_tensor, original_img, original_size = preprocess_image(img_to_segment)        for path in possible_paths:

        mask_tensor = segment_image(model, img_tensor, device)            if os.path.exists(path):

        mask_img = postprocess_mask(mask_tensor, original_size)                return path

        segmented_img = apply_mask(original_img, mask_img)        

                return None

        # Clean up temp file if created    

        if not isinstance(image_path, str) and os.path.exists('temp_segment.png'):    def segment_transformer(self, image_path_or_array):

            os.remove('temp_segment.png')        """

                Segment transformer parts from thermal image.

        return segmented_img        

                Args:

    except Exception as e:            image_path_or_array: Path to image file or numpy array

        print(f"Warning: Segmentation failed ({e}), using original image")            

        if isinstance(image_path, str):        Returns:

            return Image.open(image_path).convert('RGB')            tuple: (segmented_mask, transformer_region_only, original_image)

        return image_path                   Returns None values if segmentation fails

        """

        if not self.model_loaded:

def get_segmentation_mask(image_path, model_path='models/best_model.pth'):            return None, None, None

    """        

    Get binary segmentation mask for thermal image        try:

                if isinstance(image_path_or_array, str):

    Args:                # Load from file path

        image_path: Path to thermal image                results = self.inference.predict_single_image(

        model_path: Path to pre-trained U-Net model                    image_path_or_array, 

                        save_mask=False, 

    Returns:                    save_overlay=False

        PIL Image (binary mask) or None if segmentation fails                )

    """                original_image = results['original_image']

    if not SEGMENTATION_AVAILABLE:                mask = results['predicted_mask']

        return None            

                elif isinstance(image_path_or_array, (np.ndarray, Image.Image)):

    try:                # Process numpy array or PIL Image

        if not os.path.exists(model_path):                if isinstance(image_path_or_array, Image.Image):

            return None                    image_array = np.array(image_path_or_array)

                        else:

        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')                    image_array = image_path_or_array

        model = load_model(model_path, device)                

                        # Save temporarily and process

        img_tensor, original_img, original_size = preprocess_image(image_path)                temp_path = "temp_thermal_image.png"

        mask_tensor = segment_image(model, img_tensor, device)                cv2.imwrite(temp_path, image_array)

        mask_img = postprocess_mask(mask_tensor, original_size)                

                        results = self.inference.predict_single_image(

        return mask_img                    temp_path, 

                            save_mask=False, 

    except Exception as e:                    save_overlay=False

        print(f"Warning: Mask generation failed ({e})")                )

        return None                original_image = results['original_image']

                mask = results['predicted_mask']

                

def crop_to_transformer(image, mask=None, padding=10):                # Clean up temp file

    """                if os.path.exists(temp_path):

    Crop image to transformer bounding box based on mask                    os.remove(temp_path)

                

    Args:            else:

        image: PIL Image                raise ValueError("Input must be file path, numpy array, or PIL Image")

        mask: PIL Image (binary mask) - if None, returns original            

        padding: Pixels to add around bounding box            # Create transformer-only region

                transformer_region = original_image.copy()

    Returns:            transformer_region[mask != 1] = 0  # Mask out non-transformer areas

        Cropped PIL Image            

    """            return mask, transformer_region, original_image

    if mask is None:        

        return image        except Exception as e:

                print(f"Error in segmentation: {str(e)}")

    try:            return None, None, None

        # Convert mask to numpy    

        mask_array = np.array(mask)    def apply_segmentation_mask(self, image, mask, class_id=1):

                """

        # Find bounding box        Apply segmentation mask to focus analysis on specific regions.

        rows = np.any(mask_array > 127, axis=1)        

        cols = np.any(mask_array > 127, axis=0)        Args:

                    image: PIL Image or numpy array

        if not np.any(rows) or not np.any(cols):            mask: Segmentation mask (numpy array)

            return image            class_id: Class ID to keep (1 for transformer)

                    

        y_min, y_max = np.where(rows)[0][[0, -1]]        Returns:

        x_min, x_max = np.where(cols)[0][[0, -1]]            Masked image (PIL Image)

                """

        # Add padding        if mask is None:

        h, w = mask_array.shape            return image

        y_min = max(0, y_min - padding)        

        y_max = min(h, y_max + padding)        # Convert to numpy if PIL Image

        x_min = max(0, x_min - padding)        if isinstance(image, Image.Image):

        x_max = min(w, x_max + padding)            img_array = np.array(image)

                    was_pil = True

        # Crop        else:

        cropped = image.crop((x_min, y_min, x_max, y_max))            img_array = image.copy()

        return cropped            was_pil = False

                

    except Exception as e:        # Apply mask

        print(f"Warning: Cropping failed ({e})")        masked_array = img_array.copy()

        return image        if len(img_array.shape) == 3:  # RGB image

            for channel in range(img_array.shape[2]):

                masked_array[:, :, channel][mask != class_id] = 0

def segment_and_crop(image_path, model_path='models/best_model.pth', padding=10):        else:  # Grayscale

    """            masked_array[mask != class_id] = 0

    Segment transformer and crop to bounding box        

            # Convert back to PIL if needed

    Args:        if was_pil:

        image_path: Path to thermal image            return Image.fromarray(masked_array.astype(np.uint8))

        model_path: Path to pre-trained model        else:

        padding: Pixels around bounding box            return masked_array

        

    Returns:    def get_transformer_bbox(self, mask):

        Cropped PIL Image        """

    """        Get bounding box of transformer region from segmentation mask.

    if isinstance(image_path, str):        

        original_img = Image.open(image_path).convert('RGB')        Args:

    else:            mask: Segmentation mask

        original_img = image_path            

            Returns:

    mask = get_segmentation_mask(image_path if isinstance(image_path, str) else 'temp.png', model_path)            tuple: (x, y, width, height) or None if no transformer found

            """

    if mask is None:        if mask is None:

        return original_img            return None

            

    return crop_to_transformer(original_img, mask, padding)        # Find transformer pixels (class_id = 1)

        transformer_pixels = np.where(mask == 1)

        

if __name__ == '__main__':        if len(transformer_pixels[0]) == 0:

    # Test segmentation integration            return None

    if len(sys.argv) < 2:        

        print("Usage: python transformer_segmentation.py <image_path>")        # Get bounding box

        sys.exit(1)        y_min, y_max = np.min(transformer_pixels[0]), np.max(transformer_pixels[0])

            x_min, x_max = np.min(transformer_pixels[1]), np.max(transformer_pixels[1])

    img_path = sys.argv[1]        

            return (x_min, y_min, x_max - x_min + 1, y_max - y_min + 1)

    print("Testing segmentation integration...")    

    segmented = segment_before_analysis(img_path)    def crop_to_transformer(self, image, mask, padding=20):

    segmented.save('results/test_segmented.png')        """

    print("✓ Segmented image saved to results/test_segmented.png")        Crop image to transformer region with optional padding.

            

    mask = get_segmentation_mask(img_path)        Args:

    if mask:            image: PIL Image or numpy array

        mask.save('results/test_mask.png')            mask: Segmentation mask

        print("✓ Mask saved to results/test_mask.png")            padding: Pixels to add around transformer region

                

    cropped = segment_and_crop(img_path)        Returns:

    cropped.save('results/test_cropped.png')            Cropped image and adjusted coordinates

    print("✓ Cropped image saved to results/test_cropped.png")        """

        bbox = self.get_transformer_bbox(mask)
        if bbox is None:
            return image, (0, 0)
        
        x, y, w, h = bbox
        
        # Add padding
        if isinstance(image, Image.Image):
            img_w, img_h = image.size
        else:
            img_h, img_w = image.shape[:2]
        
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(img_w, x + w + padding)
        y2 = min(img_h, y + h + padding)
        
        # Crop image
        if isinstance(image, Image.Image):
            cropped = image.crop((x1, y1, x2, y2))
        else:
            cropped = image[y1:y2, x1:x2]
        
        return cropped, (x1, y1)


def analyze_with_segmentation(baseline_path, candidate_path, model_path=None):
    """
    Enhanced analysis function that uses segmentation to focus on transformer regions.
    This function can be used as a drop-in replacement for the original analyze function.
    
    Args:
        baseline_path: Path to baseline thermal image
        candidate_path: Path to candidate thermal image
        model_path: Path to segmentation model (optional)
        
    Returns:
        Analysis results with segmentation information added
    """
    # Initialize segmentation
    segmentation = TransformerSegmentation(model_path=model_path)
    
    # Load images
    baseline_img = Image.open(baseline_path)
    candidate_img = Image.open(candidate_path)
    
    # Perform segmentation on candidate image
    mask, transformer_region, original_candidate = segmentation.segment_transformer(candidate_path)
    
    # If segmentation succeeded, apply it to both images
    if mask is not None:
        # Apply mask to candidate image
        candidate_masked = segmentation.apply_segmentation_mask(candidate_img, mask)
        
        # For baseline, we can either use the same mask or segment it separately
        # Here we'll use the same mask assuming similar transformer position
        baseline_masked = segmentation.apply_segmentation_mask(baseline_img, mask)
        
        # Crop to transformer region to focus analysis
        candidate_cropped, crop_offset = segmentation.crop_to_transformer(candidate_masked, mask)
        baseline_cropped, _ = segmentation.crop_to_transformer(baseline_masked, mask)
        
        analysis_baseline = baseline_cropped
        analysis_candidate = candidate_cropped
        
        segmentation_info = {
            'segmentation_applied': True,
            'transformer_bbox': segmentation.get_transformer_bbox(mask),
            'crop_offset': crop_offset,
            'mask_shape': mask.shape
        }
    else:
        # Fall back to original images if segmentation fails
        analysis_baseline = baseline_img
        analysis_candidate = candidate_img
        
        segmentation_info = {
            'segmentation_applied': False,
            'transformer_bbox': None,
            'crop_offset': (0, 0),
            'mask_shape': None
        }
    
    # Import and run the original analysis function
    sys.path.append(os.path.dirname(__file__))
    try:
        from analyze import analyze_pair
        results = analyze_pair(analysis_baseline, analysis_candidate)
        
        # Add segmentation information to results
        results['segmentation'] = segmentation_info
        
        return results
    
    except ImportError as e:
        print(f"Could not import original analyze function: {e}")
        return {'error': 'Analysis function not available', 'segmentation': segmentation_info}


def create_segmented_dataset(input_dir, output_dir, model_path=None):
    """
    Create a dataset of segmented transformer images from thermal images.
    
    Args:
        input_dir: Directory containing thermal images
        output_dir: Directory to save segmented images
        model_path: Path to segmentation model
    """
    # Initialize segmentation
    segmentation = TransformerSegmentation(model_path=model_path)
    
    if not segmentation.model_loaded:
        print("Cannot create segmented dataset without a trained model.")
        return
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Process all images in input directory
    image_files = []
    for ext in ['.jpg', '.jpeg', '.png', '.bmp']:
        image_files.extend([f for f in os.listdir(input_dir) if f.lower().endswith(ext)])
    
    processed_count = 0
    
    for image_file in image_files:
        input_path = os.path.join(input_dir, image_file)
        
        try:
            # Segment the image
            mask, transformer_region, original = segmentation.segment_transformer(input_path)
            
            if mask is not None and np.sum(mask == 1) > 0:  # If transformer found
                # Save segmented image
                base_name = os.path.splitext(image_file)[0]
                output_path = os.path.join(output_dir, f"{base_name}_segmented.png")
                
                cv2.imwrite(output_path, transformer_region)
                processed_count += 1
                
                if processed_count % 10 == 0:
                    print(f"Processed {processed_count} images...")
            
        except Exception as e:
            print(f"Error processing {image_file}: {str(e)}")
    
    print(f"Segmentation complete. Processed {processed_count} images.")


if __name__ == "__main__":
    # Example usage
    import argparse
    
    parser = argparse.ArgumentParser(description='Transformer segmentation utilities')
    parser.add_argument('--mode', choices=['analyze', 'segment_dataset'], default='analyze',
                       help='Operation mode')
    parser.add_argument('--baseline', type=str, help='Baseline image path (for analyze mode)')
    parser.add_argument('--candidate', type=str, help='Candidate image path (for analyze mode)')
    parser.add_argument('--input_dir', type=str, help='Input directory (for segment_dataset mode)')
    parser.add_argument('--output_dir', type=str, help='Output directory (for segment_dataset mode)')
    parser.add_argument('--model_path', type=str, help='Path to segmentation model')
    
    args = parser.parse_args()
    
    if args.mode == 'analyze':
        if args.baseline and args.candidate:
            results = analyze_with_segmentation(args.baseline, args.candidate, args.model_path)
            print("Analysis results:", results)
        else:
            print("Error: --baseline and --candidate are required for analyze mode")
    
    elif args.mode == 'segment_dataset':
        if args.input_dir and args.output_dir:
            create_segmented_dataset(args.input_dir, args.output_dir, args.model_path)
        else:
            print("Error: --input_dir and --output_dir are required for segment_dataset mode")