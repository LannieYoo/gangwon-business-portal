# Shared Services 迁移状态

## ✅ 已完成的迁移（已软删除）

### 1. ProjectService
- **旧位置**: `frontend/src/shared/services/project.service.js` → `project.service.js_deprecated`
- **新位置**: `frontend/src/member/modules/projects/services/project.service.js`
- **状态**: ✅ 已软删除，已从 index.js 移除

### 2. PerformanceService
- **旧位置**: `frontend/src/shared/services/performance.service.js` → `performance.service.js_deprecated`
- **新位置**: `frontend/src/member/modules/performance/services/performance.service.js`
- **状态**: ✅ 已软删除，已从 index.js 移除

### 3. SupportService
- **旧位置**: `frontend/src/shared/services/support.service.js` → `support.service.js_deprecated`
- **新位置**: `frontend/src/member/modules/support/services/support.service.js`
- **状态**: ✅ 已软删除，已从 index.js 移除

### 4. MessagesService
- **旧位置**: `frontend/src/shared/services/messages.service.js` → `messages.service.js_deprecated`
- **新位置**: `frontend/src/admin/modules/messages/services/messages.service.js`
- **状态**: ✅ 已软删除（早期完成）

---

## 🔄 待迁移的 Services

### 1. AdminService
- **当前位置**: `frontend/src/shared/services/admin.service.js`
- **建议位置**: `frontend/src/admin/services/admin.service.js`
- **功能**: 管理员专用功能
  - 会员管理（列表、详情、审批）
  - 绩效审核（批准、驳回、要求修改）
  - 审计日志管理
  - 项目管理（CRUD）
  - 数据导出
- **优先级**: 中
- **原因**: 管理员端专用，应该迁移到 admin 模块

### 2. MemberService
- **当前位置**: `frontend/src/shared/services/member.service.js`
- **建议位置**: `frontend/src/member/services/member.service.js`
- **功能**: 会员资料管理
  - 获取会员资料
  - 更新会员资料
  - 验证公司信息
- **优先级**: 中
- **原因**: 会员端专用，应该迁移到 member 模块

---

## ✅ 应该保留在 Shared 的 Services

### 1. api.service.js
- **原因**: 核心 HTTP 客户端，所有模块都需要
- **状态**: ✅ 保留

### 2. content.service.js
- **原因**: 通用内容服务（横幅、法律内容）
- **状态**: ✅ 保留（已重构）

### 3. upload.service.js
- **原因**: 文件上传功能，会员端和管理员端都需要
- **状态**: ✅ 保留

### 4. logs.service.js
- **原因**: 日志服务，可能被多个模块使用
- **状态**: ✅ 保留

---

## 📊 当前 Shared Services 目录结构

```
frontend/src/shared/services/
├── api.service.js                          ✅ 保留（核心）
├── content.service.js                      ✅ 保留（通用内容）
├── upload.service.js                       ✅ 保留（文件上传）
├── logs.service.js                         ✅ 保留（日志）
├── admin.service.js                        🔄 待迁移
├── member.service.js                       🔄 待迁移
├── index.js                                ✅ 已更新
├── project.service.js_deprecated           ✅ 已软删除
├── performance.service.js_deprecated       ✅ 已软删除
├── support.service.js_deprecated           ✅ 已软删除
└── messages.service.js_deprecated          ✅ 已软删除
```

---

## 🎯 最终目标结构

```
frontend/src/
├── shared/
│   └── services/
│       ├── api.service.js          ✅ 核心 HTTP 客户端
│       ├── content.service.js      ✅ 通用内容服务
│       ├── upload.service.js       ✅ 文件上传服务
│       ├── logs.service.js         ✅ 日志服务
│       └── index.js                ✅ 只导出共享服务
├── admin/
│   ├── services/
│   │   └── admin.service.js        🔄 待创建
│   └── modules/
│       └── messages/
│           └── services/
│               └── messages.service.js  ✅ 已完成
└── member/
    ├── services/
    │   └── member.service.js       🔄 待创建
    └── modules/
        ├── projects/
        │   └── services/
        │       └── project.service.js    ✅ 已完成
        ├── performance/
        │   └── services/
        │       └── performance.service.js ✅ 已完成
        └── support/
            └── services/
                └── support.service.js     ✅ 已完成
```

---

## 📝 软删除完成记录

**日期**: 2026-01-31

**操作**:
1. ✅ 重命名 `project.service.js` → `project.service.js_deprecated`
2. ✅ 重命名 `performance.service.js` → `performance.service.js_deprecated`
3. ✅ 重命名 `support.service.js` → `support.service.js_deprecated`
4. ✅ 更新 `index.js`，移除已废弃服务的导出
5. ✅ 添加注释说明迁移位置

**验证**:
- ✅ 所有文件已重命名
- ✅ index.js 已更新
- ✅ 没有代码引用旧的 shared services（已全部使用模块内的 services）

---

## 🚀 下一步计划

### Phase 1: 迁移 AdminService（可选）
1. 创建 `frontend/src/admin/services/admin.service.js`
2. 迁移所有管理员相关功能
3. 更新所有引用
4. 软删除旧文件

### Phase 2: 迁移 MemberService（可选）
1. 创建 `frontend/src/member/services/member.service.js`
2. 迁移会员资料相关功能
3. 更新所有引用
4. 软删除旧文件

### Phase 3: 清理（未来）
- 在确认没有问题后，可以永久删除 `*_deprecated` 文件

---

## 💡 注意事项

1. **软删除的好处**:
   - 可以随时恢复
   - 可以参考旧代码
   - 降低风险

2. **何时永久删除**:
   - 确认新代码运行稳定（至少 1-2 周）
   - 所有测试通过
   - 没有发现任何问题

3. **如何恢复**:
   ```powershell
   # 如果需要恢复
   Rename-Item -Path "frontend/src/shared/services/project.service.js_deprecated" -NewName "project.service.js"
   ```
