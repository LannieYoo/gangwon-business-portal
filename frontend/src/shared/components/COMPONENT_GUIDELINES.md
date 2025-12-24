# 组件开发规范

本文档定义了 `shared/components` 目录下组件的开发标准和最佳实践。

## 目录结构

```
shared/components/
├── index.js              # 统一导出入口
├── Button.jsx            # 单文件组件
├── Input.jsx
├── Charts/               # 复杂组件目录
│   ├── index.js
│   └── LineChart.jsx
└── COMPONENT_GUIDELINES.md
```

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | PascalCase | `Button.jsx`, `FileUploadButton.jsx` |
| 组件名 | PascalCase | `export function Button()` |
| Props | camelCase | `onClick`, `isLoading`, `className` |
| 样式变量 | camelCase | `variantStyles`, `sizeStyles` |

## 组件模板

### 基础组件

```jsx
/**
 * ComponentName Component
 */

import { cn } from '@shared/utils/helpers';

export function ComponentName({
  children,
  variant = 'default',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'base-styles',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default ComponentName;
```

### 带 Ref 转发的组件

```jsx
/**
 * InputComponent Component
 */

import { forwardRef } from 'react';
import { cn } from '@shared/utils/helpers';

export const InputComponent = forwardRef(function InputComponent({
  label,
  error,
  className,
  ...props
}, ref) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'px-3 py-2 border rounded-md',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
});

export default InputComponent;
```

### 复合组件

```jsx
/**
 * Card Component
 */

import { cn } from '@shared/utils/helpers';

export function Card({ children, className, ...props }) {
  return (
    <div className={cn('bg-white rounded-lg border', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-b', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
```

## Props 设计原则

### 必须支持的 Props

- `className` - 允许外部样式覆盖
- `...props` - 透传原生属性

### 常用 Props 命名

| 用途 | 命名 | 类型 |
|------|------|------|
| 变体样式 | `variant` | `'primary' \| 'secondary' \| 'danger'` |
| 尺寸 | `size` | `'sm' \| 'md' \| 'lg'` |
| 加载状态 | `loading` | `boolean` |
| 禁用状态 | `disabled` | `boolean` |
| 错误信息 | `error` | `string` |
| 标签文本 | `label` | `string` |
| 必填标记 | `required` | `boolean` |

### 变体样式定义

```jsx
const variantStyles = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border-2 border-primary-600 text-primary-600'
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};
```

## 样式规范

### 使用 Tailwind CSS

- 使用 `cn()` 工具函数合并类名
- 基础样式写在组件内，可覆盖样式通过 `className` 传入
- 响应式样式使用 Tailwind 断点前缀

### 颜色使用

```
主色调: primary-*
灰色系: gray-*
成功: green-*
警告: yellow-*
错误: red-*
```

### 间距规范

```
内边距: px-3/4/6, py-1.5/2/4
外边距: mb-1.5/4, mt-1.5
圆角: rounded-md/lg
```

## 导出规范

### 在 index.js 中导出

```js
// 命名导出 + 默认导出
export * from "./Button";

// 仅默认导出
export { default as LanguageSwitcher } from "./LanguageSwitcher";

// 命名导出特定内容
export { TermsModal, TERM_TYPES } from "./TermsModal";
```

### 组件文件导出

```jsx
// 推荐：同时提供命名导出和默认导出
export function Button() { ... }
export default Button;
```

## 可访问性 (A11y)

- 表单元素必须关联 `label`
- 可交互元素支持键盘操作
- 使用语义化 HTML 标签
- 提供适当的 ARIA 属性

```jsx
// 示例
<label className="...">
  {label}
  {required && <span aria-hidden="true">*</span>}
</label>
<input aria-invalid={!!error} aria-describedby={error ? 'error-msg' : undefined} />
{error && <p id="error-msg" role="alert">{error}</p>}
```

## 性能优化

- 使用 `forwardRef` 支持 ref 转发
- 复杂计算使用 `useMemo`
- 事件处理使用 `useCallback`
- 避免在渲染中创建新对象/数组

## 组件命名（重要）

组件必须使用具名函数或设置 `displayName`，这是**组件拦截器记录日志的前提**。

拦截器通过 `type.displayName || type.name` 获取组件名，匿名组件会被跳过，不记录日志。

```jsx
// ✅ 正确 - 具名函数
export function Button() { ... }

// ✅ 正确 - forwardRef 具名函数
export const Input = forwardRef(function Input(props, ref) { ... });

// ✅ 正确 - 设置 displayName
const Button = (props) => { ... };
Button.displayName = 'Button';

// ❌ 错误 - 匿名函数，拦截器无法识别
export const Button = (props) => { ... };

// ❌ 错误 - forwardRef 匿名函数
export const Input = forwardRef((props, ref) => { ... });
```

## 文件注释

每个组件文件顶部添加简要说明：

```jsx
/**
 * Button Component
 * 
 * @description 通用按钮组件，支持多种变体和尺寸
 */
```

## Checklist

新建组件时确认：

- [ ] 文件名使用 PascalCase
- [ ] 组件使用具名函数（拦截器日志依赖）
- [ ] 组件顶部有注释说明
- [ ] 支持 `className` 和 `...props`
- [ ] 使用 `cn()` 合并类名
- [ ] 在 `index.js` 中导出
- [ ] 表单组件支持 `ref` 转发
- [ ] 考虑可访问性
