"""
U-Net Training Script for Thermal Image Segmentation

This script trains a U-Net model to segment transformers from thermal images.

Requirements:
- Training images in train_images/
- Corresponding masks in train_masks/
- Validation images in val_images/
- Corresponding masks in val_masks/

Usage:
    python train_unet.py [--epochs 50] [--batch-size 4] [--lr 0.001]
"""
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import numpy as np
import os
import argparse
from tqdm import tqdm
from unet_model import UNet


class ThermalSegmentationDataset(Dataset):
    """Dataset for thermal image segmentation"""
    def __init__(self, image_dir, mask_dir, transform=None, target_size=(256, 256)):
        self.image_dir = image_dir
        self.mask_dir = mask_dir
        self.transform = transform
        self.target_size = target_size
        
        # Get list of images
        self.images = [f for f in os.listdir(image_dir) 
                      if f.endswith(('.png', '.jpg', '.jpeg'))]
        
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        img_name = self.images[idx]
        img_path = os.path.join(self.image_dir, img_name)
        
        # Find corresponding mask (may have different extension)
        base_name = os.path.splitext(img_name)[0]
        mask_files = [f for f in os.listdir(self.mask_dir) 
                     if f.startswith(base_name)]
        
        if not mask_files:
            raise FileNotFoundError(f"No mask found for {img_name}")
        
        mask_path = os.path.join(self.mask_dir, mask_files[0])
        
        # Load image and mask
        image = Image.open(img_path).convert('RGB')
        mask = Image.open(mask_path).convert('L')
        
        # Resize
        image = image.resize(self.target_size, Image.Resampling.LANCZOS)
        mask = mask.resize(self.target_size, Image.Resampling.NEAREST)
        
        # Convert to tensors
        image = np.array(image).astype(np.float32) / 255.0
        mask = np.array(mask).astype(np.float32) / 255.0
        
        image = torch.from_numpy(image).permute(2, 0, 1)  # [C, H, W]
        mask = torch.from_numpy(mask).unsqueeze(0)  # [1, H, W]
        
        # Apply transforms
        if self.transform:
            image = self.transform(image)
        
        return image, mask


def dice_loss(pred, target, smooth=1e-5):
    """Dice loss for segmentation"""
    pred = pred.contiguous()
    target = target.contiguous()
    
    intersection = (pred * target).sum(dim=2).sum(dim=2)
    union = pred.sum(dim=2).sum(dim=2) + target.sum(dim=2).sum(dim=2)
    
    dice = (2. * intersection + smooth) / (union + smooth)
    
    return 1 - dice.mean()


def combined_loss(pred, target):
    """Combined BCE and Dice loss"""
    bce = nn.BCELoss()(pred, target)
    dice = dice_loss(pred, target)
    return bce + dice


def train_epoch(model, loader, optimizer, criterion, device):
    """Train for one epoch"""
    model.train()
    total_loss = 0
    
    pbar = tqdm(loader, desc='Training')
    for images, masks in pbar:
        images = images.to(device)
        masks = masks.to(device)
        
        # Forward
        outputs = model(images)
        loss = criterion(outputs, masks)
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        pbar.set_postfix({'loss': f'{loss.item():.4f}'})
    
    return total_loss / len(loader)


def validate(model, loader, criterion, device):
    """Validate the model"""
    model.eval()
    total_loss = 0
    
    with torch.no_grad():
        for images, masks in tqdm(loader, desc='Validating'):
            images = images.to(device)
            masks = masks.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, masks)
            
            total_loss += loss.item()
    
    return total_loss / len(loader)


def train_model(train_dir='train_images', train_mask_dir='train_masks',
                val_dir='val_images', val_mask_dir='val_masks',
                epochs=50, batch_size=4, lr=0.001, save_dir='models'):
    """Train U-Net model"""
    
    # Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Create datasets
    print("Loading datasets...")
    train_dataset = ThermalSegmentationDataset(train_dir, train_mask_dir)
    val_dataset = ThermalSegmentationDataset(val_dir, val_mask_dir)
    
    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")
    
    # Create dataloaders
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    
    # Create model
    model = UNet(in_channels=3, out_channels=1)
    model = model.to(device)
    
    # Optimizer and loss
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = combined_loss
    
    # Training loop
    best_val_loss = float('inf')
    os.makedirs(save_dir, exist_ok=True)
    
    print(f"\nStarting training for {epochs} epochs...")
    for epoch in range(epochs):
        print(f"\nEpoch {epoch+1}/{epochs}")
        
        train_loss = train_epoch(model, train_loader, optimizer, criterion, device)
        val_loss = validate(model, val_loader, criterion, device)
        
        print(f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_loss': val_loss,
            }, os.path.join(save_dir, 'best_model.pth'))
            print(f"✓ Best model saved (val_loss: {val_loss:.4f})")
        
        # Save latest checkpoint
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'val_loss': val_loss,
        }, os.path.join(save_dir, 'latest_checkpoint.pth'))
    
    print(f"\n✓ Training complete! Best val loss: {best_val_loss:.4f}")


def main():
    parser = argparse.ArgumentParser(description='Train U-Net for thermal segmentation')
    parser.add_argument('--train-images', default='train_images', help='Training images directory')
    parser.add_argument('--train-masks', default='train_masks', help='Training masks directory')
    parser.add_argument('--val-images', default='val_images', help='Validation images directory')
    parser.add_argument('--val-masks', default='val_masks', help='Validation masks directory')
    parser.add_argument('--epochs', type=int, default=50, help='Number of epochs')
    parser.add_argument('--batch-size', type=int, default=4, help='Batch size')
    parser.add_argument('--lr', type=float, default=0.001, help='Learning rate')
    parser.add_argument('--save-dir', default='models', help='Model save directory')
    
    args = parser.parse_args()
    
    train_model(
        train_dir=args.train_images,
        train_mask_dir=args.train_masks,
        val_dir=args.val_images,
        val_mask_dir=args.val_masks,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        save_dir=args.save_dir
    )


if __name__ == '__main__':
    main()
