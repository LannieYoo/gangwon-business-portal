# Storage 文件存储模块

## 概述

提供文件上传和存储功能，使用 Supabase Storage。

## 文件结构

```
storage/
├── __init__.py       # 模块导出
└── service.py        # 存储服务
```

## 使用方式

### 上传文件

```python
from ...common.modules.storage import storage_service

# 上传文件
result = await storage_service.upload_file(
    file=upload_file,           # FastAPI UploadFile
    bucket="attachments",       # 存储桶名称
    path="members/123",         # 路径（可选）
    make_public=True            # 是否公开
)

# 返回结果
{
    "url": "https://xxx.supabase.co/storage/v1/object/public/...",
    "path": "members/123/abc.pdf",
    "stored_name": "abc.pdf",
    "original_name": "document.pdf",
    "size": 1024,
    "mime_type": "application/pdf"
}
```

### 删除文件

```python
success = await storage_service.delete_file(
    bucket="attachments",
    path="members/123/abc.pdf"
)
```

### 创建签名 URL

```python
# 私有文件访问（1小时有效）
signed_url = storage_service.create_signed_url(
    bucket="private-files",
    path="documents/secret.pdf",
    expires_in=3600  # 秒
)
```

## 存储桶

| 桶名称 | 用途 | 公开 |
|--------|------|------|
| `banners` | 横幅图片 | ✅ |
| `notices` | 公告附件 | ✅ |
| `attachments` | 通用附件 | ✅ |
| `performance` | 绩效附件 | ❌ |
| `certificates` | 会员证书 | ❌ |

## 文件大小限制

| 类型 | 限制 |
|------|------|
| 图片 | 5MB |
| 文档 | 10MB |
| 默认 | 10MB |

## 允许的文件类型

| 类型 | 扩展名 |
|------|--------|
| 图片 | jpg, jpeg, png, gif, webp |
| 文档 | pdf, doc, docx, xls, xlsx, ppt, pptx, txt |

## 注意事项

1. 需要配置 `SUPABASE_SERVICE_KEY` 才能绑过 RLS 策略
2. 公开文件使用 `get_public_url`
3. 私有文件使用 `create_signed_url`
4. 文件名自动生成 UUID 避免冲突
