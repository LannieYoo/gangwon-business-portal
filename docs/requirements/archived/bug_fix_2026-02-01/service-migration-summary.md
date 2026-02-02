# 服务迁移总结

## 当前状态

### ✅ 已完成迁移的服务

#### 1. Performance Service (业绩管理)
- **会员端**: `member/modules/performance/services/performance.service.js` ✅
- **状态**: 已完全迁移，会员模块内部使用自己的服务
- **Shared 版本**: 仅被 deprecated 文件使用，可以删除

#### 2. Project Service (项目/事业申请)
- **会员端**: `member/modules/projects/services/project.service.js` ✅
- **状态**: 已完全迁移，会员模块内部使用自己的服务
- **Shared 版本**: 仅被 deprecated 文件使用，可以删除

#### 3. Support Service (支持服务)
- **会员端**: `member/modules/support/services/support.service.js` ✅
- **状态**: 已完全迁移，包含 FAQ、公告、咨询、直接消息功能
- **Shared 版本**: 需要检查是否还在使用

#### 4. Home Service (首页服务)
- **会员端**: `member/modules/home/services/home.service.js` ✅
- **状态**: 已完全迁移
- **Shared 版本**: 需要检查是否还在使用

#### 5. Auth Service (认证服务)
- **会员端**: `member/modules/auth/services/auth.service.js` ✅
- **管理员端**: `admin/modules/auth/services/auth.service.js` (需要确认)
- **状态**: 已迁移到各自模块

#### 6. Statistics Service (统计服务)
- **管理员端**: `admin/modules/statistics/services/statistics.service.js` ✅
- **状态**: 已迁移

---

### 🔄 需要迁移的服务

#### 1. Messages Service (消息服务) - 高优先级
**当前状态**:
- 会员端方法已迁移到 `member/modules/support/services/support.service.js` ✅
- 管理员端方法仍在 `shared/services/messages.service.js` ❌

**需要迁移**:
```
shared/services/messages.service.js (管理员端方法)
  ↓
admin/modules/messages/services/messages.service.js
```

**管理员端方法列表**:
- `getAdminThreads()` - 获取线程列表
- `getThread()` - 获取线程详情
- `createThreadMessage()` - 创建线程消息
- `updateThread()` - 更新线程状态
- `getAdminMessages()` - 获取直接消息
- `getUnreadCount()` - 获取未读数量
- `getAnalytics()` - 获取消息分析数据
- `createBroadcast()` - 创建广播消息

**使用位置**:
- `admin/modules/messages/ThreadList.jsx`
- `admin/modules/messages/MessageAnalytics.jsx`
- `shared/components/NotificationBell.jsx` (需要重构)

---

#### 2. Member Service (会员管理) - 高优先级
**当前状态**: 在 `shared/services/member.service.js`

**需要迁移**:
```
shared/services/member.service.js
  ↓
admin/modules/members/services/members.service.js
```

**方法列表**:
- `getProfile()` - 获取会员资料
- `updateProfile()` - 更新会员资料
- 其他会员管理方法

**使用位置**:
- `member/modules/performance_deprecated/PerformanceCompanyInfo.jsx` (deprecated)
- 可能在管理员模块使用

---

#### 3. Content Service (内容管理) - 中优先级
**当前状态**: 在 `shared/services/content.service.js`

**需要迁移**:
```
shared/services/content.service.js
  ↓
admin/modules/content/services/content.service.js
```

---

#### 4. Admin Service (管理员服务) - 中优先级
**当前状态**: 在 `shared/services/admin.service.js`

**需要分析**: 
- 如果是管理员认证相关 → `admin/modules/auth/services/auth.service.js`
- 如果是管理员管理相关 → 保留或迁移到具体模块

---

#### 5. Portal Service (门户服务) - 低优先级
**当前状态**: 在 `shared/services/portal.service.js`

**需要分析**: 确认功能和使用位置

---

### ✅ 应该保留在 Shared 的服务

#### 1. API Service
- **文件**: `shared/services/api.service.js`
- **原因**: 基础 HTTP 客户端，所有模块都需要
- **操作**: 保留

#### 2. Upload Service
- **文件**: `shared/services/upload.service.js`
- **原因**: 文件上传是通用功能
- **操作**: 保留

#### 3. Logs Service
- **文件**: `shared/services/logs.service.js`
- **原因**: 系统日志服务
- **操作**: 保留

---

## 共享组件重构需求

### 1. NotificationBell.jsx - 高优先级
**问题**: 同时调用管理员和会员的消息服务

**当前使用**:
```javascript
import { messagesService } from '@shared/services';

// 管理员端
messagesService.getAdminThreads()
messagesService.getAdminMessages()
messagesService.getUnreadCount()

// 会员端
messagesService.getMemberThreads()
messagesService.getMemberMessages()
messagesService.getMemberUnreadCount()
```

**解决方案选项**:

**选项 A: 通过 Props 传递服务** (推荐)
```javascript
// MemberLayout.jsx
import { supportService } from '@member/modules/support/services/support.service';

<NotificationBell 
  userType="member"
  services={{
    getThreads: supportService.getMemberThreads,
    getMessages: supportService.getMemberMessages,
    getUnreadCount: supportService.getMemberUnreadCount,
    markAsRead: supportService.markMessageAsRead,
  }}
/>

// AdminLayout.jsx
import { messagesService } from '@admin/modules/messages/services/messages.service';

<NotificationBell 
  userType="admin"
  services={{
    getThreads: messagesService.getAdminThreads,
    getMessages: messagesService.getAdminMessages,
    getUnreadCount: messagesService.getUnreadCount,
    markAsRead: messagesService.markMessageAsRead,
  }}
/>
```

**选项 B: 创建两个版本**
```
shared/components/NotificationBell/
  ├── MemberNotificationBell.jsx
  └── AdminNotificationBell.jsx
```

**选项 C: 使用 Context**
```javascript
// 在各自的 Layout 中提供 Context
<ServicesContext.Provider value={services}>
  <NotificationBell />
</ServicesContext.Provider>
```

---

### 2. ThreadDetailModal.jsx - 中优先级
**问题**: 会员和管理员都使用，但调用不同的 API

**解决方案**: 通过 props 传递服务方法
```javascript
<ThreadDetailModal
  threadId={threadId}
  getThread={supportService.getMemberThread}
  createMessage={supportService.createMemberThreadMessage}
  onClose={onClose}
/>
```

---

## 迁移步骤

### 第一阶段: 管理员消息服务 (本周)
1. ✅ 创建 `admin/modules/messages/services/messages.service.js`
2. ✅ 迁移管理员端方法
3. ✅ 更新 `admin/modules/messages/` 内部引用
4. ✅ 重构 `NotificationBell.jsx`
5. ✅ 测试功能

### 第二阶段: 会员管理服务 (本周)
1. 创建 `admin/modules/members/services/members.service.js`
2. 迁移会员管理方法
3. 更新管理员模块引用
4. 测试功能

### 第三阶段: 清理 Shared Services (下周)
1. 检查 `shared/services/support.service.js` 使用情况
2. 检查 `shared/services/home.service.js` 使用情况
3. 删除或标记 deprecated 的 shared services
4. 更新 `shared/services/index.js`

### 第四阶段: 其他服务 (逐步进行)
1. 分析 `content.service.js` 使用情况
2. 分析 `admin.service.js` 使用情况
3. 分析 `portal.service.js` 使用情况
4. 逐个迁移或删除

---

## 清理计划

### 可以删除的 Shared Services
一旦迁移完成，以下服务可以删除：

1. ✅ `shared/services/performance.service.js` - 仅被 deprecated 文件使用
2. ✅ `shared/services/project.service.js` - 仅被 deprecated 文件使用
3. 🔄 `shared/services/messages.service.js` - 迁移管理员端后可删除
4. 🔄 `shared/services/member.service.js` - 迁移后可删除
5. 🔄 `shared/services/support.service.js` - 检查后可能删除
6. 🔄 `shared/services/home.service.js` - 检查后可能删除

### 需要保留的 Shared Services
1. ✅ `shared/services/api.service.js` - 基础服务
2. ✅ `shared/services/upload.service.js` - 通用服务
3. ✅ `shared/services/logs.service.js` - 系统服务

---

## 检查命令

### 查找服务使用情况
```bash
# 查找某个服务的所有使用位置
rg "xxxService" --type js --type jsx

# 查找 shared services 的导入
rg "from.*@shared/services" --type js --type jsx

# 查找特定服务的导入
rg "import.*messagesService" --type js --type jsx
```

### 检查模块服务
```bash
# 列出所有模块的 services 目录
find frontend/src -type d -name "services" | grep modules
```

---

## 下一步行动

### 立即执行
1. 🔄 创建 `admin/modules/messages/services/messages.service.js`
2. 🔄 重构 `NotificationBell.jsx` 使用 props 传递服务

### 本周完成
3. 🔄 迁移 `member.service.js` 到管理员模块
4. 🔄 检查并清理 deprecated 的 shared services

### 下周完成
5. 🔄 分析并处理剩余的 shared services
6. 🔄 更新文档和代码规范
