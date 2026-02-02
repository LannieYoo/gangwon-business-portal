# Service 重构 - Phase 1 完成总结

## 完成时间
2026-01-31

## 目标
将 Banner 组件重构为受控组件，数据通过 props 传入，不直接调用 service。

## 实施内容

### 1. 创建了 useBanners Hook ✅

**文件**: `frontend/src/shared/hooks/useBanners.js`

**功能**:
- 管理横幅数据加载
- 实现 5 分钟缓存机制
- 自动预加载图片（桌面端和移动端）
- 支持默认占位符图片
- 错误处理和 fallback 机制

**API**:
```javascript
const { banners, loading, error, reload } = useBanners(bannerType, defaultBannerImages);
```

### 2. 重构了 Banner 组件 ✅

**文件**: `frontend/src/shared/components/Banner.jsx`

**变更**:
- 移除了内部的 service 调用
- 移除了路由检测逻辑
- 通过 props 接收 `banners` 和 `loading`
- 保留了所有展示和交互功能（轮播、点击跳转、响应式图片等）

**新的 Props**:
```javascript
<Banner
  banners={[]}          // 横幅数据数组
  loading={false}       // 加载状态
  bannerType={null}     // 横幅类型（用于样式）
  className=""
  sectionClassName=""
  autoSwitchInterval={5000}
  height="400px"
  fullWidth={true}
/>
```

### 3. 更新了所有使用 Banner 的页面 ✅

**共更新 10 个文件**:

#### Home 模块 (2 个文件)
- ✅ `frontend/src/member/modules/home/views/HomeView.jsx`
- ✅ `frontend/src/member/modules/home/components/HomePage/HomePage.jsx`

#### About 模块 (1 个文件)
- ✅ `frontend/src/member/modules/about/views/AboutView.jsx`

#### Projects 模块 (1 个文件)
- ✅ `frontend/src/member/modules/projects/components/ProjectBanner.jsx`

#### Performance 模块 (1 个文件)
- ✅ `frontend/src/member/modules/performance/views/PerformanceLayoutView.jsx`

#### Support 模块 (5 个文件)
- ✅ `frontend/src/member/modules/support/views/NoticesView.jsx`
- ✅ `frontend/src/member/modules/support/views/NotificationHistoryView.jsx`
- ✅ `frontend/src/member/modules/support/views/InquiryView.jsx`
- ✅ `frontend/src/member/modules/support/views/InquiryHistoryView.jsx`
- ✅ `frontend/src/member/modules/support/views/FAQView.jsx`

### 4. 更新了 Shared Hooks 导出 ✅

**文件**: `frontend/src/shared/hooks/index.js`

添加了:
```javascript
export { useBanners } from "./useBanners";
```

## 使用示例

### 基本用法

```javascript
import { Banner } from '@shared/components';
import { useBanners } from '@shared/hooks/useBanners';
import { BANNER_TYPES } from '@shared/utils/constants';

function SomeView() {
  // 加载横幅数据
  const { banners, loading } = useBanners(BANNER_TYPES.SUPPORT);
  
  return (
    <div>
      <Banner 
        banners={banners}
        loading={loading}
        bannerType={BANNER_TYPES.SUPPORT}
        sectionClassName="member-banner-section"
      />
      {/* 其他内容 */}
    </div>
  );
}
```

### 高级用法 - 自定义默认图片

```javascript
const defaultImages = {
  [BANNER_TYPES.CUSTOM]: '/images/custom-banner.jpg'
};

const { banners, loading, error, reload } = useBanners(
  BANNER_TYPES.CUSTOM,
  defaultImages
);

// 重新加载横幅
if (error) {
  reload();
}
```

## 优势

### 1. 组件纯粹性
- Banner 组件不再包含业务逻辑
- 只负责展示和交互
- 易于测试和维护

### 2. 数据管理分离
- 数据加载逻辑集中在 useBanners hook
- 可在任何组件中复用
- 统一的缓存和错误处理

### 3. 性能优化
- 5 分钟缓存机制，避免重复请求
- 自动预加载图片，提升用户体验
- 支持桌面端和移动端图片

### 4. 易于测试
- 可以通过 props 注入测试数据
- 不需要 mock service
- 组件和逻辑分离

### 5. 更好的可维护性
- 清晰的职责划分
- 统一的使用模式
- 易于扩展和修改

## 技术细节

### 缓存机制

```javascript
// 模块级别缓存
const bannerCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

// 缓存 key: `${bannerType}-${language}`
const cacheKey = `${bannerType}-${i18n.language}`;
```

### 图片预加载

```javascript
// 预加载桌面端和移动端图片
const imagesToPreload = newBanners.flatMap((banner) => {
  const images = [banner.imageUrl];
  if (banner.mobileImageUrl) {
    images.push(banner.mobileImageUrl);
  }
  return images;
});
await Promise.all(imagesToPreload.map((url) => preloadImage(url)));
```

### 错误处理

```javascript
try {
  // 加载横幅数据
} catch (err) {
  console.error('[useBanners] Failed to load banners:', err);
  setError(err);
  
  // 使用 fallback banner
  const fallbackBanner = [{
    id: "default",
    imageUrl: defaultBannerImages?.[bannerType] || generatePlaceholderImage(),
    // ...
  }];
  setBanners(fallbackBanner);
}
```

## 后续工作

### Phase 2: TermsModal 组件重构 ⏳
- 重构 TermsModal 为受控组件
- 更新所有使用 TermsModal 的页面

### Phase 3: home.service.js 迁移 ⏳
- 删除 `shared/services/home.service.js`
- 保留 `member/modules/home/services/home.service.js`

### Phase 4: portal.service.js 迁移 ⏳
- 创建 `member/modules/about/services/about.service.js`
- 删除 `shared/services/portal.service.js`

### Phase 5: 测试验证 ⏳
- 测试所有页面的横幅显示
- 测试性能和缓存机制
- 测试错误处理

## 文件清单

### 新建文件 (2 个)
- ✅ `frontend/src/shared/hooks/useBanners.js`
- ✅ `docs/requirements/active/service-refactor-phase1-completed.md`

### 修改文件 (12 个)
- ✅ `frontend/src/shared/components/Banner.jsx`
- ✅ `frontend/src/shared/hooks/index.js`
- ✅ `frontend/src/member/modules/home/views/HomeView.jsx`
- ✅ `frontend/src/member/modules/home/components/HomePage/HomePage.jsx`
- ✅ `frontend/src/member/modules/about/views/AboutView.jsx`
- ✅ `frontend/src/member/modules/projects/components/ProjectBanner.jsx`
- ✅ `frontend/src/member/modules/performance/views/PerformanceLayoutView.jsx`
- ✅ `frontend/src/member/modules/support/views/NoticesView.jsx`
- ✅ `frontend/src/member/modules/support/views/NotificationHistoryView.jsx`
- ✅ `frontend/src/member/modules/support/views/InquiryView.jsx`
- ✅ `frontend/src/member/modules/support/views/InquiryHistoryView.jsx`
- ✅ `frontend/src/member/modules/support/views/FAQView.jsx`

### 删除文件 (1 个)
- ✅ `frontend/src/member/modules/home/hooks/useBanners.js` (重复文件)

## 总结

Phase 1 - Banner 组件重构已成功完成。所有使用 Banner 的页面都已更新为新的模式，组件现在是完全受控的，数据通过 props 传入。这为后续的重构工作奠定了良好的基础。

**下一步**: 继续 Phase 2 - TermsModal 组件重构。
