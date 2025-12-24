# Email 模块规范

## 目录结构

```
email/
├── __init__.py           # 模块入口
├── service.py            # 邮件服务
├── background.py         # 后台任务（批量发送）
├── templates/            # 邮件模板
│   ├── registration_confirmation.html
│   ├── approval_notification.html
│   ├── revision_request.html
│   ├── password_reset.html
│   ├── new_message.html
│   ├── thread_reply.html
│   ├── broadcast_message.html
│   └── admin_new_thread.html
└── EMAIL_GUIDELINES.md
```

---

## 品牌规范

### 统一名称

| 场景 | 韩文 | 中文 |
|------|------|------|
| 品牌名称 | 강원 비즈니스 포털 | 江原商务门户 |
| 运营团队 | 강원 비즈니스 포털 운영팀 | 江原商务门户运营团队 |
| 版权声明 | © {year} Gangwon Business Portal | © {year} Gangwon Business Portal |

### 模板中使用

```html
<!-- 页脚统一格式 -->
<p class="footer">ⓒ {{ year }} Gangwon Business Portal</p>

<!-- 签名统一格式 -->
<p>감사합니다.<br>강원 비즈니스 포털 운영팀</p>
```

---

## 邮件服务 API

### 基础用法

```python
from src.common.modules.email import email_service

# 发送注册确认邮件
await email_service.send_registration_confirmation_email(
    to_email="user@example.com",
    company_name="公司名称",
    business_number="1234567890"
)

# 发送审批通知邮件
await email_service.send_approval_notification_email(
    to_email="user@example.com",
    company_name="公司名称",
    approval_type="회원가입",
    status="approved",  # 或 "rejected"
    comments="审批意见（可选）"
)

# 发送密码重置邮件
await email_service.send_password_reset_email(
    to_email="user@example.com",
    reset_token="token_string",
    business_number="1234567890"
)

# 发送修订请求邮件
await email_service.send_revision_request_email(
    to_email="user@example.com",
    company_name="公司名称",
    record_title="实绩标题",
    comments="修改要求"
)
```

### 消息通知邮件

```python
# 新消息通知（发给会员）
await email_service.send_new_message_notification(
    to_email="user@example.com",
    sender_name="관리자",
    subject="消息主题",
    message_link="https://..."
)

# 回复通知（发给会员）
await email_service.send_thread_reply_notification(
    to_email="user@example.com",
    sender_name="관리자",
    subject="消息主题",
    thread_link="https://..."
)

# 广播通知（发给会员）
await email_service.send_broadcast_notification(
    to_email="user@example.com",
    sender_name="관리자",
    subject="广播主题",
    is_important=True,
    messages_link="https://..."
)

# 新咨询通知（发给管理员）
await email_service.send_admin_new_thread_notification(
    to_email="admin@example.com",
    member_name="会员名称",
    subject="咨询主题",
    thread_link="https://..."
)
```

### 通用邮件发送

```python
# 使用自定义模板发送邮件
await email_service.send_email(
    to_email="user@example.com",
    subject="邮件主题",
    template_name="custom_template",  # 自动添加 .html 后缀
    template_data={
        "name": "用户名",
        "content": "邮件内容"
    },
    plain_text="纯文本备用内容"  # 可选
)
```

---

## 模板开发规范

### 模板结构

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <style>
        /* 内联样式 */
    </style>
</head>
<body>
    <div class="container">
        <!-- 主要内容 -->
        <h2>{{ company_name }} 담당자님,</h2>
        <p>邮件正文...</p>
        
        <!-- 操作按钮（可选） -->
        <a class="button" href="{{ action_url }}">버튼 텍스트</a>
        
        <!-- 页脚 -->
        <p class="footer">ⓒ {{ year }} Gangwon Business Portal</p>
    </div>
</body>
</html>
```

### 变量命名规范

| 变量 | 说明 | 示例 |
|------|------|------|
| `title` | 邮件标题 | 회원가입 신청 접수 |
| `company_name` | 公司名称 | 삼성전자 |
| `business_number` | 营业执照号 | 123-45-67890 |
| `year` | 当前年份（自动注入） | 2024 |
| `*_url` / `*_link` | 链接地址 | dashboard_url, thread_link |
| `status` | 状态显示文本 | 승인, 반려 |
| `comments` | 备注/意见 | 검토 의견 |

### 样式规范

```css
/* 基础样式 */
body {
    font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
    line-height: 1.6;
    color: #1f2937;
}

/* 容器 */
.container {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background-color: #ffffff;
}

/* 按钮 */
.button {
    display: inline-block;
    padding: 12px 24px;
    margin-top: 16px;
    background-color: #1e40af;  /* 主色调 */
    color: #ffffff;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
}

/* 页脚 */
.footer {
    margin-top: 24px;
    font-size: 12px;
    color: #6b7280;
    text-align: center;
}

/* 警告/提示框 */
.warning {
    padding: 12px;
    background-color: #fef2f2;
    border-radius: 8px;
    color: #991b1b;
}

.info {
    padding: 12px;
    background-color: #f3f4f6;
    border-radius: 8px;
}
```

### 颜色规范

| 用途 | 颜色 | Hex |
|------|------|-----|
| 主色调（按钮、链接） | 蓝色 | #1e40af |
| 成功/回复 | 绿色 | #059669 |
| 重要/紧急 | 红色 | #dc2626 |
| 广播/通知 | 紫色 | #7c3aed |
| 管理员通知 | 橙色 | #ea580c |
| 正文 | 深灰 | #1f2937 |
| 次要文字 | 灰色 | #6b7280 |
| 边框 | 浅灰 | #e5e7eb |

---

## 新增模板

### 步骤

1. 在 `templates/` 目录创建 HTML 文件
2. 在 `service.py` 中添加发送方法
3. 更新本文档

### 模板文件命名

```
{功能}_{动作}.html

示例：
- registration_confirmation.html  # 注册确认
- approval_notification.html      # 审批通知
- password_reset.html             # 密码重置
- new_message.html                # 新消息
```

### 添加发送方法

```python
async def send_xxx_email(
    self,
    *,
    to_email: str,
    # 其他必要参数
) -> bool:
    subject = "邮件主题"
    context = {
        "title": subject,
        # 模板变量
        "year": datetime.now(KST).year,
    }
    plain_text = "纯文本备用内容"
    
    return await self._send_email(
        to_email=to_email,
        subject=subject,
        template_name="xxx.html",
        context=context,
        plain_text=plain_text,
    )
```

---

## 配置

### 环境变量

```env
# .env.local
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=user@example.com
EMAIL_SMTP_PASSWORD=password
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=강원 비즈니스 포털
```

### 配置说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| EMAIL_SMTP_HOST | SMTP 服务器地址 | - |
| EMAIL_SMTP_PORT | SMTP 端口 | 587 |
| EMAIL_SMTP_USER | SMTP 用户名 | - |
| EMAIL_SMTP_PASSWORD | SMTP 密码 | - |
| EMAIL_FROM | 发件人邮箱 | - |
| EMAIL_FROM_NAME | 发件人名称 | - |

---

## 时区处理

邮件中的时间统一使用韩国时间 (KST, UTC+9)：

```python
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
now_kst = datetime.now(KST)

context = {
    "request_time": now_kst.strftime("%Y-%m-%d %H:%M"),
    "year": now_kst.year,
}
```

---

## 错误处理

### 返回值

所有发送方法返回 `bool`：
- `True` - 发送成功
- `False` - 发送失败（配置不完整、SMTP 错误等）

### 异常

- `TemplateNotFound` - 模板文件不存在时抛出

### 日志

发送失败时自动记录日志：

```python
logging.getLogger(__name__).error(f"SMTP Error: {e}")
```

---

## 测试

### 本地测试

1. 配置 `.env.local` 中的 SMTP 信息
2. 使用真实邮箱测试发送
3. 检查邮件内容和样式

### 模板预览

可以直接在浏览器中打开 HTML 文件预览样式（变量显示为 `{{ variable }}`）。

---

## Checklist

新增邮件模板时确认：

- [ ] 模板文件命名符合规范
- [ ] 使用统一的品牌名称
- [ ] 包含 `{{ year }}` 版权声明
- [ ] 样式使用内联 CSS
- [ ] 颜色符合规范
- [ ] 在 service.py 添加发送方法
- [ ] 方法使用 KST 时区
- [ ] 提供纯文本备用内容
- [ ] 更新本文档
