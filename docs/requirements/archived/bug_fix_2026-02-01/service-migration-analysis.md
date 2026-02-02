# 服务迁移分析文档

根据 `dev-frontend_patterns` skill 规范，服务应该放在模块内部而不是共享服务层。

## 当前 Shared Services 分析

### 应该保留在 Shared 的服务

#### 1. `api.service.js` ✅ 保留
- **原因**: 基础 HTTP 客户端，所有模块都需要
- **类型**: 基础设施服务
- **操作**: 无需迁移

#### 2. `upload.service.js` ✅ 保留
- **原因**: 文件上传是通用功能，多个模块使用
- **类型**: 通用工具服务
- **操作**: 无需迁移

#### 3. `logs.service.js` ✅ 保留
- **原因**: 系统日志是管理员功能，不属于特定业务模块
- **类型**: 系统级服务
- **操作**: 无需迁移

---

### 需要迁移到模块的服务

#### 4. `messages.service.js` ⚠️ 部分迁移
**当前使用位置**:
- `NotificationBell.jsx` (shared component)
- `ThreadDetailModal.jsx` (shared component)
- `admin/modules/messages/` (管理员消息模块)
- `member/modules/support/` (会员支持模块)

**迁移策略**:
1. **会员端方法** → 迁移到 `member/modules/support/services/support.service.js` ✅ 已完成
   - `getMemberThreads()`
   - `getMemberThread()`
   - `createThread()`
   - `createMemberThreadMessage()`
   - `getMemberMessages()`
   - `markMessageAsRead()`
   - `getMemberUnreadCount()`

2. **管理员端方法** → 迁移到 `admin/modules/messages/services/messages.service.js` 🔄 待迁移
   - `getAdminThreads()`
   - `getThread()`
   - `createThreadMessage()`
   - `updateThread()`
   - `getAdminMessages()`
   - `getUnreadCount()`
   - `getAnalytics()`

3. **共享组件使用** → 通过 props 传递服务或使用 context
   - `NotificationBell.jsx` - 需要重构，根据 userType 使用不同模块的服务
   - `ThreadDetailModal.jsx` - 需要重构，通过 props 传递服务方法

---

#### 5. `member.service.js` ⚠️ 需要迁移
**功能**: 会员管理相关 API
**当前使用**: 多个地方使用

**迁移目标**: `admin/modules/members/services/members.service.js`

**使用位置分析**:
```bash
# 需要搜索使用位置
```

---

#### 6. `performance.service.js` ⚠️ 需要迁移
**功能**: 业绩管理相关 API

**迁移策略**:
- 会员端方法 → `member/modules/performance/services/performance.service.js` ✅ 已存在
- 管理员端方法 → `admin/modules/performance/services/performance.service.js` 🔄 待创建

---

#### 7. `project.service.js` ⚠️ 需要迁移
**功能**: 项目/事业申请相关 API

**迁移策略**:
- 会员端方法 → `member/modules/projects/services/projects.service.js` ✅ 已存在
- 管理员端方法 → `admin/modules/projects/services/projects.service.js` 🔄 待创建

---

#### 8. `home.service.js` ⚠️ 需要迁移
**功能**: 首页相关 API（公告、统计等）

**迁移策略**:
- 会员端方法 → `member/modules/home/services/home.service.js` ✅ 已存在
- 管理员端方法 → `admin/modules/dashboard/services/dashboard.service.js` 🔄 待创建

---

#### 9. `support.service.js` ⚠️ 需要检查
**功能**: 支持相关 API（FAQ、公告等）

**状态**: 
- `member/modules/support/services/support.service.js` ✅ 已存在
- 需要检查 shared 版本是否还在使用

---

#### 10. `content.service.js` ⚠️ 需要分析
**功能**: 内容管理相关 API

**迁移目标**: `admin/modules/content/services/content.service.js`

---

#### 11. `admin.service.js` ⚠️ 需要分析
**功能**: 管理员相关 API

**可能迁移目标**: 
- `admin/modules/auth/services/auth.service.js`
- 或保留为 admin 通用服务

---

#### 12. `portal.service.js` ⚠️ 需要分析
**功能**: 门户相关 API

**需要确认**: 这是什么功能？是否还在使用？

---

## 迁移优先级

### 高优先级 (立即处理)
1. ✅ `messages.service.js` 会员端 - 已完成
2. 🔄 `messages.service.js` 管理员端 - 待迁移
3. 🔄 重构 `NotificationBell.jsx` - 使用模块服务

### 中优先级 (近期处理)
4. 🔄 `member.service.js` → `admin/modules/members/`
5. 🔄 `performance.service.js` 管理员端
6. 🔄 `project.service.js` 管理员端

### 低优先级 (逐步处理)
7. 🔄 `content.service.js`
8. 🔄 `admin.service.js`
9. 🔄 检查 `support.service.js` 是否重复
10. 🔄 分析 `portal.service.js` 用途

---

## 迁移步骤模板

### 步骤 1: 创建模块服务
```javascript
// admin/modules/[module]/services/[module].service.js
import apiService from "@shared/services/api.service";
import { API_PREFIX } from "@shared/utils/constants";

class [Module]Service {
  // 迁移方法到这里
}

export const [module]Service = new [Module]Service();
export default [module]Service;
```

### 步骤 2: 更新模块内部使用
```javascript
// 从
import { xxxService } from "@shared/services";

// 改为
import { xxxService } from "../services/xxx.service";
```

### 步骤 3: 处理共享组件
- 选项 A: 通过 props 传递服务方法
- 选项 B: 使用 Context 提供服务
- 选项 C: 将组件移到模块内部

### 步骤 4: 清理 shared service
- 确认没有其他地方使用
- 从 `shared/services/index.js` 移除导出
- 删除或标记为 deprecated

---

## 共享组件重构策略

### NotificationBell.jsx
**问题**: 同时被 admin 和 member 使用，调用不同的服务方法

**解决方案**:
```javascript
// 选项 1: 通过 props 传递服务
<NotificationBell 
  userType="member"
  getThreads={supportService.getMemberThreads}
  getMessages={supportService.getMemberMessages}
  getUnreadCount={supportService.getMemberUnreadCount}
  markAsRead={supportService.markMessageAsRead}
/>

// 选项 2: 创建两个版本
// - shared/components/NotificationBell/MemberNotificationBell.jsx
// - shared/components/NotificationBell/AdminNotificationBell.jsx

// 选项 3: 使用 Context
// - 在 MemberLayout 提供 MemberServicesContext
// - 在 AdminLayout 提供 AdminServicesContext
```

### ThreadDetailModal.jsx
**问题**: 会员和管理员都使用，但调用不同的 API

**解决方案**:
```javascript
// 通过 props 传递服务方法
<ThreadDetailModal
  threadId={threadId}
  getThread={supportService.getMemberThread}
  createMessage={supportService.createMemberThreadMessage}
  onClose={onClose}
/>
```

---

## 检查清单

- [ ] 搜索每个 shared service 的使用位置
- [ ] 确定迁移目标模块
- [ ] 创建模块服务文件
- [ ] 迁移方法和测试
- [ ] 更新模块内部引用
- [ ] 重构共享组件
- [ ] 清理 shared service
- [ ] 更新文档

---

## 下一步行动

1. **立即**: 创建 `admin/modules/messages/services/messages.service.js`
2. **立即**: 重构 `NotificationBell.jsx` 使用模块服务
3. **本周**: 分析并迁移 `member.service.js`
4. **本周**: 迁移 `performance.service.js` 和 `project.service.js` 管理员端方法
5. **下周**: 处理其他低优先级服务
