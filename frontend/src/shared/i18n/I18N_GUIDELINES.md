# I18N 国际化规范

本文档定义了项目国际化（i18n）的开发标准和最佳实践。

## 目录结构

```
shared/i18n/
├── index.js              # i18n 配置和初始化
├── locales/
│   ├── ko.json           # 韩语共享翻译
│   └── zh.json           # 中文共享翻译
└── I18N_GUIDELINES.md

# 模块级翻译
admin/modules/dashboard/locales/
├── ko.json
└── zh.json

member/modules/auth/locales/
├── ko.json
└── zh.json
```

## 支持的语言

| 代码 | 语言 | 说明 |
|------|------|------|
| `ko` | 韩语 | 默认语言、回退语言 |
| `zh` | 中文 | 备选语言 |

## 翻译键命名规范

### 命名规则

- 使用 camelCase
- 层级用点号分隔
- 按功能模块组织

```json
{
  "common": {
    "save": "저장",
    "cancel": "취소",
    "loading": "로딩 중..."
  },
  "auth": {
    "login": "로그인",
    "logout": "로그아웃",
    "loginFailed": "로그인 실패"
  },
  "validation": {
    "required": "필수 항목입니다",
    "invalidEmail": "유효하지 않은 이메일입니다"
  }
}
```

### 命名约定

| 类型 | 前缀/模式 | 示例 |
|------|----------|------|
| 按钮文本 | 动词 | `save`, `cancel`, `submit` |
| 标签 | 名词 | `email`, `password`, `companyName` |
| 提示信息 | 名词 + 描述 | `emailPlaceholder`, `passwordHelp` |
| 错误信息 | invalid/error + 名词 | `invalidEmail`, `loginError` |
| 成功信息 | success + 动词 | `saveSuccess`, `uploadSuccess` |
| 确认信息 | confirm + 动词 | `confirmDelete`, `confirmLogout` |

## 文件组织

### 共享翻译 (shared/i18n/locales/)

存放全局通用的翻译：

```json
{
  "common": {
    "save": "저장",
    "cancel": "취소"
  },
  "validation": {
    "required": "필수 항목입니다"
  },
  "errors": {
    "networkError": "네트워크 오류"
  }
}
```

### 模块翻译 (modules/xxx/locales/)

存放模块特定的翻译：

```json
// admin/modules/members/locales/ko.json
{
  "members": {
    "title": "회원 관리",
    "list": "회원 목록",
    "detail": "회원 상세",
    "status": {
      "active": "활성",
      "inactive": "비활성",
      "pending": "대기"
    }
  }
}
```

## 使用方式

### 在组件中使用

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('members.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 带参数的翻译

```json
{
  "showing": "{{start}}-{{end}} / {{total}}건 표시",
  "welcome": "{{name}}님 환영합니다"
}
```

```jsx
t('showing', { start: 1, end: 10, total: 100 })
// "1-10 / 100건 표시"

t('welcome', { name: '홍길동' })
// "홍길동님 환영합니다"
```

### 复数形式

```json
{
  "items": "{{count}}개 항목",
  "items_plural": "{{count}}개 항목들"
}
```

## 新增模块翻译

### 1. 创建翻译文件

```
modules/newModule/locales/
├── ko.json
└── zh.json
```

### 2. 在 i18n/index.js 中导入

```js
// 导入新模块翻译
import newModuleKo from '@member/modules/newModule/locales/ko.json';
import newModuleZh from '@member/modules/newModule/locales/zh.json';

// 合并到对应语言
const memberKo = mergeModules(
  // ... 其他模块
  newModuleKo
);

const memberZh = mergeModules(
  // ... 其他模块
  newModuleZh
);
```

## 翻译文件模板

### ko.json

```json
{
  "moduleName": {
    "title": "모듈 제목",
    "description": "모듈 설명",
    "actions": {
      "create": "생성",
      "edit": "수정",
      "delete": "삭제"
    },
    "messages": {
      "createSuccess": "생성되었습니다",
      "updateSuccess": "수정되었습니다",
      "deleteSuccess": "삭제되었습니다",
      "confirmDelete": "정말 삭제하시겠습니까?"
    },
    "fields": {
      "name": "이름",
      "status": "상태"
    },
    "status": {
      "active": "활성",
      "inactive": "비활성"
    }
  }
}
```

### zh.json

```json
{
  "moduleName": {
    "title": "模块标题",
    "description": "模块描述",
    "actions": {
      "create": "创建",
      "edit": "编辑",
      "delete": "删除"
    },
    "messages": {
      "createSuccess": "创建成功",
      "updateSuccess": "修改成功",
      "deleteSuccess": "删除成功",
      "confirmDelete": "确定要删除吗？"
    },
    "fields": {
      "name": "名称",
      "status": "状态"
    },
    "status": {
      "active": "活跃",
      "inactive": "非活跃"
    }
  }
}
```

## 注意事项

### 保持同步

两个语言文件的键必须完全一致：

```json
// ✅ 正确 - 键一致
// ko.json
{ "auth": { "login": "로그인" } }
// zh.json
{ "auth": { "login": "登录" } }

// ❌ 错误 - 键不一致
// ko.json
{ "auth": { "login": "로그인" } }
// zh.json
{ "auth": { "signIn": "登录" } }  // 键名不同
```

### 避免硬编码

```jsx
// ✅ 正确
<button>{t('common.save')}</button>

// ❌ 错误
<button>저장</button>
```

### 使用回退值

```jsx
// 提供回退值，防止翻译缺失
t('newKey', '默认文本')
```

## Checklist

新增翻译时确认：

- [ ] ko.json 和 zh.json 键完全一致
- [ ] 键名使用 camelCase
- [ ] 按模块组织翻译结构
- [ ] 在 i18n/index.js 中导入并合并
- [ ] 组件中使用 `t()` 函数
- [ ] 带参数的翻译使用 `{{param}}` 语法
