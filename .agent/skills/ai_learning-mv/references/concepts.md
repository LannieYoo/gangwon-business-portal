# Machine Vision Concepts Reference

## Image Fundamentals

**Digital Image:** 2D array of pixels with intensity values

- Grayscale: Single channel (0-255)
- RGB: Three channels (Red, Green, Blue)
- Resolution: Width × Height pixels
- Bit depth: Bits per pixel (8-bit, 16-bit)

**Coordinate System:** Origin (0,0) at top-left, x-axis right, y-axis down

## Image Preprocessing

### Filtering

**Smoothing (Low-pass):**

- Gaussian: Weighted average, reduces noise
- Median: Replaces with median, removes salt-pepper noise
- Bilateral: Edge-preserving smoothing

**Sharpening (High-pass):**

- Laplacian: Detects rapid intensity changes
- Unsharp masking: Original + (Original - Blurred)

### Morphological Operations

**Basic Operations:**

- Erosion: Shrinks objects, removes noise
- Dilation: Expands objects, fills holes
- Opening: Erosion then dilation (removes small objects)
- Closing: Dilation then erosion (fills small holes)

**Structuring Element:** Kernel shape (rectangle, ellipse, cross)

## Edge Detection

**Gradient-based:**

- Sobel: Approximates gradient with 3×3 kernels
- Prewitt: Similar to Sobel, different weights
- Scharr: More accurate gradient estimation

**Canny Edge Detector:**

1. Gaussian smoothing
2. Gradient calculation
3. Non-maximum suppression
4. Double thresholding
5. Edge tracking by hysteresis

## Feature Extraction

### Corner Detection

**Harris Corner:**

```
R = det(M) - k(trace(M))²
M = Σ [Ix² IxIy]
      [IxIy Iy²]
```

**Shi-Tomasi:** Uses minimum eigenvalue instead

### Blob Detection

**LoG (Laplacian of Gaussian):** Detects regions of rapid intensity change

**DoG (Difference of Gaussians):** Approximates LoG, faster computation

### Feature Descriptors

**SIFT (Scale-Invariant Feature Transform):**

- Scale-space extrema detection
- Keypoint localization
- Orientation assignment
- Descriptor generation (128-dim)

**ORB (Oriented FAST and Rotated BRIEF):**

- FAST keypoint detector
- BRIEF descriptor with rotation invariance
- Faster than SIFT, free to use

## Image Segmentation

### Thresholding

**Global:** Single threshold for entire image

```
Binary: I(x,y) > T → 255, else 0
```

**Adaptive:** Local threshold based on neighborhood

**Otsu's Method:** Automatically finds optimal threshold

### Region-based

**Watershed:** Treats image as topographic surface
**Region Growing:** Starts from seed, adds similar neighbors

### Contour-based

**Active Contours (Snakes):** Energy minimization
**GrabCut:** Interactive foreground extraction

## Object Detection

### Template Matching

Cross-correlation between template and image

```
R(x,y) = Σ [T(x',y') · I(x+x', y+y')]
```

### Cascade Classifiers

**Haar Cascades:** Fast face/object detection

- Haar-like features
- AdaBoost training
- Cascade of weak classifiers

### Modern Approaches

**HOG (Histogram of Oriented Gradients):** Pedestrian detection
**Deep Learning:** CNN-based (YOLO, SSD, Faster R-CNN)

## Camera Calibration

### Intrinsic Parameters

- Focal length (fx, fy)
- Principal point (cx, cy)
- Distortion coefficients (k1, k2, p1, p2)

### Extrinsic Parameters

- Rotation matrix (R)
- Translation vector (t)

**Calibration Process:**

1. Capture checkerboard images
2. Detect corners
3. Solve PnP problem
4. Optimize parameters

## Color Spaces

**RGB:** Red, Green, Blue (device-dependent)
**HSV:** Hue, Saturation, Value (intuitive for color selection)
**LAB:** Lightness, A (green-red), B (blue-yellow) (perceptually uniform)
**YCrCb:** Luminance + Chrominance (used in JPEG)

## Performance Metrics

**Accuracy:** (TP + TN) / Total
**Precision:** TP / (TP + FP)
**Recall:** TP / (TP + FN)
**F1-Score:** 2 × (Precision × Recall) / (Precision + Recall)
**IoU:** Intersection over Union for object detection
