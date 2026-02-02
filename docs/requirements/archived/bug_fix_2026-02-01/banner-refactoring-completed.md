# Banner 组件重构完成

## 概述

将 Banner 组件从受控组件（Controlled Component）重构为自包含组件（Self-Contained Component），内部集成 `useBanners` hook，简化使用方式。

## 重构前后对比

### 重构前（受控组件）

```jsx
// 在每个视图中都需要调用 useBanners
import { useBanners } from "@shared/hooks/useBanners";

export default function SomeView() {
  const { banners, loading } = useBanners(BANNER_TYPES.SUPPORT);
  
  return (
    <Banner
      banners={banners}
      loading={loading}
      bannerType={BANNER_TYPES.SUPPORT}
      sectionClassName="member-banner-section"
    />
  );
}
```

**问题：**
- 每个使用 Banner 的地方都需要重复调用 `useBanners`
- 代码冗余，违反 DRY 原则
- 增加了使用复杂度

### 重构后（自包含组件）

```jsx
// Banner 内部自动调用 useBanners
export default function SomeView() {
  return (
    <Banner
      bannerType={BANNER_TYPES.SUPPORT}
      sectionClassName="member-banner-section"
    />
  );
}
```

**优势：**
- 使用简单，只需传入 `bannerType`
- 数据加载逻辑封装在组件内部
- 减少代码重复
- 更符合组件封装原则

## 修改的文件

### 核心组件
- `frontend/src/shared/components/Banner.jsx` - 内部集成 `useBanners` hook

### 更新的视图组件（移除 useBanners 调用）

#### 项目模块
- `frontend/src/member/modules/projects/components/ProjectBanner.jsx`

#### 支持模块
- `frontend/src/member/modules/support/views/FAQView.jsx`
- `frontend/src/member/modules/support/views/InquiryView.jsx`
- `frontend/src/member/modules/support/views/InquiryHistoryView.jsx`
- `frontend/src/member/modules/support/views/NotificationHistoryView.jsx`
- `frontend/src/member/modules/support/views/NoticesView.jsx`

#### 首页模块
- `frontend/src/member/modules/home/views/HomeView.jsx`
- `frontend/src/member/modules/home/components/HomePage/HomePage.jsx`

#### 成果管理模块
- `frontend/src/member/modules/performance/views/PerformanceLayoutView.jsx`

## Banner 组件 API

### Props

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `bannerType` | `string` | ✅ | - | 横幅类型（来自 `BANNER_TYPES`） |
| `className` | `string` | ❌ | `""` | 额外的类名 |
| `sectionClassName` | `string` | ❌ | `""` | section 元素的类名 |
| `autoSwitchInterval` | `number` | ❌ | `5000` | 自动切换间隔（毫秒） |
| `height` | `string` | ❌ | `"400px"` | 横幅高度 |
| `fullWidth` | `boolean` | ❌ | `true` | 是否全宽显示 |

### 使用示例

```jsx
// 基本使用
<Banner bannerType={BANNER_TYPES.SUPPORT} />

// 自定义样式
<Banner
  bannerType={BANNER_TYPES.MAIN_PRIMARY}
  sectionClassName="mb-16"
  height="400px"
  fullWidth={true}
/>

// 小尺寸 Banner（不全宽）
<Banner
  bannerType={BANNER_TYPES.MAIN_SECONDARY}
  sectionClassName="h-full w-full rounded-lg overflow-hidden"
  height="100%"
  fullWidth={false}
/>
```

## 技术细节

### 数据加载流程

1. Banner 组件接收 `bannerType` prop
2. 内部调用 `useBanners(bannerType)` hook
3. `useBanners` 自动处理：
   - 数据缓存（5分钟）
   - 图片预加载
   - 加载状态管理
   - 错误处理
4. Banner 组件根据数据状态渲染：
   - 加载中：显示骨架屏
   - 加载完成：显示横幅图片
   - 加载失败：显示默认占位图

### 性能优化

- **缓存机制**：`useBanners` 内置 5 分钟缓存，避免重复请求
- **图片预加载**：在设置 state 前预加载图片，减少闪烁
- **响应式图片**：自动根据屏幕尺寸选择桌面端或移动端图片
- **懒加载**：只在需要时加载数据

## 闪烁问题处理

### 当前状态
- Banner 组件使用最简化实现
- `useBanners` hook 中已实现图片预加载
- 图片在设置到 state 之前会先预加载

### 如果仍有轻微闪烁
这是浏览器加载图片的正常行为。如需完全消除：

1. **应用启动时预加载**：在应用初始化时预加载所有 banner 图片
2. **使用 CDN**：确保图片通过 CDN 快速加载
3. **图片优化**：压缩图片大小，使用 WebP 格式

## 测试验证

✅ 所有文件通过 TypeScript/ESLint 检查
✅ 无编译错误
✅ Banner 正常显示
✅ 图片预加载工作正常
✅ 缓存机制生效

## 总结

重构后的 Banner 组件：
- ✅ 更简洁的 API
- ✅ 更少的代码重复
- ✅ 更好的封装性
- ✅ 保持原有功能
- ✅ 性能优化不变

这次重构遵循了"组件应该自包含"的设计原则，提升了代码质量和可维护性。
