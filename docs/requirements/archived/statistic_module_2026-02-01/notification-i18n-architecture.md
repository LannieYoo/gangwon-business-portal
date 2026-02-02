# 通知系统国际化架构

## 设计原则

**后端不处理国际化，所有国际化由前端处理**

## 架构说明

### 后端职责
- 发送**结构化的 JSON 数据**
- 包含类型、状态、参数等元数据
- 不包含任何可读文本

### 前端职责
- 检测并解析 JSON 格式的通知
- 根据用户语言设置自动翻译
- 兼容旧格式的文本通知

## 数据格式

### 后端发送格式

```python
# 业绩审核通知
notification_data = {
    "type": "performance_review",
    "status": "approved",  # approved, rejected, revision_requested, submitted
    "year": 2024,
    "quarter": 1,
    "comments": "审核意见内容"
}

# 会员注册通知
notification_data = {
    "type": "member_registration",
    "company_name": "企业名称",
    "business_number": "123-45-67890",
    "email": "contact@example.com"
}

# 项目申请通知
notification_data = {
    "type": "project_application",
    "company_name": "企业名称",
    "applicant_name": "申请人",
    "project_title": "项目标题"
}
```

### 前端解析流程

```javascript
import { 
  parseNotification, 
  getNotificationTranslationKey,
  formatNotificationParams 
} from '@shared/utils/notificationParser';

// 1. 解析通知
const data = parseNotification(subject, content);

// 2. 获取翻译键
const subjectKey = getNotificationTranslationKey(data, 'subject');
const contentKey = getNotificationTranslationKey(data, 'content');

// 3. 格式化参数
const params = formatNotificationParams(data);

// 4. 翻译
const translatedSubject = t(subjectKey, params);
const translatedContent = t(contentKey, params);
```

## 通知类型

### 1. 业绩管理通知

#### performance_review (业绩审核结果)
- **状态**: approved, rejected, revision_requested, submitted
- **参数**: year, quarter, status, comments
- **翻译键**:
  - `notifications.performance.review.subject`
  - `notifications.performance.review.content`

#### performance_submission (新业绩提交)
- **参数**: company_name, year, quarter
- **翻译键**:
  - `notifications.performance.submission.subject`
  - `notifications.performance.submission.content`

### 2. 会员管理通知

#### member_registration (新会员注册)
- **参数**: company_name, business_number, email
- **翻译键**:
  - `notifications.member.registration.subject`
  - `notifications.member.registration.content`

#### member_approved (会员批准)
- **参数**: company_name
- **翻译键**:
  - `notifications.member.approved.subject`
  - `notifications.member.approved.content`

#### member_rejected (会员驳回)
- **参数**: company_name, reason
- **翻译键**:
  - `notifications.member.rejected.subject`
  - `notifications.member.rejected.content`

### 3. 项目管理通知

#### project_application (新项目申请)
- **参数**: company_name, applicant_name, project_title
- **翻译键**:
  - `notifications.project.application.subject`
  - `notifications.project.application.content`

#### project_application_result (项目申请结果)
- **参数**: project_title, status
- **翻译键**:
  - `notifications.project.result.subject`
  - `notifications.project.result.content`

## 翻译文件示例

### 韩语 (ko.json)

```json
{
  "notifications": {
    "performance": {
      "review": {
        "subject": "[실적 관리] {{period}} 실적 심사 결과",
        "content": "{{period}} 실적이 {{statusKo}}되었습니다.{{#comments}}\n\n관리자 의견: {{comments}}{{/comments}}"
      }
    }
  }
}
```

### 中文 (zh.json)

```json
{
  "notifications": {
    "performance": {
      "review": {
        "subject": "[实绩管理] {{periodZh}} 实绩审查结果",
        "content": "{{periodZh}} 实绩已{{statusZh}}。{{#comments}}\n\n管理员意见: {{comments}}{{/comments}}"
      }
    }
  }
}
```

## 优势

1. **关注点分离**: 后端专注业务逻辑，前端专注展示
2. **易于维护**: 翻译集中在前端，修改无需后端部署
3. **类型安全**: JSON 格式便于验证和类型检查
4. **向后兼容**: 自动检测格式，兼容旧的文本通知
5. **灵活扩展**: 新增通知类型只需添加翻译键

## 添加新通知类型

### 1. 后端发送数据

```python
notification_data = {
    "type": "new_notification_type",
    "param1": "value1",
    "param2": "value2",
}

await message_service.create_direct_message(
    sender_id=sender_id,
    recipient_id=recipient_id,
    data=MessageCreate(
        subject=json.dumps(notification_data, ensure_ascii=False),
        content=json.dumps(notification_data, ensure_ascii=False),
        recipient_id=recipient_id,
    ),
)
```

### 2. 前端添加翻译键映射

```javascript
// frontend/src/shared/utils/notificationParser.js
const keyMap = {
  new_notification_type: {
    subject: 'notifications.newType.subject',
    content: 'notifications.newType.content',
  },
};
```

### 3. 添加翻译文本

```json
// ko.json
{
  "notifications": {
    "newType": {
      "subject": "新通知标题 {{param1}}",
      "content": "新通知内容 {{param2}}"
    }
  }
}
```

## 测试

### 后端测试
```python
# 确保发送的是有效的 JSON
import json
data = {"type": "test", "param": "value"}
assert json.loads(json.dumps(data)) == data
```

### 前端测试
```javascript
// 测试解析
const data = parseNotification('{"type":"test"}', null);
assert(data.type === 'test');

// 测试翻译
const key = getNotificationTranslationKey(data, 'subject');
assert(key !== null);
```
