# Machine Vision Implementation Patterns

## Basic Image Processing Pipeline

```python
import cv2
import numpy as np

def process_image(image_path):
    # Read image
    img = cv2.imread(image_path)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Denoise
    denoised = cv2.GaussianBlur(gray, (5, 5), 0)

    # Edge detection
    edges = cv2.Canny(denoised, 50, 150)

    return edges
```

## Object Detection with Contours

```python
def detect_objects(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Threshold
    _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

    # Find contours
    contours, _ = cv2.findContours(
        binary,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    # Filter by area
    objects = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 100:
            x, y, w, h = cv2.boundingRect(cnt)
            objects.append((x, y, w, h))

    return objects
```

## Template Matching

```python
def find_template(image, template):
    result = cv2.matchTemplate(image, template, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

    threshold = 0.8
    if max_val >= threshold:
        h, w = template.shape[:2]
        top_left = max_loc
        bottom_right = (top_left[0] + w, top_left[1] + h)
        return top_left, bottom_right, max_val

    return None
```

## Feature Matching

```python
def match_features(img1, img2):
    # Detect ORB features
    orb = cv2.ORB_create()
    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2, None)

    # Match features
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(des1, des2)

    # Sort by distance
    matches = sorted(matches, key=lambda x: x.distance)

    return matches[:50]
```

## Color-based Segmentation

```python
def segment_by_color(image, lower_hsv, upper_hsv):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Create mask
    mask = cv2.inRange(hsv, lower_hsv, upper_hsv)

    # Morphology to clean up
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    # Apply mask
    result = cv2.bitwise_and(image, image, mask=mask)

    return result, mask
```

## Camera Calibration

```python
def calibrate_camera(images, pattern_size=(9, 6)):
    objp = np.zeros((pattern_size[0] * pattern_size[1], 3), np.float32)
    objp[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)

    objpoints = []
    imgpoints = []

    for img in images:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        ret, corners = cv2.findChessboardCorners(gray, pattern_size, None)

        if ret:
            objpoints.append(objp)
            imgpoints.append(corners)

    ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(
        objpoints, imgpoints, gray.shape[::-1], None, None
    )

    return mtx, dist
```

## Real-time Video Processing

```python
def process_video(video_path):
    cap = cv2.VideoCapture(video_path)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Process frame
        processed = process_frame(frame)

        # Display
        cv2.imshow('Processed', processed)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

def process_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    return edges
```

## Morphological Operations

```python
def clean_binary_image(binary_img):
    # Remove small noise
    kernel = np.ones((3, 3), np.uint8)
    opening = cv2.morphologyEx(binary_img, cv2.MORPH_OPEN, kernel, iterations=2)

    # Fill small holes
    closing = cv2.morphologyEx(opening, cv2.MORPH_CLOSE, kernel, iterations=2)

    return closing
```

## Adaptive Thresholding

```python
def adaptive_threshold(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Gaussian adaptive threshold
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11, 2
    )

    return binary
```

## Hough Transform

```python
def detect_lines(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)

    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi/180,
        threshold=100,
        minLineLength=100,
        maxLineGap=10
    )

    return lines

def detect_circles(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 5)

    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1,
        minDist=20,
        param1=50,
        param2=30,
        minRadius=0,
        maxRadius=0
    )

    return circles
```

## Performance Optimization

```python
# Use numpy vectorization
def fast_threshold(image, threshold):
    return (image > threshold).astype(np.uint8) * 255

# Resize for faster processing
def process_large_image(image):
    scale = 0.5
    small = cv2.resize(image, None, fx=scale, fy=scale)
    processed = process_image(small)
    result = cv2.resize(processed, (image.shape[1], image.shape[0]))
    return result

# Use ROI (Region of Interest)
def process_roi(image, x, y, w, h):
    roi = image[y:y+h, x:x+w]
    processed_roi = process_image(roi)
    image[y:y+h, x:x+w] = processed_roi
    return image
```

## Common Patterns

### Error Handling

```python
def safe_imread(path):
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Failed to load image: {path}")
    return img
```

### Parameter Validation

```python
def validate_kernel_size(ksize):
    if ksize % 2 == 0:
        raise ValueError("Kernel size must be odd")
    if ksize < 3:
        raise ValueError("Kernel size must be >= 3")
```

### Visualization

```python
def show_comparison(original, processed, title="Comparison"):
    combined = np.hstack([original, processed])
    cv2.imshow(title, combined)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```
