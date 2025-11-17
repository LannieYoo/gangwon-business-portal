# 响应式布局设计标准

## 📱 标准断点（Breakpoints）

### Tailwind CSS 默认断点（推荐使用）

```javascript
{
  'sm': '640px',   // 小屏设备（手机横屏、小平板）
  'md': '768px',   // 中等屏幕（平板竖屏）
  'lg': '1024px',  // 大屏设备（平板横屏、小桌面）
  'xl': '1280px',  // 超大屏（桌面）
  '2xl': '1536px'  // 超超大屏（大桌面）
}
```

### 设备分类

| 设备类型 | 屏幕宽度 | Tailwind 前缀 | 用途 |
|---------|---------|--------------|------|
| 手机竖屏 | < 640px | 默认（无前缀） | 移动端优先设计 |
| 手机横屏/小平板 | 640px - 768px | `sm:` | 小屏优化 |
| 平板 | 768px - 1024px | `md:` | 平板布局 |
| 小桌面 | 1024px - 1280px | `lg:` | 桌面布局 |
| 大桌面 | 1280px - 1536px | `xl:` | 大屏优化 |
| 超大桌面 | > 1536px | `2xl:` | 超宽屏优化 |

## 🎯 设计原则

### 1. 移动优先（Mobile-First）

- ✅ **正确做法**：先设计移动端，再逐步适配更大屏幕
  ```css
  /* 移动端默认样式 */
  .container {
    padding: 1rem;
  }
  
  /* 平板及以上 */
  @media (min-width: 768px) {
    .container {
      padding: 2rem;
    }
  }
  ```

- ❌ **避免**：从桌面端开始设计
  ```css
  /* 不推荐：桌面优先 */
  .container {
    padding: 2rem;
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }
  }
  ```

### 2. 弹性布局（Flexible Layouts）

- 使用 `flex` 和 `grid` 布局
- 使用相对单位（`rem`, `em`, `%`, `vw`, `vh`）
- 避免固定宽度（除非必要）

### 3. 响应式图片

```html
<!-- 使用 srcset 和 sizes -->
<img 
  src="image-small.jpg"
  srcset="image-small.jpg 640w, image-medium.jpg 1024w, image-large.jpg 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="响应式图片"
/>

<!-- 或使用 picture 元素 -->
<picture>
  <source media="(max-width: 640px)" srcset="mobile.jpg">
  <source media="(max-width: 1024px)" srcset="tablet.jpg">
  <img src="desktop.jpg" alt="响应式图片">
</picture>
```

### 4. 触摸友好（Touch-Friendly）

- 按钮最小尺寸：44×44px（iOS）或 48×48px（Material Design）
- 链接间距：至少 8px
- 避免悬停依赖（hover-only）的交互

## 📐 布局模式

### 1. 容器宽度

```css
/* 标准容器 */
.container {
  width: 100%;
  max-width: 1200px; /* 或 1400px, 1600px */
  margin: 0 auto;
  padding: 1rem;
}

/* 响应式内边距 */
@media (min-width: 640px) {
  .container {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 2rem;
  }
}
```

### 2. 网格布局

```css
/* 移动端：单列 */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* 平板：两列 */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* 桌面：三列 */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

### 3. 导航菜单

- 移动端：汉堡菜单（Hamburger Menu）
- 平板：折叠菜单或简化导航
- 桌面：完整水平导航

## 🛠️ Tailwind CSS 使用示例

### 响应式类名

```jsx
// 移动端默认，桌面端三列
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
  <div>列 1</div>
  <div>列 2</div>
  <div>列 3</div>
</div>

// 响应式内边距
<div className="p-4 sm:p-6 lg:p-8">
  内容
</div>

// 响应式字体大小
<h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
  标题
</h1>

// 响应式显示/隐藏
<div className="hidden md:block">桌面端显示</div>
<div className="block md:hidden">移动端显示</div>
```

## 📋 检查清单

### 开发前
- [ ] 确定目标设备和断点
- [ ] 设计移动端优先的布局
- [ ] 规划响应式导航方案

### 开发中
- [ ] 使用相对单位而非固定像素
- [ ] 测试所有断点的布局
- [ ] 确保触摸目标足够大
- [ ] 优化图片加载（懒加载、响应式图片）

### 测试
- [ ] 在不同设备上测试（手机、平板、桌面）
- [ ] 测试横屏和竖屏
- [ ] 检查文本可读性（字体大小、行高）
- [ ] 验证交互元素（按钮、链接）的可点击性
- [ ] 测试性能（加载速度、动画流畅度）

## 🔍 当前项目中的实现

### 使用的断点
- `640px` - 小屏设备
- `768px` - 移动端/桌面端分界（主要断点）
- `1024px` - 平板/桌面分界

### 建议改进
1. 统一使用 Tailwind 的响应式类名（`sm:`, `md:`, `lg:` 等）
2. 采用移动优先的媒体查询
3. 在 Tailwind 配置中明确定义断点（便于团队协作）

## 📚 参考资源

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google: Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)
- [Material Design: Responsive Layout](https://material.io/design/layout/responsive-layout-grid.html)

