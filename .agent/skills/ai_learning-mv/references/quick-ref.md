# Machine Vision Quick Reference

## Common OpenCV Functions

| Task                | Function                               | Key Parameters                  |
| ------------------- | -------------------------------------- | ------------------------------- |
| Read image          | `cv2.imread()`                         | path, flags (COLOR/GRAYSCALE)   |
| Display image       | `cv2.imshow()`                         | window_name, image              |
| Save image          | `cv2.imwrite()`                        | path, image                     |
| Resize              | `cv2.resize()`                         | image, dsize, interpolation     |
| Gaussian blur       | `cv2.GaussianBlur()`                   | image, ksize, sigmaX            |
| Median blur         | `cv2.medianBlur()`                     | image, ksize                    |
| Canny edges         | `cv2.Canny()`                          | image, threshold1, threshold2   |
| Threshold           | `cv2.threshold()`                      | image, thresh, maxval, type     |
| Adaptive threshold  | `cv2.adaptiveThreshold()`              | image, maxval, method, type     |
| Find contours       | `cv2.findContours()`                   | image, mode, method             |
| Draw contours       | `cv2.drawContours()`                   | image, contours, idx, color     |
| Morphology          | `cv2.morphologyEx()`                   | image, op, kernel               |
| Color conversion    | `cv2.cvtColor()`                       | image, code                     |
| Template match      | `cv2.matchTemplate()`                  | image, template, method         |
| Harris corners      | `cv2.cornerHarris()`                   | image, blockSize, ksize, k      |
| Good features       | `cv2.goodFeaturesToTrack()`            | image, maxCorners, quality, min |
| Hough lines         | `cv2.HoughLinesP()`                    | image, rho, theta, threshold    |
| Hough circles       | `cv2.HoughCircles()`                   | image, method, dp, minDist      |
| Camera calibration  | `cv2.calibrateCamera()`                | objpoints, imgpoints, imageSize |
| Undistort           | `cv2.undistort()`                      | image, cameraMatrix, distCoeffs |
| Perspective warp    | `cv2.warpPerspective()`                | image, M, dsize                 |
| SIFT detector       | `cv2.SIFT_create()`                    | nfeatures, nOctaveLayers        |
| ORB detector        | `cv2.ORB_create()`                     | nfeatures, scaleFactor          |
| Feature matching    | `cv2.BFMatcher()`                      | normType, crossCheck            |
| Cascade classifier  | `cv2.CascadeClassifier()`              | filename                        |
| Background subtract | `cv2.createBackgroundSubtractorMOG2()` | history, varThreshold           |

## Kernel Sizes

**Gaussian Blur:** 3×3, 5×5, 7×7 (odd numbers)
**Median Blur:** 3, 5, 7 (odd numbers)
**Morphology:** 3×3, 5×5 (depends on object size)

## Threshold Types

- `cv2.THRESH_BINARY`: > thresh → maxval, else 0
- `cv2.THRESH_BINARY_INV`: Inverted binary
- `cv2.THRESH_OTSU`: Auto threshold (combine with BINARY)
- `cv2.ADAPTIVE_THRESH_MEAN_C`: Mean of neighborhood
- `cv2.ADAPTIVE_THRESH_GAUSSIAN_C`: Weighted sum

## Morphological Operations

- `cv2.MORPH_ERODE`: Erosion
- `cv2.MORPH_DILATE`: Dilation
- `cv2.MORPH_OPEN`: Opening (erosion → dilation)
- `cv2.MORPH_CLOSE`: Closing (dilation → erosion)
- `cv2.MORPH_GRADIENT`: Morphological gradient
- `cv2.MORPH_TOPHAT`: Top hat
- `cv2.MORPH_BLACKHAT`: Black hat

## Color Conversion Codes

- `cv2.COLOR_BGR2GRAY`: BGR to grayscale
- `cv2.COLOR_BGR2RGB`: BGR to RGB
- `cv2.COLOR_BGR2HSV`: BGR to HSV
- `cv2.COLOR_BGR2LAB`: BGR to LAB
- `cv2.COLOR_GRAY2BGR`: Grayscale to BGR

## Contour Retrieval Modes

- `cv2.RETR_EXTERNAL`: Only external contours
- `cv2.RETR_LIST`: All contours, no hierarchy
- `cv2.RETR_TREE`: Full hierarchy tree

## Contour Approximation

- `cv2.CHAIN_APPROX_NONE`: All points
- `cv2.CHAIN_APPROX_SIMPLE`: Compress segments

## Common Issues & Fixes

**Blurry edges:** Reduce blur kernel size
**Too much noise:** Increase blur, use morphology
**Missing objects:** Adjust threshold, check preprocessing
**Slow processing:** Resize image, optimize algorithm
**Poor lighting:** Histogram equalization, adaptive threshold
**Distorted image:** Camera calibration, undistort

## Typical Processing Pipeline

1. **Acquisition:** Read image
2. **Preprocessing:** Resize, color conversion, noise reduction
3. **Enhancement:** Histogram equalization, contrast adjustment
4. **Segmentation:** Thresholding, edge detection
5. **Morphology:** Clean up binary image
6. **Feature Extraction:** Contours, corners, blobs
7. **Analysis:** Measure, classify, detect
8. **Visualization:** Draw results, display

## Performance Tips

- Convert to grayscale if color not needed
- Resize large images before processing
- Use integral images for fast filtering
- Cache repeated calculations
- Use GPU acceleration (cv2.cuda)
- Profile code to find bottlenecks
