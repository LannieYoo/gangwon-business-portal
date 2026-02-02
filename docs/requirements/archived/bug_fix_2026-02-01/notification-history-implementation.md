# 通知历史页面实现文档

## 概述

在"咨询历史"页面后添加了"通知历史"页面，专门显示所有直接消息（系统通知）。

## 实现内容

### 1. 新增页面组件

#### 1.1 Hook
- **文件**: `frontend/src/member/modules/support/hooks/useNotificationHistory.js`
- **功能**:
  - 使用模块内部的 `supportService.getMemberMessages()` 加载所有会员消息
  - 过滤出直接消息（`message_type === 'direct'`）
  - 筛选和搜索功能
  - 使用 `supportService.markMessageAsRead()` 标记为已读
  - 智能跳转到对应功能页面
- **遵循规范**: 使用模块内部服务而非共享服务，符合 `dev-frontend_patterns` skill

#### 1.2 页面组件
- **主页面**: `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationHistoryPage.jsx`
- **筛选器**: `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationHistoryFilter.jsx`
- **表格**: `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationHistoryTable.jsx`
- **详情模态框**: `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationDetailModal.jsx`

#### 1.3 视图
- **文件**: `frontend/src/member/modules/support/views/NotificationHistoryView.jsx`
- **路径**: `/member/support/notifications`

### 2. 路由配置

#### 2.1 懒加载组件
```javascript
const MemberSupportNotificationHistory = lazy(() =>
  import("@member/modules/support").then((m) => ({
    default: m.NotificationHistoryView,
  })),
);
```

#### 2.2 路由定义
```javascript
{
  path: "support/notifications",
  element: (
    <ProtectedRoute allowedRoles={["member"]}>
      <LazyRoute>
        <MemberSupportNotificationHistory />
      </LazyRoute>
    </ProtectedRoute>
  ),
}
```

### 3. 导航菜单

在 `SupportSubmenu` 组件中添加了"通知历史"菜单项：

```javascript
{
  key: "support-notification-history",
  path: "/member/support/notifications",
  label: t("support.notificationHistory"),
  activePaths: ["/member/support/notifications"],
}
```

### 4. 通知铃铛跳转

更新了 `NotificationBell` 组件中直接消息的"查看全部"按钮：

```javascript
// 直接消息查看全部
navigate(userType === 'admin' ? '/admin/messages' : '/member/support/notifications');
```

### 5. 翻译文件

#### 5.1 韩文 (ko.json)
```json
{
  "support": {
    "notificationHistory": "알림 내역",
    "read": "읽음",
    "readStatus": "읽음 상태",
    "searchNotifications": "알림 검색...",
    "sender": "발신자",
    "goToPage": "페이지로 이동",
    "category": {
      "project": "사업 관리",
      "member": "회원 관리",
      "label": "분류"
    }
  }
}
```

#### 5.2 中文 (zh.json)
```json
{
  "support": {
    "notificationHistory": "通知历史",
    "read": "已读",
    "readStatus": "阅读状态",
    "searchNotifications": "搜索通知...",
    "sender": "发送者",
    "goToPage": "前往页面",
    "category": {
      "project": "事业管理",
      "member": "会员管理",
      "label": "分类"
    }
  }
}
```

## 功能特性

### 1. 通知列表显示
- 显示所有直接消息（系统通知）
- 按时间倒序排列
- 未读消息高亮显示（蓝色背景）
- 显示分类徽章（实绩管理、事业管理、会员管理等）
- 显示阅读状态徽章

### 2. 筛选和搜索
- 按阅读状态筛选（全部、未读、已读）
- 按标题和内容搜索
- 实时筛选结果

### 3. 通知详情
- 点击"查看"按钮打开详情模态框
- 显示完整的通知内容
- 自动标记为已读

### 4. 智能跳转
点击"前往页面"按钮根据通知主题跳转：
- `[실적 관리]` → `/member/performance`
- `[사업 관리]` → `/member/projects`
- `[회원 관리]` → `/member/profile`

### 5. 响应式设计
- 移动端友好
- 表格自适应
- 触摸优化

## 页面结构

```
通知历史页面
├── Banner (支持模块横幅)
├── SupportSubmenu (二级导航)
│   ├── 公告事项
│   ├── 常见问题
│   ├── 1:1咨询
│   ├── 咨询历史
│   └── 通知历史 (新增)
└── NotificationHistoryPage
    ├── 页面标题
    ├── NotificationHistoryFilter (筛选器)
    │   ├── 搜索框
    │   └── 阅读状态下拉框
    └── NotificationHistoryTable (通知表格)
        ├── 分类列
        ├── 标题和内容列
        ├── 阅读状态列
        ├── 日期列
        └── 操作列
            ├── 查看按钮
            └── 前往页面按钮
```

## 与咨询历史的区别

| 特性 | 咨询历史 | 通知历史 |
|------|---------|---------|
| 数据源 | 线程消息 (threads) | 直接消息 (direct messages) |
| 消息类型 | 双向对话 | 单向通知 |
| 状态 | 进行中/已解决/已关闭 | 已读/未读 |
| 操作 | 查看对话、回复 | 查看详情、跳转页面 |
| 分类 | 一般/技术支持/实绩 | 实绩管理/事业管理/会员管理 |

## 测试要点

1. **页面访问**
   - 访问 `/member/support/notifications`
   - 检查页面正常加载

2. **通知列表**
   - 显示所有直接消息
   - 未读消息有蓝色背景
   - 分类徽章正确显示

3. **筛选功能**
   - 按阅读状态筛选
   - 搜索功能正常

4. **查看详情**
   - 点击"查看"打开模态框
   - 自动标记为已读
   - 刷新列表后状态更新

5. **智能跳转**
   - 点击"前往页面"跳转到正确位置
   - 自动标记为已读

6. **导航菜单**
   - "通知历史"菜单项显示
   - 当前页面高亮正确

7. **通知铃铛**
   - 直接消息的"查看全部"跳转到通知历史页面

## 文件清单

### 新增文件
1. `frontend/src/member/modules/support/hooks/useNotificationHistory.js`
2. `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationHistoryPage.jsx`
3. `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationHistoryFilter.jsx`
4. `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationHistoryTable.jsx`
5. `frontend/src/member/modules/support/components/NotificationHistoryPage/NotificationDetailModal.jsx`
6. `frontend/src/member/modules/support/views/NotificationHistoryView.jsx`

### 修改文件
1. `frontend/src/member/modules/support/index.js` - 导出新视图
2. `frontend/src/member/modules/support/components/SupportSubmenu.jsx` - 添加菜单项
3. `frontend/src/member/modules/support/services/support.service.js` - 添加直接消息相关方法
4. `frontend/src/router.jsx` - 添加路由
5. `frontend/src/shared/components/NotificationBell.jsx` - 更新跳转路径
6. `frontend/src/member/modules/support/locales/ko.json` - 添加翻译
7. `frontend/src/member/modules/support/locales/zh.json` - 添加翻译

## 后续优化建议

1. **分页功能**: 当通知数量很多时添加分页
2. **批量操作**: 添加批量标记为已读功能
3. **通知过滤**: 添加按日期范围筛选
4. **导出功能**: 允许导出通知历史
5. **通知设置**: 允许用户配置接收哪些类型的通知
