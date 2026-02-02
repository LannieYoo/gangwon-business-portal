# 会员端通知铃铛导航修复

## 问题描述

会员端点击通知铃铛中的直接消息（系统通知）时，跳转逻辑不正确。应该根据消息类型跳转到不同的页面：
- **线程消息**（咨询）→ 咨询历史页面
- **直接消息**（通知）→ 通知历史页面

## 修改内容

### 文件：`frontend/src/shared/components/NotificationBell.jsx`

**修改前**：
```javascript
} else if (notification.isDirect) {
  // 会员端直接消息：根据消息类型跳转到相应页面
  if (services?.markAsRead) {
    try {
      await services.markAsRead(notification.id);
      loadUnreadCount();
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  }

  // 根据消息主题判断跳转目标
  const subject = notification.subject || "";

  if (
    subject.includes("[실적 관리]") ||
    subject.includes("실적") ||
    subject.includes("성과")
  ) {
    // 实绩管理相关消息 -> 跳转到实绩管理页面
    navigate("/member/performance");
  } else if (
    subject.includes("[사업 관리]") ||
    subject.includes("사업") ||
    subject.includes("지원")
  ) {
    // 事业/支援相关消息 -> 跳转到事业公告页面
    navigate("/member/projects");
  } else if (subject.includes("[회원 관리]") || subject.includes("회원")) {
    // 会员管理相关消息 -> 跳转到会员资料页面
    navigate("/member/profile");
  } else {
    // 其他消息 -> 跳转到咨询历史（消息列表）
    navigate("/member/support/inquiry-history");
  }
}
```

**修改后**：
```javascript
} else if (notification.isDirect) {
  // 会员端直接消息：标记为已读并跳转到通知历史
  if (services?.markAsRead) {
    try {
      await services.markAsRead(notification.id);
      loadUnreadCount();
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  }

  // 直接消息 -> 跳转到通知历史页面
  navigate("/member/support/notifications");
}
```

## 导航逻辑总结

### 会员端

| 消息类型 | 点击行为 | 目标页面 |
|---------|---------|---------|
| 线程消息（咨询） | 打开 Modal 显示对话详情 | Modal 弹窗 |
| 直接消息（通知） | 标记为已读 + 跳转 | `/member/support/notifications` |

**底部按钮**：
- 当同时有线程消息和直接消息时：
  - "모든 문의 보기" → `/member/support/inquiry-history`
  - "모든 알림 보기" → `/member/support/notifications`
- 只有线程消息时：
  - "전체 보기" → `/member/support/inquiry-history`
- 只有直接消息时：
  - "전체 보기" → `/member/support/notifications`

### 管理员端

| 消息类型 | 点击行为 | 目标页面 |
|---------|---------|---------|
| 线程消息（会员咨询） | 跳转到消息页面 | `/admin/messages?threadId={id}` |
| 直接消息（系统通知） | 标记为已读 + 跳转 | `/admin/messages?tab=notifications` |

**底部按钮**：
- 当同时有线程消息和直接消息时：
  - "모든 문의 보기" → `/admin/messages`
  - "모든 알림 보기" → `/admin/messages?tab=notifications`
- 只有线程消息时：
  - "전체 보기" → `/admin/messages`
- 只有直接消息时：
  - "전체 보기" → `/admin/messages?tab=notifications`

## 用户体验改进

1. **简化导航**：直接消息统一跳转到通知历史页面，不再根据主题判断
2. **一致性**：会员端和管理员端的导航逻辑保持一致
3. **清晰分类**：
   - 咨询历史 = 线程消息（双向对话）
   - 通知历史 = 直接消息（单向通知）

## 测试步骤

### 会员端测试

1. 以会员身份登录
2. 点击右上角通知铃铛
3. 验证显示的通知分为两个区域：
   - "관리자 답변" (管理员回复) - 线程消息
   - "시스템 알림" (系统通知) - 直接消息
4. 点击线程消息 → 应该打开 Modal 弹窗
5. 点击直接消息 → 应该跳转到 `/member/support/notifications`
6. 点击底部按钮：
   - "모든 문의 보기" → 跳转到咨询历史
   - "모든 알림 보기" → 跳转到通知历史

### 管理员端测试

1. 以管理员身份登录
2. 点击右上角通知铃铛
3. 验证显示的通知分为两个区域：
   - "회원 문의" (会员咨询) - 线程消息
   - "시스템 알림" (系统通知) - 直接消息
4. 点击线程消息 → 应该跳转到消息页面并打开对应线程
5. 点击直接消息 → 应该跳转到系统通知 Tab
6. 点击底部按钮验证跳转正确

## 相关文件

- `frontend/src/shared/components/NotificationBell.jsx` - 通知铃铛组件
- `frontend/src/shared/i18n/locales/ko.json` - 韩语翻译
- `frontend/src/shared/i18n/locales/zh.json` - 中文翻译

## 完成状态

- [x] 修改会员端直接消息点击逻辑
- [x] 简化导航路径判断
- [x] 验证翻译键存在
- [x] 创建测试文档
- [ ] 端到端测试（需要前端重新加载）
