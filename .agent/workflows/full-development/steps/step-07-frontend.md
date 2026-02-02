# Step 7: 前端开发

## 阶段信息
- **阶段**: 7/10 - 前端开发
- **Skill**: `dev-senior_frontend`
- **输入**: `docs/stories.md`, `docs/architecture.md`
- **产出物**: `src/frontend/`

---

## 执行步骤

### 1. 加载上下文

读取并分析：
- `docs/architecture.md` - 前端技术栈、目录结构
- `docs/stories.md` - 前端相关 Story
- `docs/prd.md` - UI/UX 需求

### 2. 加载 Skill

加载 `dev-senior_frontend` skill，获取前端开发专业知识。

### 3. 任务排序

从 `docs/stories.md` 获取前端相关 Story，按依赖关系排序：

```
1. [FE-001] 项目初始化和配置
2. [FE-002] 路由配置
3. [FE-003] 全局状态管理
4. [FE-004] API 服务层
5. [FE-005] 通用组件库
6. [FE-006] 页面组件
...
```

### 4. 目录结构

```
src/frontend/
├── public/              # 静态资源
├── src/
│   ├── assets/          # 图片、字体等
│   ├── components/      # 通用组件
│   │   ├── common/      # 基础组件
│   │   ├── layout/      # 布局组件
│   │   └── features/    # 功能组件
│   ├── hooks/           # 自定义 Hooks
│   ├── pages/           # 页面组件
│   ├── services/        # API 服务
│   ├── store/           # 状态管理
│   ├── styles/          # 全局样式
│   ├── types/           # TypeScript 类型
│   ├── utils/           # 工具函数
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 5. 开发循环

对于每个 Story：

```
┌─────────────────────────────────────────────┐
│  Story: {story_id} - {story_title}          │
├─────────────────────────────────────────────┤
│  1. 阅读 Story 描述和验收标准               │
│  2. 创建组件文件                            │
│  3. 实现组件逻辑                            │
│  4. 编写样式                                │
│  5. 添加类型定义                            │
│  6. 运行检查脚本                            │
│  7. 标记完成 / 修复问题                     │
└─────────────────────────────────────────────┘
```

### 6. 组件规范

#### 6.1 组件结构
```tsx
// components/features/UserCard/UserCard.tsx
import { FC } from 'react';
import styles from './UserCard.module.css';
import { UserCardProps } from './types';

/**
 * 用户卡片组件
 * 用于显示用户基本信息
 */
export const UserCard: FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <div className={styles.card} onClick={() => onClick?.(user.id)}>
      <img src={user.avatar} alt={user.name} className={styles.avatar} />
      <div className={styles.info}>
        <h3 className={styles.name}>{user.name}</h3>
        <p className={styles.email}>{user.email}</p>
      </div>
    </div>
  );
};
```

#### 6.2 类型定义
```tsx
// components/features/UserCard/types.ts
import { User } from '@/types/user';

export interface UserCardProps {
  user: User;
  onClick?: (userId: number) => void;
}
```

#### 6.3 样式文件
```css
/* components/features/UserCard/UserCard.module.css */
.card {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
```

#### 6.4 导出索引
```tsx
// components/features/UserCard/index.ts
export { UserCard } from './UserCard';
export type { UserCardProps } from './types';
```

### 7. API 服务层

```tsx
// services/userService.ts
import { api } from './api';
import { User, CreateUserDto, UpdateUserDto } from '@/types/user';

export const userService = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post<User>('/users', data),
  update: (id: number, data: UpdateUserDto) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};
```

### 8. 状态管理

```tsx
// store/userStore.ts (Zustand 示例)
import { create } from 'zustand';
import { User } from '@/types/user';
import { userService } from '@/services/userService';

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await userService.getAll();
      set({ users, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
```

### 9. 检查脚本

每完成一个模块，运行检查：

```bash
# TypeScript 检查
npm run type-check

# ESLint 检查
npm run lint

# 组件检查
python scripts/check-component.py --dir src/components/

# 样式检查
python scripts/check-styles.py --dir src/

# 无障碍检查
python scripts/check-a11y.py --dir src/components/
```

检查项：
- [ ] TypeScript 无错误
- [ ] ESLint 无警告
- [ ] 组件命名规范
- [ ] Props 类型定义
- [ ] 无障碍属性

### 10. Story 完成确认

```
[✓] Story FE-001 完成
    - 创建文件: components/features/UserCard/
    - 检查结果: 通过
    - 用时: 30 分钟

继续下一个 Story? [Y/n]
```

---

## 完成检查

- [ ] 所有前端 Story 已完成
- [ ] TypeScript 编译通过
- [ ] ESLint 检查通过
- [ ] 页面可正常访问
- [ ] 与后端 API 集成成功

## 状态更新

```yaml
phases:
  frontend:
    status: completed
    completed_at: {current_time}
    stories_completed:
      - FE-001
      - FE-002
      - ...
```

## 下一步

→ 进入 `step-08-testing.md`
