# API Authentication Setup

Guide for securely managing API keys and credentials.

## Environment Variables

### Using .env Files

1. Install python-dotenv:
```bash
pip install python-dotenv
```

2. Create `.env` file in project root:
```env
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_api_key
HUGGINGFACE_TOKEN=your_token
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

3. Load in Python:
```python
from dotenv import load_dotenv
import os

load_dotenv()

kaggle_key = os.getenv('KAGGLE_KEY')
hf_token = os.getenv('HUGGINGFACE_TOKEN')
```

4. Add to `.gitignore`:
```gitignore
.env
.env.local
.env.*.local
```

## Platform-Specific Setup

### Kaggle

**Option 1: API Token File**

1. Go to https://www.kaggle.com/settings
2. Click "Create New API Token"
3. Save `kaggle.json` to:
   - Linux/Mac: `~/.kaggle/kaggle.json`
   - Windows: `C:\Users\<username>\.kaggle\kaggle.json`
4. Set permissions (Linux/Mac): `chmod 600 ~/.kaggle/kaggle.json`

**Option 2: Environment Variables**

```bash
export KAGGLE_USERNAME=your_username
export KAGGLE_KEY=your_api_key
```

### Hugging Face

**Get Token:**
1. Go to https://huggingface.co/settings/tokens
2. Create new token
3. Copy token

**Use in Code:**

```python
from huggingface_hub import login

# Option 1: Interactive login
login()

# Option 2: Programmatic login
login(token='your_token')

# Option 3: Environment variable
import os
os.environ['HUGGINGFACE_TOKEN'] = 'your_token'
```

### AWS S3

**Setup Credentials:**

Create `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
region = us-east-1
```

Or use environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

**Use in Code:**

```python
import boto3

# Automatically uses credentials from ~/.aws/credentials or env vars
s3 = boto3.client('s3')
```

### Google Drive

**For gdown (public files):**
No authentication needed for public files.

**For private files:**
Use Google Drive API with OAuth2:

```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Setup OAuth2 credentials
creds = Credentials.from_authorized_user_file('token.json')
service = build('drive', 'v3', credentials=creds)
```

## Secure Storage Best Practices

### 1. Never Commit Secrets

Add to `.gitignore`:
```gitignore
# Credentials
.env
.env.*
*.json
!package.json
credentials.json
kaggle.json
token.json

# AWS
.aws/

# Keys
*.key
*.pem
```

### 2. Use Secret Management Tools

**For Production:**
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault

**For Development:**
- python-dotenv
- direnv
- pass (password manager)

### 3. Rotate Keys Regularly

- Change API keys every 90 days
- Revoke unused keys immediately
- Use separate keys for dev/prod

### 4. Limit Key Permissions

- Use read-only keys when possible
- Restrict IP addresses
- Set expiration dates

## Configuration File Approach

### Create Config File

```python
# config.py
from pathlib import Path
import json
import os

def load_config():
    """Load configuration from file or environment."""
    config_path = Path.home() / '.config' / 'myapp' / 'config.json'
    
    if config_path.exists():
        return json.loads(config_path.read_text())
    
    # Fallback to environment variables
    return {
        'kaggle_key': os.getenv('KAGGLE_KEY'),
        'hf_token': os.getenv('HUGGINGFACE_TOKEN'),
    }

config = load_config()
```

### Use Config

```python
from config import config

kaggle_key = config['kaggle_key']
```

## Checking Credentials

```python
import os

def check_credentials():
    """Verify required credentials are available."""
    required = {
        'KAGGLE_KEY': os.getenv('KAGGLE_KEY'),
        'KAGGLE_USERNAME': os.getenv('KAGGLE_USERNAME'),
    }
    
    missing = [key for key, value in required.items() if not value]
    
    if missing:
        raise ValueError(f"Missing credentials: {', '.join(missing)}")
    
    print("✓ All credentials found")

# Run before downloading
check_credentials()
```

## Example: Complete Setup

```python
# setup_credentials.py
from pathlib import Path
import json
import os

def setup_kaggle():
    """Setup Kaggle credentials."""
    kaggle_dir = Path.home() / '.kaggle'
    kaggle_file = kaggle_dir / 'kaggle.json'
    
    if kaggle_file.exists():
        print("✓ Kaggle credentials already configured")
        return
    
    username = input("Kaggle username: ")
    key = input("Kaggle API key: ")
    
    kaggle_dir.mkdir(exist_ok=True)
    kaggle_file.write_text(json.dumps({
        'username': username,
        'key': key
    }))
    kaggle_file.chmod(0o600)
    
    print(f"✓ Kaggle credentials saved to {kaggle_file}")

def setup_env():
    """Create .env file template."""
    env_file = Path('.env')
    
    if env_file.exists():
        print("✓ .env file already exists")
        return
    
    template = """# API Credentials
KAGGLE_USERNAME=
KAGGLE_KEY=
HUGGINGFACE_TOKEN=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
"""
    
    env_file.write_text(template)
    print(f"✓ Created .env template at {env_file}")
    print("  Please fill in your credentials")

if __name__ == '__main__':
    setup_kaggle()
    setup_env()
```

## Troubleshooting

### Kaggle: "401 Unauthorized"
- Check `kaggle.json` exists in correct location
- Verify file permissions: `chmod 600 ~/.kaggle/kaggle.json`
- Ensure username and key are correct

### AWS: "Unable to locate credentials"
- Check `~/.aws/credentials` exists
- Verify environment variables are set
- Try: `aws configure` to set up credentials

### Hugging Face: "Authentication required"
- Run `huggingface-cli login`
- Or set `HUGGINGFACE_TOKEN` environment variable
- Check token has required permissions

### Environment Variables Not Loading
- Ensure `.env` file is in project root
- Call `load_dotenv()` before accessing variables
- Check file is not in `.gitignore` accidentally
