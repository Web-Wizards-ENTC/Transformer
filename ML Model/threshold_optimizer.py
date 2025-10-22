"""
Threshold Optimization Module

This module provides functionality to optimize detection parameters based on 
user feedback regarding bounding box annotations.

Command-line Arguments:
 1. Image file path (PNG format)
 2. JSON configuration file path

The module analyzes bounding box feedback against current detection parameters,
calculates metrics for each region, and outputs recommended parameter adjustments
in JSON format containing 'parameter_updates' and diagnostic 'notes'.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import cv2
import numpy as np
from PIL import Image

# Tolerance thresholds for parameter adjustment
SATURATION_TOLERANCE = 0.01
BRIGHTNESS_TOLERANCE = 0.01
CONTRAST_TOLERANCE = 0.01
HUE_INCREMENT = 0.01
AREA_RATIO_INCREMENT = 0.0005


def read_json_configuration(config_path: Path) -> Dict:
    """Load and parse JSON configuration from file."""
    with config_path.open("r", encoding="utf-8") as file_handle:
        return json.load(file_handle)


def process_image_file(img_path: Path) -> Tuple[np.ndarray, np.ndarray]:
    """
    Load image and convert to RGB and HSV color spaces.
    
    Returns:
        Tuple containing RGB array and HSV array (normalized)
    """
    img = Image.open(img_path).convert("RGB")
    rgb_array = np.asarray(img, dtype=np.float32) / 255.0
    # Convert RGB to HSV (BGR format required by OpenCV)
    hsv_array = cv2.cvtColor(rgb_array[:, :, ::-1], cv2.COLOR_BGR2HSV)
    hsv_array[:, :, 0] = hsv_array[:, :, 0] / 180.0  # Normalize hue to range [0, 1]
    return rgb_array, hsv_array


def calculate_region_metrics(bounding_box: Iterable[float],
                             hsv_data: np.ndarray,
                             avg_brightness: float,
                             hue_lower_bound: float,
                             hue_upper_bound: float) -> Dict:
    """
    Calculate statistical metrics for a given bounding box region.
    
    Args:
        bounding_box: Coordinates [x, y, width, height]
        hsv_data: HSV color space image array
        avg_brightness: Mean brightness value of entire image
        hue_lower_bound: Lower threshold for warm hue detection
        hue_upper_bound: Upper threshold for warm hue detection
        
    Returns:
        Dictionary containing region metrics or empty dict if invalid
    """
    x_coord, y_coord, box_width, box_height = [float(val) for val in bounding_box]
    img_height, img_width = hsv_data.shape[:2]
    
    x_start = max(0, int(math.floor(x_coord)))
    y_start = max(0, int(math.floor(y_coord)))
    x_end = min(img_width, int(math.ceil(x_coord + box_width)))
    y_end = min(img_height, int(math.ceil(y_coord + box_height)))
    
    if x_end <= x_start or y_end <= y_start:
        return {}

    roi = hsv_data[y_start:y_end, x_start:x_end]
    if roi.size == 0:
        return {}

    saturation_channel = roi[:, :, 1]
    brightness_channel = roi[:, :, 2]
    hue_channel = roi[:, :, 0]

    num_pixels = float(roi.shape[0] * roi.shape[1])
    total_img_pixels = float(img_height * img_width)

    avg_saturation = float(np.mean(saturation_channel))
    avg_brightness_roi = float(np.mean(brightness_channel))
    brightness_difference = float(np.mean(brightness_channel - avg_brightness))

    warm_pixel_mask = np.logical_or(hue_channel <= hue_lower_bound, 
                                     hue_channel >= hue_upper_bound)
    warm_pixel_ratio = float(np.sum(warm_pixel_mask)) / num_pixels if num_pixels else 0.0

    hue_angles = hue_channel * (2.0 * math.pi)
    sine_sum = float(np.sin(hue_angles).sum())
    cosine_sum = float(np.cos(hue_angles).sum())
    circular_mean_hue = math.atan2(sine_sum, cosine_sum) / (2.0 * math.pi)
    if circular_mean_hue < 0.0:
        circular_mean_hue += 1.0

    peak_brightness = float(brightness_channel.max()) if num_pixels else 0.0

    return {
        "pixel_count": num_pixels,
        "area_ratio": num_pixels / total_img_pixels if total_img_pixels else 0.0,
        "mean_saturation": avg_saturation,
        "mean_value": avg_brightness_roi,
        "mean_delta_value": brightness_difference,
        "warm_fraction": warm_pixel_ratio,
        "mean_hue": circular_mean_hue,
        "max_value": peak_brightness,
    }


def compute_parameter_adjustments(missed_detections: List[Dict],
                                  false_detections: List[Dict],
                                  current_params: Dict[str, float]) -> Dict[str, float]:
    """
    Compute parameter adjustments based on detection feedback.
    
    Args:
        missed_detections: Metrics for regions that should have been detected
        false_detections: Metrics for regions incorrectly detected
        current_params: Current parameter values
        
    Returns:
        Dictionary of parameter adjustments (deltas)
    """
    adjustment_map: Dict[str, float] = {}
    temporary_params = dict(current_params)

    def fetch_current_value(param_key: str) -> float:
        """Retrieve current parameter value with fallback."""
        return float(temporary_params.get(param_key, current_params.get(param_key, 0.0)))

    def register_adjustment(param_key: str, delta_value: float) -> None:
        """Apply and track parameter adjustment."""
        if not delta_value:
            return
        adjustment_map[param_key] = adjustment_map.get(param_key, 0.0) + delta_value
        temporary_params[param_key] = fetch_current_value(param_key) + delta_value

    def process_missed_detection(region_metrics: Dict) -> None:
        """Adjust parameters to capture missed detections."""
        if not region_metrics:
            return
            
        saturation_gap = fetch_current_value("warm_sat_threshold") - region_metrics["mean_saturation"]
        if saturation_gap > SATURATION_TOLERANCE:
            adjustment = -min(0.05, max(0.005, saturation_gap * 0.5))
            register_adjustment("warm_sat_threshold", adjustment)

        brightness_gap = fetch_current_value("warm_val_threshold") - region_metrics["mean_value"]
        if brightness_gap > BRIGHTNESS_TOLERANCE:
            adjustment = -min(0.05, max(0.005, brightness_gap * 0.5))
            register_adjustment("warm_val_threshold", adjustment)

        contrast_gap = fetch_current_value("contrast_threshold") - region_metrics["mean_delta_value"]
        if contrast_gap > CONTRAST_TOLERANCE:
            adjustment = -min(0.05, max(0.003, contrast_gap * 0.5))
            register_adjustment("contrast_threshold", adjustment)

        pixel_gap = fetch_current_value("min_area_pixels") - region_metrics["pixel_count"]
        if pixel_gap > 1.0:
            adjustment = -min(50.0, max(5.0, pixel_gap * 0.25))
            register_adjustment("min_area_pixels", adjustment)

        ratio_gap = fetch_current_value("min_area_ratio") - region_metrics["area_ratio"]
        if ratio_gap > 0.0:
            adjustment = -min(0.005, max(AREA_RATIO_INCREMENT, ratio_gap * 0.5))
            register_adjustment("min_area_ratio", adjustment)

        if region_metrics["warm_fraction"] >= 0.5:
            hue_value = region_metrics["mean_hue"]
            lower_hue_bound = fetch_current_value("warm_hue_low")
            upper_hue_bound = fetch_current_value("warm_hue_high")
            if hue_value < 0.5 and hue_value > lower_hue_bound:
                adjustment = min(HUE_INCREMENT, (hue_value - lower_hue_bound) * 0.5)
                register_adjustment("warm_hue_low", adjustment)
            elif hue_value >= 0.5 and hue_value < upper_hue_bound:
                adjustment = -min(HUE_INCREMENT, (upper_hue_bound - hue_value) * 0.5)
                register_adjustment("warm_hue_high", adjustment)

    def process_false_detection(region_metrics: Dict) -> None:
        """Adjust parameters to reduce false detections."""
        if not region_metrics:
            return
            
        saturation_gap = region_metrics["mean_saturation"] - fetch_current_value("warm_sat_threshold")
        if saturation_gap < -SATURATION_TOLERANCE:
            adjustment = min(0.05, max(0.005, -saturation_gap * 0.5))
            register_adjustment("warm_sat_threshold", adjustment)

        brightness_gap = region_metrics["mean_value"] - fetch_current_value("warm_val_threshold")
        if brightness_gap < -BRIGHTNESS_TOLERANCE:
            adjustment = min(0.05, max(0.005, -brightness_gap * 0.5))
            register_adjustment("warm_val_threshold", adjustment)

        contrast_gap = region_metrics["mean_delta_value"] - fetch_current_value("contrast_threshold")
        if contrast_gap < -CONTRAST_TOLERANCE:
            adjustment = min(0.05, max(0.003, -contrast_gap * 0.5))
            register_adjustment("contrast_threshold", adjustment)

        if region_metrics["pixel_count"] < fetch_current_value("min_area_pixels") * 1.2:
            adjustment = min(50.0, max(5.0, (fetch_current_value("min_area_pixels") - region_metrics["pixel_count"]) * 0.2))
            register_adjustment("min_area_pixels", adjustment)

        if region_metrics["area_ratio"] < fetch_current_value("min_area_ratio") * 1.2:
            register_adjustment("min_area_ratio", AREA_RATIO_INCREMENT)

        if region_metrics["warm_fraction"] >= 0.5:
            hue_value = region_metrics["mean_hue"]
            lower_hue_bound = fetch_current_value("warm_hue_low")
            upper_hue_bound = fetch_current_value("warm_hue_high")
            if hue_value < lower_hue_bound:
                adjustment = -min(HUE_INCREMENT, (lower_hue_bound - hue_value) * 0.5)
                register_adjustment("warm_hue_low", adjustment)
            elif hue_value > upper_hue_bound:
                adjustment = min(HUE_INCREMENT, (hue_value - upper_hue_bound) * 0.5)
                register_adjustment("warm_hue_high", adjustment)

    for metrics in missed_detections:
        process_missed_detection(metrics)
    for metrics in false_detections:
        process_false_detection(metrics)

    # Filter out negligible adjustments
    return {key: value for key, value in adjustment_map.items() if abs(value) >= 1e-6}


def generate_summary_report(missed_detections: List[Dict], false_detections: List[Dict]) -> str:
    """
    Generate a human-readable summary of detection analysis.
    
    Args:
        missed_detections: Metrics for missed regions
        false_detections: Metrics for false positive regions
        
    Returns:
        Summary string with key statistics
    """
    def compute_average(values: Iterable[float]) -> float:
        """Calculate mean of values."""
        value_list = list(values)
        return float(sum(value_list) / len(value_list)) if value_list else float("nan")

    def format_number(number: float) -> str:
        """Format float for display, handling special values."""
        if not math.isfinite(number):
            return "nan"
        return f"{number:.3f}"

    summary_parts = [
        f"added={len(missed_detections)}",
        f"removed={len(false_detections)}",
    ]
    if missed_detections:
        summary_parts.extend([
            f"add_sat={format_number(compute_average(m['mean_saturation'] for m in missed_detections))}",
            f"add_val={format_number(compute_average(m['mean_value'] for m in missed_detections))}",
            f"add_area={format_number(compute_average(m['area_ratio'] for m in missed_detections))}",
        ])
    if false_detections:
        summary_parts.extend([
            f"rem_sat={format_number(compute_average(m['mean_saturation'] for m in false_detections))}",
            f"rem_val={format_number(compute_average(m['mean_value'] for m in false_detections))}",
            f"rem_area={format_number(compute_average(m['area_ratio'] for m in false_detections))}",
        ])
    return " ".join(summary_parts)


def execute_optimization(command_args: List[str]) -> int:
    """
    Main execution function for threshold optimization.
    
    Args:
        command_args: Command line arguments
        
    Returns:
        Exit code (0 for success, 1 for error)
    """
    if len(command_args) != 3:
        print(json.dumps({"error": "expected arguments: candidate.png payload.json"}))
        return 1

    img_file_path = Path(command_args[1])
    config_file_path = Path(command_args[2])

    configuration = read_json_configuration(config_file_path)
    detection_params = {k: float(v) for k, v in configuration.get("parameters", {}).items()}

    _, hsv_data = process_image_file(img_file_path)
    overall_brightness = float(np.mean(hsv_data[:, :, 2]))

    hue_lower = float(detection_params.get("warm_hue_low", 0.17))
    hue_upper = float(detection_params.get("warm_hue_high", 0.95))

    boxes_to_add = configuration.get("addedBoxes") or []
    boxes_to_remove = configuration.get("removedBoxes") or []

    metrics_for_missed = [
        metrics for metrics in (calculate_region_metrics(box, hsv_data, overall_brightness, hue_lower, hue_upper) for box in boxes_to_add)
        if metrics
    ]
    metrics_for_false = [
        metrics for metrics in (calculate_region_metrics(box, hsv_data, overall_brightness, hue_lower, hue_upper) for box in boxes_to_remove)
        if metrics
    ]

    parameter_changes = compute_parameter_adjustments(metrics_for_missed, metrics_for_false, detection_params)
    summary_text = generate_summary_report(metrics_for_missed, metrics_for_false)

    output_result = {
        "parameter_updates": parameter_changes,
        "notes": summary_text,
        "addedCount": len(metrics_for_missed),
        "removedCount": len(metrics_for_false),
    }
    print(json.dumps(output_result))
    return 0


if __name__ == "__main__":
    sys.exit(execute_optimization(sys.argv))
