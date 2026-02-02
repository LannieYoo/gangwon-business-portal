# Platform-Specific Download Guides

Detailed guides for downloading from specific platforms.

## Kaggle

### Setup

1. Create Kaggle account and get API token
2. Download `kaggle.json` from https://www.kaggle.com/settings
3. Place in `~/.kaggle/` (Linux/Mac) or `C:\Users\<username>\.kaggle\` (Windows)
4. Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

### Installation

```bash
pip install kaggle
# or
uv add kaggle
```

### Download Competition Data

```python
import kaggle

# Download all competition files
kaggle.api.competition_download_files(
    'titanic',
    path='data/kaggle/titanic'
)

# Download specific file
kaggle.api.competition_download_file(
    'titanic',
    'train.csv',
    path='data/kaggle/titanic'
)
```

### Download Datasets

```python
# Download dataset
kaggle.api.dataset_download_files(
    'uciml/iris',
    path='data/kaggle/iris',
    unzip=True
)

# Download specific file from dataset
kaggle.api.dataset_download_file(
    'uciml/iris',
    'Iris.csv',
    path='data/kaggle/iris'
)
```

### List Available Data

```python
# List competitions
competitions = kaggle.api.competitions_list()
for comp in competitions[:5]:
    print(f"{comp.ref}: {comp.title}")

# List datasets
datasets = kaggle.api.dataset_list(search='iris')
for ds in datasets:
    print(f"{ds.ref}: {ds.title}")
```

## Hugging Face Datasets

### Installation

```bash
pip install datasets
# or
uv add datasets
```

### Load Datasets

```python
from datasets import load_dataset

# Load full dataset
dataset = load_dataset('imdb')

# Load specific split
train_data = load_dataset('imdb', split='train')
test_data = load_dataset('imdb', split='test')

# Load with custom cache directory
dataset = load_dataset('imdb', cache_dir='./cache')

# Stream large datasets (don't download all at once)
dataset = load_dataset('imdb', streaming=True)
```

### Load from Hugging Face Hub

```python
from datasets import load_dataset

# Load dataset by name
dataset = load_dataset('squad')

# Load specific configuration
dataset = load_dataset('glue', 'mrpc')

# Load from specific revision/branch
dataset = load_dataset('imdb', revision='main')
```

### Save and Load Locally

```python
# Save dataset
dataset.save_to_disk('data/my_dataset')

# Load from disk
from datasets import load_from_disk
dataset = load_from_disk('data/my_dataset')
```

## UCI Machine Learning Repository

### Using ucimlrepo

```bash
pip install ucimlrepo
```

```python
from ucimlrepo import fetch_ucirepo

# Fetch dataset by ID
iris = fetch_ucirepo(id=53)
wine = fetch_ucirepo(id=109)

# Access data
X = iris.data.features
y = iris.data.targets

# Access metadata
print(iris.metadata)
print(iris.variables)
```

### Direct Download

```python
import pandas as pd

# Download directly from URL
url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data'
columns = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width', 'class']
df = pd.read_csv(url, header=None, names=columns)
```

## Google Drive

### Installation

```bash
pip install gdown
# or
uv add gdown
```

### Download Files

```python
import gdown

# Download file by ID
file_id = '1ABC123xyz'
url = f'https://drive.google.com/uc?id={file_id}'
output = 'data/dataset.zip'
gdown.download(url, output, quiet=False)

# Download using full URL
url = 'https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing'
gdown.download(url, output, quiet=False, fuzzy=True)
```

### Download Folders

```python
# Download entire folder
folder_url = 'https://drive.google.com/drive/folders/FOLDER_ID'
gdown.download_folder(folder_url, output='data/', quiet=False)
```

## AWS S3

### Installation

```bash
pip install boto3
# or
uv add boto3
```

### Setup Credentials

Create `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

### Download Files

```python
import boto3
from pathlib import Path

s3 = boto3.client('s3')

# Download single file
s3.download_file(
    'bucket-name',
    'path/to/file.csv',
    'local/path/file.csv'
)

# Download with progress
from boto3.s3.transfer import TransferConfig

config = TransferConfig(
    multipart_threshold=1024 * 25,  # 25 MB
    max_concurrency=10
)

s3.download_file(
    'bucket-name',
    'path/to/large-file.zip',
    'local/path/large-file.zip',
    Config=config
)
```

### List and Download Multiple Files

```python
# List objects in bucket
response = s3.list_objects_v2(Bucket='bucket-name', Prefix='data/')

for obj in response.get('Contents', []):
    key = obj['Key']
    local_path = Path('local') / key
    local_path.parent.mkdir(parents=True, exist_ok=True)
    
    s3.download_file('bucket-name', key, str(local_path))
    print(f"Downloaded: {key}")
```

## Scikit-learn Datasets

### Built-in Toy Datasets

```python
from sklearn.datasets import (
    load_iris,
    load_diabetes,
    load_digits,
    load_wine,
    load_breast_cancer
)

# Load dataset
iris = load_iris()
X = iris.data
y = iris.target

# As DataFrame
import pandas as pd
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df['target'] = iris.target
```

### Fetch from OpenML

```python
from sklearn.datasets import fetch_openml

# Fetch dataset by name
mnist = fetch_openml('mnist_784', version=1, parser='auto')

# Fetch by ID
dataset = fetch_openml(data_id=42, parser='auto')

# With custom cache
dataset = fetch_openml('iris', data_home='./cache')
```

## TensorFlow/Keras Datasets

```python
from tensorflow.keras.datasets import (
    mnist,
    cifar10,
    cifar100,
    fashion_mnist,
    imdb
)

# Load dataset (auto-downloads on first use)
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# CIFAR-10
(x_train, y_train), (x_test, y_test) = cifar10.load_data()

# IMDB reviews
(x_train, y_train), (x_test, y_test) = imdb.load_data(num_words=10000)
```

## PyTorch Datasets

```python
from torchvision.datasets import (
    MNIST,
    CIFAR10,
    ImageNet,
    COCO
)
from torchvision import transforms

# Download and load MNIST
transform = transforms.ToTensor()
train_dataset = MNIST(
    root='./data',
    train=True,
    download=True,
    transform=transform
)

# CIFAR-10
train_dataset = CIFAR10(
    root='./data',
    train=True,
    download=True,
    transform=transform
)
```

## GitHub Releases

```python
import requests
from pathlib import Path

def download_github_release(repo: str, tag: str, asset_name: str, output_path: Path):
    """Download asset from GitHub release."""
    url = f'https://github.com/{repo}/releases/download/{tag}/{asset_name}'
    
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return output_path

# Usage
download_github_release(
    'user/repo',
    'v1.0.0',
    'dataset.zip',
    Path('data/dataset.zip')
)
```

## FTP Downloads

```python
from ftplib import FTP
from pathlib import Path

def download_ftp(host: str, remote_path: str, local_path: Path, username: str = '', password: str = ''):
    """Download file from FTP server."""
    with FTP(host) as ftp:
        if username:
            ftp.login(username, password)
        else:
            ftp.login()  # Anonymous
        
        with open(local_path, 'wb') as f:
            ftp.retrbinary(f'RETR {remote_path}', f.write)
    
    return local_path

# Usage
download_ftp(
    'ftp.example.com',
    '/pub/data/dataset.csv',
    Path('data/dataset.csv')
)
```
