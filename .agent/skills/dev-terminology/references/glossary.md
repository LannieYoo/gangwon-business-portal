# 项目术语字典

**最后更新**: 2026-01-24

---

## 用户相关 (User)

| 术语     | 英文          | 后端 (Python)                  | 前端 (TS)  | 说明                |
| -------- | ------------- | ------------------------------ | ---------- | ------------------- |
| 用户     | User          | `User`                         | `User`     | 用户实体            |
| 用户ID   | User ID       | `id` (主键) / `user_id` (外键) | `userId`   | 用户唯一标识 (UUID) |
| 邮箱     | Email         | `email`                        | `email`    | 登录凭证            |
| 密码     | Password      | `hashed_password`              | `password` | 后端存储哈希值      |
| 用户名   | Name          | `name`                         | `name`     | 显示名称            |
| 角色     | Role          | `UserRole`                     | `UserRole` | 枚举类型            |
| 激活状态 | Active Status | `is_active`                    | `isActive` | 布尔值              |

### 用户角色枚举

```python
# 后端: backend/app/core/enums.py
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    ANALYST = "analyst"
```

```typescript
// 前端: frontend/src/shared/types/enums.ts
enum UserRole {
  ADMIN = "admin",
  USER = "user",
  ANALYST = "analyst",
}
```

---

## 认证相关 (Auth)

| 术语     | 英文       | 后端 (Python)  | 前端 (TS)     | 说明            |
| -------- | ---------- | -------------- | ------------- | --------------- |
| 登录     | Login      | `login()`      | `login()`     | 方法名          |
| 注册     | Register   | `register()`   | `register()`  | 方法名          |
| 登出     | Logout     | `logout()`     | `logout()`    | 方法名          |
| 令牌     | Token      | `access_token` | `accessToken` | JWT 访问令牌    |
| 令牌类型 | Token Type | `token_type`   | `tokenType`   | 固定为 "bearer" |

---

## 研究/RAG 相关 (Research)

| 术语       | 英文    | 后端 (Python)  | 前端 (TS)      | 说明         |
| ---------- | ------- | -------------- | -------------- | ------------ |
| 搜索       | Search  | `search()`     | `search()`     | 方法名       |
| 查询       | Query   | `query`        | `query`        | 搜索文本字段 |
| 搜索结果   | Result  | `SearchResult` | `SearchResult` | 结果类型     |
| 相关度分数 | Score   | `score`        | `score`        | 浮点数 (0-1) |
| 聊天       | Chat    | `chat()`       | `chat()`       | 方法名       |
| 消息       | Message | `ChatMessage`  | `ChatMessage`  | 消息类型     |
| 来源       | Source  | `sources`      | `sources`      | 引用来源列表 |
| RAG增强    | Use RAG | `use_rag`      | `useRag`       | 布尔值       |

### 对话角色枚举

```python
# 后端: backend/app/core/enums.py
class ChatRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
```

---

## 文档相关 (Document)

| 术语     | 英文        | 后端 (Python)                      | 前端 (TS)        | 说明             |
| -------- | ----------- | ---------------------------------- | ---------------- | ---------------- |
| 文档     | Document    | `Document`                         | `Document`       | PDF 文档实体     |
| 文档ID   | Document ID | `id` (主键) / `document_id` (外键) | `documentId`     | 文档唯一标识     |
| 标题     | Title       | `title`                            | `title`          | 文档标题         |
| 内容     | Content     | `content`                          | `content`        | 文档内容/摘要    |
| 季度     | Quarter     | `quarter`                          | `quarter`        | Q1-Q4            |
| 年份     | Year        | `year`                             | `year`           | 年份 (2022-2026) |
| 报告类型 | Report Type | `report_type`                      | `reportType`     | ED_UPDATE 等     |
| 处理状态 | Status      | `DocumentStatus`                   | `DocumentStatus` | 枚举类型         |

### 文档状态枚举

```python
class DocumentStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    PROCESSING = "processing"
```

---

## 分析相关 (Analysis)

| 术语     | 英文           | 后端 (Python)    | 前端 (TS)       | 说明       |
| -------- | -------------- | ---------------- | --------------- | ---------- |
| 分析     | Analysis       | `Analysis`       | `Analysis`      | 数据分析   |
| 图表     | Chart          | `Chart`          | `Chart`         | 可视化图表 |
| 摘要     | Summary        | `summary`        | `summary`       | 文本摘要   |
| 演讲笔记 | Speaking Notes | `speaking_notes` | `speakingNotes` | 演讲稿     |

---

## API 响应相关

| 术语   | 英文      | 后端 (Python) | 前端 (TS)  | 说明       |
| ------ | --------- | ------------- | ---------- | ---------- |
| 成功   | Success   | `success`     | `success`  | 布尔值     |
| 数据   | Data      | `data`        | `data`     | 响应数据   |
| 错误   | Error     | `error`       | `error`    | 错误消息   |
| 详情   | Detail    | `detail`      | `detail`   | 错误详情   |
| 总数   | Total     | `total`       | `total`    | 结果总数   |
| 页码   | Page      | `page`        | `page`     | 当前页码   |
| 页大小 | Page Size | `page_size`   | `pageSize` | 每页记录数 |

---

## 时间相关

| 术语     | 英文       | 后端 (Python) | 前端 (TS)   | 说明       |
| -------- | ---------- | ------------- | ----------- | ---------- |
| 创建时间 | Created At | `created_at`  | `createdAt` | 创建时间戳 |
| 更新时间 | Updated At | `updated_at`  | `updatedAt` | 更新时间戳 |

---

## 枚举文件位置

| 位置                                 | 描述         |
| ------------------------------------ | ------------ |
| `backend/app/core/enums.py`          | 后端所有枚举 |
| `frontend/src/shared/types/enums.ts` | 前端所有枚举 |
