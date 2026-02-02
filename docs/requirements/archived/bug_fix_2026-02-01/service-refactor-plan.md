# Service 重构计划 - 模块化迁移

## 目标

将 `shared/services` 中的业务特定 service 迁移到对应模块内部，实现完全的模块隔离。

## 原则

1. **Shared 组件不应该直接调用业务 service**
2. **数据通过 props 传入，保持组件的纯粹性**
3. **业务逻辑在模块内部，通过 hooks 管理**
4. **避免循环依赖**

---

## 阶段 1: Banner 组件重构 ✅ 已完成

### 实施结果

**1. 创建了 content.service.js** ✅

```javascript
// frontend/src/shared/services/content.service.js
class ContentService {
  async getBanners(params) {
    return await apiService.get(`${API_PREFIX}/content/banners`, params);
  }
  
  async getLegalContent(type) {
    return await apiService.get(`${API_PREFIX}/content/legal/${type}`);
  }
}
```

**2. 创建了 useBanners hook** ✅

```javascript
// frontend/src/shared/hooks/useBanners.js
export function useBanners(bannerType, defaultBannerImages = {}) {
  // 管理横幅数据加载、缓存、预加载图片
  return { banners, loading, error, reload };
}
```

**3. 重构了 Banner 组件为受控组件** ✅

```javascript
// frontend/src/shared/components/Banner.jsx
export default function Banner({
  banners = [],        // 通过 props 接收横幅数据
  loading = false,     // 加载状态
  bannerType = null,   // 横幅类型（用于样式）
  ...otherProps
}) {
  // 只负责展示和交互，不负责数据获取
}
```

**4. 更新了所有使用 Banner 的页面** ✅

已更新的文件：
- ✅ `member/modules/home/views/HomeView.jsx`
- ✅ `member/modules/home/components/HomePage/HomePage.jsx`
- ✅ `member/modules/about/views/AboutView.jsx`
- ✅ `member/modules/projects/components/ProjectBanner.jsx`
- ✅ `member/modules/performance/views/PerformanceLayoutView.jsx`
- ✅ `member/modules/support/views/NoticesView.jsx`
- ✅ `member/modules/support/views/NotificationHistoryView.jsx`
- ✅ `member/modules/support/views/InquiryView.jsx`
- ✅ `member/modules/support/views/InquiryHistoryView.jsx`
- ✅ `member/modules/support/views/FAQView.jsx`

### 使用方式

```javascript
// 任何模块的视图组件
import { Banner } from '@shared/components';
import { useBanners } from '@shared/hooks/useBanners';
import { BANNER_TYPES } from '@shared/utils/constants';

function SomeView() {
  const { banners, loading } = useBanners(BANNER_TYPES.SOME_TYPE);
  
  return (
    <Banner 
      banners={banners}
      loading={loading}
      bannerType={BANNER_TYPES.SOME_TYPE}
    />
  );
}
```

### 优势

1. **组件纯粹** - Banner 组件不再直接调用 service，只负责展示
2. **数据分离** - 数据加载逻辑在 hook 中，可复用和测试
3. **缓存优化** - useBanners 实现了 5 分钟缓存，避免重复请求
4. **图片预加载** - 自动预加载横幅图片，提升用户体验
5. **易于测试** - 可以通过 props 注入测试数据

---

## 阶段 2: TermsModal 组件重构

### 当前问题

```javascript
// TermsModal.jsx (shared 组件)
import { homeService } from '@shared/services';

// 组件内部直接调用 service
const response = await homeService.getLegalContent(type);
```

### 重构方案

**1. 重构 TermsModal 为受控组件**

```javascript
// frontend/src/shared/components/TermsModal.jsx
export function TermsModal({
  isOpen,
  onClose,
  type,
  content = null,      // 通过 props 接收内容
  loading = false,     // 加载状态
  onLoadContent,       // 加载内容的回调
}) {
  useEffect(() => {
    if (isOpen && !content && onLoadContent) {
      onLoadContent(type);
    }
  }, [isOpen, type, content, onLoadContent]);
  
  // 只负责展示，不负责数据获取
}
```

**2. 使用方式**

```javascript
// RegisterView.jsx
import { TermsModal } from '@shared/components';
import { contentService } from '@shared/services';

function RegisterView() {
  const [termsContent, setTermsContent] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleLoadContent = async (type) => {
    setLoading(true);
    const response = await contentService.getLegalContent(type);
    setTermsContent(response.contentHtml);
    setLoading(false);
  };
  
  return (
    <TermsModal
      isOpen={showTerms}
      onClose={() => setShowTerms(false)}
      type="terms"
      content={termsContent}
      loading={loading}
      onLoadContent={handleLoadContent}
    />
  );
}
```

### 影响范围

需要更新的文件：
- ✅ `shared/components/TermsModal.jsx` - 重构为受控组件
- ✅ `shared/services/content.service.js` - 添加 getLegalContent
- ✅ 所有使用 TermsModal 的页面（注册、登录等）

---

## 阶段 3: home.service.js 迁移 ✅ 已完成

### 实施结果

**功能拆分**:

1. **横幅和法律内容** → `shared/services/content.service.js` ✅
   - `getBanners()` - 获取横幅
   - `getLegalContent()` - 获取法律内容

2. **首页数据** → `member/modules/home/services/home.service.js` ✅
   - `listNotices()` - 获取公告列表
   - `getLatestNotices()` - 获取最新公告
   - `listProjects()` - 获取项目列表
   - `getLatestProject()` - 获取最新项目

**更新的文件**:
- ✅ `shared/components/TermsModal.jsx` - 改用 contentService
- ✅ `admin/modules/content/LegalContentManagement.jsx` - 改用 contentService
- ✅ 删除 `shared/services/home.service.js`

---

## 阶段 4: portal.service.js 迁移 ✅ 已完成

### 实施结果

**1. 创建了 about.service.js** ✅

```javascript
// member/modules/about/services/about.service.js
export const aboutService = {
  async getSystemInfo() {
    return await apiService.get(`${API_PREFIX}/system-info`);
  }
};
```

**2. 更新了使用方** ✅

- ✅ `member/modules/about/hooks/useSystemInfo.js` - 改用 aboutService

**3. 删除旧文件** ✅

- ✅ 删除 `shared/services/portal.service.js`

---

## 阶段 5: 清理和更新导出 ✅ 已完成

### 实施结果

**更新了 shared/services/index.js** ✅

移除导出:
- ❌ `homeService` - 已迁移到 contentService 和 home 模块
- ❌ `portalService` - 已迁移到 about 模块

保留导出:
- ✅ `contentService` - 横幅和法律内容
- ✅ 其他通用 services

---

## 实施步骤

### ✅ 所有阶段已完成！

1. ✅ **创建新的 service**
   - ✅ `shared/services/content.service.js`
   - ✅ `member/modules/about/services/about.service.js`

2. ✅ **重构 Banner 组件**
   - ✅ 创建 `shared/hooks/useBanners.js`
   - ✅ 修改 Banner 组件为受控组件
   - ✅ 更新所有使用 Banner 的页面（10个文件）

3. ✅ **迁移 home.service.js**
   - ✅ 横幅和法律内容 → contentService
   - ✅ 首页数据保留在 home 模块
   - ✅ 更新 TermsModal 和 LegalContentManagement
   - ✅ 删除 `shared/services/home.service.js`

4. ✅ **迁移 portal.service.js**
   - ✅ 创建 `member/modules/about/services/about.service.js`
   - ✅ 更新 useSystemInfo hook
   - ✅ 删除 `shared/services/portal.service.js`

5. ✅ **清理和更新导出**
   - ✅ 更新 `shared/services/index.js`
   - ✅ 移除 homeService 和 portalService 导出

---

## 优势

1. **模块隔离** - 每个模块管理自己的业务逻辑
2. **组件纯粹** - Shared 组件只负责展示，不包含业务逻辑
3. **易于测试** - 组件可以通过 props 注入测试数据
4. **避免循环依赖** - 清晰的依赖关系
5. **更好的可维护性** - 业务逻辑集中在模块内部

## 风险

1. **工作量较大** - 需要修改多个文件
2. **可能引入 bug** - 需要充分测试
3. **学习成本** - 团队需要适应新的模式

## 时间估算

- 阶段 1 (Banner): 2-3 小时
- 阶段 2 (TermsModal): 1-2 小时
- 阶段 3 (home.service): 1 小时
- 阶段 4 (portal.service): 30 分钟
- 测试验证: 1-2 小时

**总计**: 5-8 小时

---

## 决策

是否执行此重构计划？

- ✅ **是** - 开始执行，实现完全的模块化
- ❌ **否** - 保持现状，采用最小改动方案

**建议**: 如果项目处于稳定期，建议执行此重构以提升代码质量。如果项目紧急，建议延后。
