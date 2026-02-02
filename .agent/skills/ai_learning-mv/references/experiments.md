# Machine Vision Experiments

## Experiment Template

```python
import cv2
import numpy as np
import matplotlib.pyplot as plt

class VisionExperiment:
    def __init__(self, name):
        self.name = name
        self.results = []

    def run(self, image, params):
        raise NotImplementedError

    def visualize(self):
        raise NotImplementedError

    def save_results(self, path):
        raise NotImplementedError
```

## Experiment 1: Noise Reduction Comparison

```python
def compare_denoising(image):
    noisy = add_noise(image, noise_type='gaussian', sigma=25)

    methods = {
        'Gaussian': cv2.GaussianBlur(noisy, (5, 5), 0),
        'Median': cv2.medianBlur(noisy, 5),
        'Bilateral': cv2.bilateralFilter(noisy, 9, 75, 75),
        'NLMeans': cv2.fastNlMeansDenoising(noisy, None, 10, 7, 21)
    }

    # Calculate PSNR
    results = {}
    for name, denoised in methods.items():
        psnr = calculate_psnr(image, denoised)
        results[name] = psnr

    return methods, results

def add_noise(image, noise_type='gaussian', sigma=25):
    if noise_type == 'gaussian':
        noise = np.random.normal(0, sigma, image.shape)
        noisy = np.clip(image + noise, 0, 255).astype(np.uint8)
    return noisy

def calculate_psnr(original, processed):
    mse = np.mean((original - processed) ** 2)
    if mse == 0:
        return float('inf')
    max_pixel = 255.0
    psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
    return psnr
```

## Experiment 2: Edge Detection Parameter Tuning

```python
def tune_canny_parameters(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Test different threshold combinations
    thresholds = [(50, 150), (30, 100), (100, 200), (20, 80)]

    results = []
    for low, high in thresholds:
        edges = cv2.Canny(gray, low, high)
        edge_density = np.sum(edges > 0) / edges.size
        results.append({
            'low': low,
            'high': high,
            'density': edge_density,
            'edges': edges
        })

    return results
```

## Experiment 3: Threshold Method Comparison

```python
def compare_thresholding(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    methods = {}

    # Global threshold
    _, methods['Global'] = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

    # Otsu's method
    _, methods['Otsu'] = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Adaptive mean
    methods['Adaptive Mean'] = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Adaptive Gaussian
    methods['Adaptive Gaussian'] = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    return methods
```

## Experiment 4: Morphology Kernel Size Impact

```python
def test_morphology_kernels(binary_image):
    kernel_sizes = [3, 5, 7, 9]
    operations = ['opening', 'closing']

    results = {}
    for op in operations:
        results[op] = {}
        for ksize in kernel_sizes:
            kernel = np.ones((ksize, ksize), np.uint8)
            if op == 'opening':
                result = cv2.morphologyEx(binary_image, cv2.MORPH_OPEN, kernel)
            else:
                result = cv2.morphologyEx(binary_image, cv2.MORPH_CLOSE, kernel)
            results[op][ksize] = result

    return results
```

## Experiment 5: Feature Detector Comparison

```python
def compare_feature_detectors(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    detectors = {
        'SIFT': cv2.SIFT_create(),
        'ORB': cv2.ORB_create(),
        'AKAZE': cv2.AKAZE_create()
    }

    results = {}
    for name, detector in detectors.items():
        kp, des = detector.detectAndCompute(gray, None)
        results[name] = {
            'keypoints': len(kp),
            'descriptor_size': des.shape[1] if des is not None else 0,
            'image': cv2.drawKeypoints(image, kp, None)
        }

    return results
```

## Experiment 6: Color Space Analysis

```python
def analyze_color_spaces(image):
    color_spaces = {
        'RGB': image,
        'HSV': cv2.cvtColor(image, cv2.COLOR_BGR2HSV),
        'LAB': cv2.cvtColor(image, cv2.COLOR_BGR2LAB),
        'YCrCb': cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
    }

    # Analyze each channel
    analysis = {}
    for name, img in color_spaces.items():
        channels = cv2.split(img)
        analysis[name] = {
            f'channel_{i}': {
                'mean': np.mean(ch),
                'std': np.std(ch),
                'histogram': cv2.calcHist([ch], [0], None, [256], [0, 256])
            }
            for i, ch in enumerate(channels)
        }

    return analysis
```

## Experiment 7: Real-time Performance Benchmark

```python
import time

def benchmark_algorithms(image, iterations=100):
    algorithms = {
        'Gaussian Blur': lambda img: cv2.GaussianBlur(img, (5, 5), 0),
        'Median Blur': lambda img: cv2.medianBlur(img, 5),
        'Canny': lambda img: cv2.Canny(img, 50, 150),
        'Threshold': lambda img: cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)[1]
    }

    results = {}
    for name, func in algorithms.items():
        start = time.time()
        for _ in range(iterations):
            _ = func(image)
        elapsed = time.time() - start
        results[name] = {
            'total_time': elapsed,
            'avg_time': elapsed / iterations,
            'fps': iterations / elapsed
        }

    return results
```

## Experiment 8: Lighting Condition Robustness

```python
def test_lighting_robustness(image):
    # Simulate different lighting conditions
    conditions = {
        'Normal': image,
        'Dark': cv2.convertScaleAbs(image, alpha=0.5, beta=0),
        'Bright': cv2.convertScaleAbs(image, alpha=1.5, beta=0),
        'High Contrast': cv2.convertScaleAbs(image, alpha=2.0, beta=-50)
    }

    # Test detection under each condition
    results = {}
    for name, img in conditions.items():
        detected = detect_objects(img)
        results[name] = {
            'count': len(detected),
            'image': img
        }

    return results
```

## Visualization Helper

```python
def plot_experiment_results(results, title):
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle(title)

    for idx, (name, img) in enumerate(results.items()):
        ax = axes[idx // 2, idx % 2]
        ax.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        ax.set_title(name)
        ax.axis('off')

    plt.tight_layout()
    plt.show()
```
