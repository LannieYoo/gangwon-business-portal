# Stores 开发规范

本文档定义了 `shared/stores` 目录下 Zustand Store 的开发标准和最佳实践。

## 目录结构

```
shared/stores/
├── index.js              # 统一导出入口
├── storeLogger.js        # Store 日志中间件
├── authStore.js          # 认证状态
├── uiStore.js            # UI 状态
└── STORES_GUIDELINES.md
```

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | camelCase，Store 后缀 | `authStore.js`, `uiStore.js` |
| Hook 名 | use 前缀 + PascalCase | `useAuthStore`, `useUIStore` |
| 状态字段 | camelCase | `isLoading`, `sidebarCollapsed` |
| Action | camelCase，动词开头 | `setUser`, `clearAuth`, `toggleSidebar` |

## Store 模板

### 基础 Store（带日志中间件）

```js
/**
 * UI State Store (Zustand)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getStorage, setStorage } from '@shared/utils/storage';
import { STORAGE_KEYS } from '@shared/utils/constants';
import { storeLogger } from './storeLogger';

export const useUIStore = create(
  devtools(
    storeLogger('UIStore')(
      (set) => ({
        // 状态
        theme: getStorage(STORAGE_KEYS.THEME, 'light'),
        sidebarCollapsed: false,
        
        // Actions - 第三个参数为 action 名称（用于日志）
        setTheme: (theme) => {
          setStorage(STORAGE_KEYS.THEME, theme);
          set({ theme }, false, 'setTheme');
        },
        
        toggleSidebar: () =>
          set((state) => ({
            sidebarCollapsed: !state.sidebarCollapsed
          }), false, 'toggleSidebar')
      })
    ),
    { name: 'UIStore' }
  )
);
```

### 带异步操作的 Store

```js
/**
 * Authentication Store (Zustand)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import authService from '@shared/services/auth.service';
import { storeLogger } from './storeLogger';

export const useAuthStore = create(
  devtools(
    storeLogger('AuthStore')(
      (set) => ({
        // 状态
        user: authService.getCurrentUserFromStorage(),
        isAuthenticated: authService.isAuthenticated(),
        isLoading: false,
        
        // 同步 Actions
        setUser: (user) => set({ user, isAuthenticated: true }, false, 'setUser'),
        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
        
        clearAuth: () => {
          authService.clearAuth();
          set({ user: null, isAuthenticated: false }, false, 'clearAuth');
        },
        
        // 异步 Actions
        logout: async () => {
          await authService.logout();
          set({ user: null, isAuthenticated: false }, false, 'logout');
        }
      })
    ),
    { name: 'AuthStore' }
  )
);

export default useAuthStore;
```

## 状态设计原则

### 最小化状态

只存储必要的状态，派生数据通过选择器计算：

```js
// ✅ 正确 - 最小化状态
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] }))
}));

// 派生数据通过选择器
const totalCount = useCartStore((state) => state.items.length);
const totalPrice = useCartStore((state) => 
  state.items.reduce((sum, item) => sum + item.price, 0)
);

// ❌ 错误 - 存储派生数据
const useCartStore = create((set) => ({
  items: [],
  totalCount: 0,  // 冗余
  totalPrice: 0,  // 冗余
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
    totalCount: state.items.length + 1,
    totalPrice: state.totalPrice + item.price
  }))
}));
```

### 状态持久化

需要持久化的状态使用 storage 工具：

```js
import { getStorage, setStorage } from '@shared/utils/storage';
import { STORAGE_KEYS } from '@shared/utils/constants';

export const useUIStore = create((set) => ({
  // 从 storage 初始化
  theme: getStorage(STORAGE_KEYS.THEME, 'light'),
  
  setTheme: (theme) => {
    // 同步到 storage
    setStorage(STORAGE_KEYS.THEME, theme);
    set({ theme });
  }
}));
```

## Action 命名约定

| 操作 | 前缀 | 示例 |
|------|------|------|
| 设置值 | `set` | `setUser`, `setTheme` |
| 切换布尔值 | `toggle` | `toggleSidebar`, `toggleTheme` |
| 清除/重置 | `clear` / `reset` | `clearAuth`, `resetFilters` |
| 添加 | `add` | `addItem`, `addNotification` |
| 移除 | `remove` | `removeItem`, `removeNotification` |
| 异步操作 | 动词 | `login`, `logout`, `fetchData` |

## 使用 devtools

所有 Store 必须使用 devtools 中间件：

```js
import { devtools } from 'zustand/middleware';

export const useMyStore = create(
  devtools(
    (set) => ({
      // ...
    }),
    { name: 'MyStore' }  // 必须提供名称
  )
);
```

## 选择器优化

### 使用选择器避免不必要的重渲染

```js
// ✅ 正确 - 只订阅需要的状态
const user = useAuthStore((state) => state.user);
const isLoading = useAuthStore((state) => state.isLoading);

// ❌ 错误 - 订阅整个 store
const { user, isLoading } = useAuthStore();
```

### 复杂选择器使用 shallow

```js
import { shallow } from 'zustand/shallow';

// 选择多个字段时使用 shallow 比较
const { user, isAuthenticated } = useAuthStore(
  (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
  shallow
);
```

## 日志中间件

Store 通过 `storeLogger` 中间件自动记录状态变更（不使用拦截器模式）：

```js
// storeLogger.js
import { info, LOG_LAYERS } from '@shared/utils/logger';

export const storeLogger = (storeName) => (config) => (set, get, api) => {
  const loggedSet = (partial, replace, actionName) => {
    const prevState = get();
    set(partial, replace, actionName);
    const nextState = get();
    
    const changes = typeof partial === 'function' 
      ? Object.keys(nextState).filter(key => prevState[key] !== nextState[key])
      : Object.keys(partial);
    
    info(LOG_LAYERS.STORE, `Store: ${storeName}.${actionName || 'setState'}`, {
      store_name: storeName,
      action_name: actionName || 'setState',
      changed_fields: changes
    });
  };
  return config(loggedSet, get, api);
};
```

> **为什么使用中间件而非拦截器？**
> - Zustand 天然支持中间件模式，更简洁优雅
> - 中间件在 store 创建时绑定，无需额外安装步骤
> - 与 devtools 等其他中间件无缝集成

### 使用方式

1. 在 `create()` 中嵌套 `storeLogger(storeName)`
2. 每个 `set()` 调用传入第三个参数作为 action 名称

```js
// ✅ 正确 - 传入 action 名称
set({ user }, false, 'setUser');

// ❌ 错误 - 缺少 action 名称
set({ user });
```

## 导出规范

### 在 index.js 中导出

```js
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
```

### Store 文件导出

```js
// 命名导出（推荐）
export const useAuthStore = create(...);

// 默认导出（可选）
export default useAuthStore;
```

## 文件注释

每个 Store 文件顶部添加说明：

```js
/**
 * Authentication Store (Zustand)
 * 
 * 管理用户认证状态，包括登录状态、用户信息等。
 */
```

## Checklist

新建 Store 时确认：

- [ ] 文件名使用 `Store.js` 后缀
- [ ] Hook 名使用 `use` 前缀
- [ ] 文件顶部有注释说明
- [ ] 使用 `devtools` 中间件
- [ ] 使用 `storeLogger` 中间件
- [ ] 提供 `name` 给 devtools
- [ ] 每个 `set()` 传入 action 名称
- [ ] 需要持久化的状态使用 storage
- [ ] 使用 `STORAGE_KEYS` 常量
- [ ] 在 `index.js` 中导出
