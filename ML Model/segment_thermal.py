""""""

Thermal Image Segmentation using U-NetInference script for U-Net segmentation model.

This script loads a trained model and performs segmentation on new thermal images.

This script loads a pre-trained U-Net model and segments thermal images"""

to isolate transformers from the background.

import os

Usage:import argparse

    python segment_thermal.py <input_image> [--output <output_path>] [--model <model_path>]import numpy as np

import torch

Output:import cv2

    - Segmented image (transformer isolated)from PIL import Image

    - Binary maskimport matplotlib.pyplot as plt

"""

import torchfrom unet_model import create_unet_model

import torch.nn as nnfrom data_utils import preprocess_thermal_image, postprocess_mask, create_mask_overlay, visualize_predictions

from PIL import Image

import numpy as np

import sysclass ThermalSegmentationInference:

import os    """

import argparse    Inference class for thermal image segmentation using trained U-Net model.

from unet_model import UNet    """

    

    def __init__(self, model_path, device=None, image_size=(256, 256)):

def load_model(model_path='models/best_model.pth', device='cpu'):        """

    """Load pre-trained U-Net model"""        Initialize the inference pipeline.

    model = UNet(in_channels=3, out_channels=1)        

            Args:

    if os.path.exists(model_path):            model_path: Path to the trained model checkpoint

        checkpoint = torch.load(model_path, map_location=device)            device: Device to run inference on (cuda/cpu)

                    image_size: Input image size for the model

        # Handle different checkpoint formats        """

        if isinstance(checkpoint, dict):        self.device = device if device else torch.device('cuda' if torch.cuda.is_available() else 'cpu')

            if 'model_state_dict' in checkpoint:        self.image_size = image_size

                model.load_state_dict(checkpoint['model_state_dict'])        

            elif 'state_dict' in checkpoint:        # Load model

                model.load_state_dict(checkpoint['state_dict'])        self.model = self._load_model(model_path)

            else:        self.model.eval()

                model.load_state_dict(checkpoint)        

        else:        print(f"Model loaded on device: {self.device}")

            model.load_state_dict(checkpoint)    

            def _load_model(self, model_path):

        model.to(device)        """Load trained model from checkpoint"""

        model.eval()        if not os.path.exists(model_path):

        print(f"✓ Model loaded from {model_path}")            raise FileNotFoundError(f"Model file not found: {model_path}")

        return model        

    else:        # Load checkpoint

        raise FileNotFoundError(f"Model not found: {model_path}")        checkpoint = torch.load(model_path, map_location=self.device)

        

        # Create model with same configuration

def preprocess_image(image_path, target_size=(256, 256)):        config = checkpoint.get('config', {})

    """Load and preprocess image for segmentation"""        n_channels = config.get('n_channels', 3)

    img = Image.open(image_path).convert('RGB')        n_classes = config.get('n_classes', 2)

    original_size = img.size  # (width, height)        bilinear = config.get('bilinear', False)

            

    # Resize to model input size        model = create_unet_model(n_channels=n_channels, n_classes=n_classes, bilinear=bilinear)

    img_resized = img.resize(target_size, Image.Resampling.LANCZOS)        

            # Load state dict

    # Convert to tensor and normalize        model.load_state_dict(checkpoint['model_state_dict'])

    img_array = np.array(img_resized).astype(np.float32) / 255.0        model = model.to(self.device)

    img_tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0)  # [1, 3, H, W]        

            print(f"Model loaded from epoch {checkpoint.get('epoch', 'unknown')}")

    return img_tensor, img, original_size        print(f"Model validation IoU: {checkpoint.get('mean_iou', 'unknown'):.4f}")

        

        return model

def segment_image(model, image_tensor, device='cpu', threshold=0.5):    

    """Run segmentation on image"""    def predict_single_image(self, image_path, save_mask=True, save_overlay=True, output_dir=None):

    with torch.no_grad():        """

        image_tensor = image_tensor.to(device)        Perform segmentation on a single image.

        mask = model(image_tensor)  # [1, 1, H, W]        

        mask = (mask > threshold).float()        Args:

                image_path: Path to input image

    return mask            save_mask: Whether to save the segmentation mask

            save_overlay: Whether to save mask overlay on original image

            output_dir: Directory to save results

def postprocess_mask(mask, original_size):            

    """Convert mask tensor back to PIL Image"""        Returns:

    mask_np = mask.squeeze().cpu().numpy()  # [H, W]            Dictionary containing original image, predicted mask, and paths

    mask_img = Image.fromarray((mask_np * 255).astype(np.uint8), mode='L')        """

            # Preprocess image

    # Resize back to original size        image_tensor, original_image, original_size = preprocess_thermal_image(

    mask_img = mask_img.resize(original_size, Image.Resampling.LANCZOS)            image_path, self.image_size

            )

    return mask_img        image_tensor = image_tensor.to(self.device)

        

        # Perform inference

def apply_mask(image, mask):        with torch.no_grad():

    """Apply mask to image to isolate transformer"""            outputs = self.model(image_tensor)

    img_array = np.array(image)            probabilities = torch.softmax(outputs, dim=1)

    mask_array = np.array(mask).astype(np.float32) / 255.0            predicted_mask = torch.argmax(outputs, dim=1)

            

    # Apply mask to each channel        # Postprocess mask

    segmented = img_array.copy()        mask_np = postprocess_mask(predicted_mask, original_size)

    for c in range(3):        

        segmented[:, :, c] = (img_array[:, :, c] * mask_array).astype(np.uint8)        # Prepare output directory

            if output_dir is None:

    return Image.fromarray(segmented)            output_dir = os.path.dirname(image_path)

        os.makedirs(output_dir, exist_ok=True)

        

def segment_thermal_image(image_path, model_path='models/best_model.pth',         # Generate output filenames

                         output_path=None, return_results=False):        base_name = os.path.splitext(os.path.basename(image_path))[0]

    """        mask_path = os.path.join(output_dir, f"{base_name}_segmented.png")

    Complete segmentation pipeline        overlay_path = os.path.join(output_dir, f"{base_name}_overlay.png")

            

    Args:        results = {

        image_path: Path to input thermal image            'original_image': original_image,

        model_path: Path to pre-trained model            'predicted_mask': mask_np,

        output_path: Path to save segmented image (optional)            'probabilities': probabilities.cpu().numpy(),

        return_results: If True, returns (segmented_img, mask_img) instead of saving            'input_path': image_path,

                'mask_path': mask_path,

    Returns:            'overlay_path': overlay_path

        If return_results=True: (segmented_image, mask_image) as PIL Images        }

        If return_results=False: None (saves to disk)        

    """        # Save mask

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')        if save_mask:

    print(f"Using device: {device}")            cv2.imwrite(mask_path, mask_np * 255)  # Scale to 0-255

                print(f"Segmentation mask saved: {mask_path}")

    # Load model        

    model = load_model(model_path, device)        # Save overlay

            if save_overlay:

    # Load and preprocess image            overlay_image = create_mask_overlay(

    print(f"Processing: {image_path}")                cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB), 

    img_tensor, original_img, original_size = preprocess_image(image_path)                mask_np, 

                    alpha=0.4,

    # Segment                colors=[(0, 0, 0), (255, 0, 0)]  # Black background, Red transformer

    mask_tensor = segment_image(model, img_tensor, device)            )

                cv2.imwrite(overlay_path, cv2.cvtColor(overlay_image, cv2.COLOR_RGB2BGR))

    # Postprocess            print(f"Overlay image saved: {overlay_path}")

    mask_img = postprocess_mask(mask_tensor, original_size)        

    segmented_img = apply_mask(original_img, mask_img)        return results

        

    if return_results:    def predict_batch(self, image_paths, output_dir, batch_size=8):

        return segmented_img, mask_img        """

            Perform segmentation on multiple images.

    # Save results        

    if output_path is None:        Args:

        base_name = os.path.splitext(os.path.basename(image_path))[0]            image_paths: List of image paths

        output_dir = 'results'            output_dir: Directory to save results

        os.makedirs(output_dir, exist_ok=True)            batch_size: Batch size for processing

        output_path = os.path.join(output_dir, f"{base_name}_segmented.png")            

        mask_path = os.path.join(output_dir, f"{base_name}_mask.png")        Returns:

    else:            List of result dictionaries

        base_path = os.path.splitext(output_path)[0]        """

        mask_path = f"{base_path}_mask.png"        os.makedirs(output_dir, exist_ok=True)

            all_results = []

    segmented_img.save(output_path)        

    mask_img.save(mask_path)        for i in range(0, len(image_paths), batch_size):

                batch_paths = image_paths[i:i+batch_size]

    print(f"✓ Segmented image saved: {output_path}")            print(f"Processing batch {i//batch_size + 1}/{(len(image_paths)-1)//batch_size + 1}")

    print(f"✓ Mask saved: {mask_path}")            

                for image_path in batch_paths:

    return None                try:

                    results = self.predict_single_image(

                        image_path, 

def main():                        save_mask=True, 

    parser = argparse.ArgumentParser(description='Segment thermal images using U-Net')                        save_overlay=True, 

    parser.add_argument('input', help='Input thermal image path')                        output_dir=output_dir

    parser.add_argument('--output', '-o', help='Output path for segmented image')                    )

    parser.add_argument('--model', '-m', default='models/best_model.pth',                    all_results.append(results)

                       help='Path to pre-trained model (default: models/best_model.pth)')                except Exception as e:

    parser.add_argument('--threshold', '-t', type=float, default=0.5,                    print(f"Error processing {image_path}: {str(e)}")

                       help='Segmentation threshold (default: 0.5)')                    continue

            

    args = parser.parse_args()        return all_results

        

    try:    def predict_directory(self, input_dir, output_dir, extensions=None):

        segment_thermal_image(args.input, args.model, args.output)        """

    except Exception as e:        Perform segmentation on all images in a directory.

        print(f"Error: {e}")        

        sys.exit(1)        Args:

            input_dir: Input directory with images

            output_dir: Output directory for results

if __name__ == '__main__':            extensions: List of file extensions to process

    main()            

        Returns:
            List of result dictionaries
        """
        if extensions is None:
            extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
        
        # Find all image files
        image_paths = []
        for ext in extensions:
            image_paths.extend([
                os.path.join(input_dir, f) 
                for f in os.listdir(input_dir) 
                if f.lower().endswith(ext.lower())
            ])
        
        print(f"Found {len(image_paths)} images in {input_dir}")
        
        return self.predict_batch(image_paths, output_dir)
    
    def get_segmented_region(self, image_path, class_id=1):
        """
        Extract only the segmented region from an image.
        
        Args:
            image_path: Path to input image
            class_id: Class ID to extract (1 for transformer)
            
        Returns:
            Image with only the segmented region, rest masked out
        """
        results = self.predict_single_image(image_path, save_mask=False, save_overlay=False)
        
        original_image = results['original_image']
        mask = results['predicted_mask']
        
        # Create masked image
        masked_image = original_image.copy()
        masked_image[mask != class_id] = 0  # Set non-transformer pixels to black
        
        return masked_image, mask
    
    def analyze_segmentation_statistics(self, results_list):
        """
        Analyze statistics across multiple segmentation results.
        
        Args:
            results_list: List of result dictionaries from predictions
            
        Returns:
            Dictionary with analysis statistics
        """
        stats = {
            'total_images': len(results_list),
            'transformer_pixel_ratios': [],
            'average_transformer_ratio': 0.0,
            'images_with_transformers': 0,
            'images_without_transformers': 0
        }
        
        for results in results_list:
            mask = results['predicted_mask']
            total_pixels = mask.size
            transformer_pixels = np.sum(mask == 1)  # Assuming class 1 is transformer
            
            ratio = transformer_pixels / total_pixels
            stats['transformer_pixel_ratios'].append(ratio)
            
            if transformer_pixels > 0:
                stats['images_with_transformers'] += 1
            else:
                stats['images_without_transformers'] += 1
        
        if stats['transformer_pixel_ratios']:
            stats['average_transformer_ratio'] = np.mean(stats['transformer_pixel_ratios'])
            stats['std_transformer_ratio'] = np.std(stats['transformer_pixel_ratios'])
            stats['min_transformer_ratio'] = np.min(stats['transformer_pixel_ratios'])
            stats['max_transformer_ratio'] = np.max(stats['transformer_pixel_ratios'])
        
        return stats


def main():
    """Main inference function"""
    parser = argparse.ArgumentParser(description='Perform inference with trained U-Net model')
    parser.add_argument('--model_path', type=str, required=True, 
                       help='Path to trained model checkpoint')
    parser.add_argument('--input_path', type=str, required=True, 
                       help='Path to input image or directory')
    parser.add_argument('--output_dir', type=str, default='segmentation_results', 
                       help='Output directory for results')
    parser.add_argument('--image_size', type=int, default=256, 
                       help='Input image size for model')
    parser.add_argument('--batch_size', type=int, default=8, 
                       help='Batch size for processing multiple images')
    parser.add_argument('--visualize', action='store_true', 
                       help='Show visualization of results')
    
    args = parser.parse_args()
    
    # Initialize inference pipeline
    inference = ThermalSegmentationInference(
        model_path=args.model_path,
        image_size=(args.image_size, args.image_size)
    )
    
    # Check if input is file or directory
    if os.path.isfile(args.input_path):
        # Single image inference
        print(f"Processing single image: {args.input_path}")
        results = inference.predict_single_image(
            args.input_path, 
            save_mask=True, 
            save_overlay=True, 
            output_dir=args.output_dir
        )
        
        if args.visualize:
            visualize_predictions(
                cv2.cvtColor(results['original_image'], cv2.COLOR_BGR2RGB),
                results['predicted_mask']
            )
    
    elif os.path.isdir(args.input_path):
        # Directory inference
        print(f"Processing directory: {args.input_path}")
        results_list = inference.predict_directory(args.input_path, args.output_dir)
        
        # Print statistics
        stats = inference.analyze_segmentation_statistics(results_list)
        print("\nSegmentation Statistics:")
        print(f"Total images processed: {stats['total_images']}")
        print(f"Images with transformers: {stats['images_with_transformers']}")
        print(f"Images without transformers: {stats['images_without_transformers']}")
        print(f"Average transformer pixel ratio: {stats['average_transformer_ratio']:.4f}")
        
        if args.visualize and results_list:
            # Show first few results
            for i, results in enumerate(results_list[:3]):
                visualize_predictions(
                    cv2.cvtColor(results['original_image'], cv2.COLOR_BGR2RGB),
                    results['predicted_mask']
                )
    
    else:
        print(f"Error: {args.input_path} is not a valid file or directory")


if __name__ == "__main__":
    main()