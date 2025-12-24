# Styles 样式规范

## 技术栈

- Tailwind CSS 3.x
- CSS Variables (Design Tokens)
- @tailwindcss/typography 插件

## 文件结构

```
shared/styles/
├── index.css             # 全局样式入口 (Tailwind + Tokens + 基础样式)
├── ErrorPages.css        # 错误页面样式
└── STYLES_GUIDELINES.md
```

---

## 主题色

### Primary (蓝色系)

| 色阶 | Tailwind Class | 用途 |
|------|----------------|------|
| 50 | `bg-primary-50` | 浅色背景 |
| 100 | `bg-primary-100` | hover 背景 |
| 500 | `bg-primary-500` | 默认按钮 |
| 600 | `bg-primary-600` | 主要按钮、链接 |
| 700 | `bg-primary-700` | hover 状态 |

### Secondary (绿色系)

| 色阶 | Tailwind Class | 用途 |
|------|----------------|------|
| 500 | `bg-secondary-500` | 成功状态 |
| 600 | `text-secondary-600` | 成功文字 |

### Gray (灰色系)

| 色阶 | Tailwind Class | 用途 |
|------|----------------|------|
| 50 | `bg-gray-50` | 页面背景 |
| 100 | `bg-gray-100` | 卡片背景 |
| 200 | `border-gray-200` | 边框 |
| 500 | `text-gray-500` | 次要文字 |
| 700 | `text-gray-700` | 正文 |
| 900 | `text-gray-900` | 标题 |

### 语义色

```jsx
// 成功
<div className="bg-green-50 text-green-700 border-green-200">

// 错误
<div className="bg-red-50 text-red-700 border-red-200">

// 警告
<div className="bg-yellow-50 text-yellow-700 border-yellow-200">

// 信息
<div className="bg-blue-50 text-blue-700 border-blue-200">
```

---

## 间距规范

使用 8px 基准系统：

| Token | 值 | Tailwind |
|-------|-----|----------|
| space-1 | 4px | `p-1`, `m-1` |
| space-2 | 8px | `p-2`, `m-2` |
| space-3 | 12px | `p-3`, `m-3` |
| space-4 | 16px | `p-4`, `m-4` |
| space-5 | 20px | `p-5`, `m-5` |
| space-6 | 24px | `p-6`, `m-6` |
| space-8 | 32px | `p-8`, `m-8` |

### 常用间距场景

```jsx
// 页面内边距
<div className="p-6">

// 卡片内边距
<div className="p-4 md:p-6">

// 元素间距
<div className="space-y-4">
<div className="space-x-2">

// 表单元素间距
<div className="space-y-4">
  <Input />
  <Input />
</div>
```

---

## 响应式断点

| 断点 | 宽度 | 用途 |
|------|------|------|
| sm | 640px | 手机横屏 |
| md | 768px | 平板竖屏 |
| lg | 1024px | 平板横屏、小桌面 |
| xl | 1280px | 桌面 |
| 2xl | 1536px | 大桌面 |

### 移动优先原则

```jsx
// ✅ 正确：移动优先
<div className="p-4 md:p-6 lg:p-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ 错误：桌面优先
<div className="p-8 sm:p-4">
```

---

## 布局组件

### 页面容器

```jsx
// 使用 CSS 变量定义的容器
<div className="gov-page">
  {/* 最大宽度 1280px，自动左右留白 */}
</div>

// 或使用 Tailwind
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### 内容区块

```jsx
// 标准区块
<div className="gov-section-default">
  {/* padding: 32px 24px */}
</div>

// 大区块（首页等）
<div className="gov-section-large">
  {/* padding: 40px 32px */}
</div>
```

### 卡片

```jsx
<div className="bg-white rounded-lg shadow-card p-6">
  {/* 内容 */}
</div>

// hover 效果
<div className="bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow">
```

---

## 字体

### 字体族

```css
font-family: 'Noto Sans KR', 'Noto Sans SC', system-ui, sans-serif;
```

### 字号

| 用途 | Tailwind Class |
|------|----------------|
| 页面标题 | `text-2xl font-semibold` |
| 卡片标题 | `text-lg font-medium` |
| 正文 | `text-base` |
| 辅助文字 | `text-sm text-gray-500` |
| 小字 | `text-xs text-gray-400` |

```jsx
// 页面标题
<h1 className="text-2xl font-semibold text-gray-900">

// 卡片标题
<h2 className="text-lg font-medium text-gray-900">

// 正文
<p className="text-base text-gray-700">

// 辅助说明
<span className="text-sm text-gray-500">
```

---

## 动画

### 预定义动画

```jsx
// 淡入
<div className="animate-fade-in">

// 淡入上移
<div className="animate-fade-in-up">

// 下滑
<div className="animate-slide-down">

// 上滑
<div className="animate-slide-up">
```

### 过渡效果

```jsx
// 颜色过渡
<button className="transition-colors duration-200">

// 阴影过渡
<div className="transition-shadow duration-200">

// 全部过渡
<div className="transition-all duration-300">
```

---

## 常用样式模式

### 表格

```jsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
    </tr>
  </tbody>
</table>
```

### 表单

```jsx
// 输入框
<input className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
  focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 
  sm:text-sm" />

// 标签
<label className="block text-sm font-medium text-gray-700 mb-1">

// 错误提示
<p className="mt-1 text-sm text-red-600">
```

### 状态徽章

```jsx
// 成功
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">

// 待处理
<span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">

// 失败
<span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
```

---

## 注意事项

1. 优先使用 Tailwind 类，避免自定义 CSS
2. 使用 CSS 变量 (`--gov-*`) 保持一致性
3. 移动优先，逐步增加断点样式
4. 避免使用 `!important`
5. 组件样式封装在组件内部，不要污染全局
