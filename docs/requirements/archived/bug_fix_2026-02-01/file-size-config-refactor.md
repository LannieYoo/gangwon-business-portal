# 文件大小配置重构

## 问题

文件大小限制配置分散在多个位置：
- 3个代码文件中硬编码
- 6个翻译文件中硬编码（共12处）
- 修改容量限制需要更新15个位置

## 解决方案

### 统一配置源

**文件**: `frontend/src/shared/utils/constants.js`

```javascript
// File Upload
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
export const MAX_FILE_SIZE_MB = 20; // 20MB for display
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const MAX_IMAGE_SIZE_MB = 5; // 5MB for display
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB in bytes
export const MAX_DOCUMENT_SIZE_MB = 20; // 20MB for display
```

### 代码层面

**修改前**：
```javascript
// FileAttachments.jsx
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
```

**修改后**：
```javascript
// FileAttachments.jsx
import { MAX_FILE_SIZE } from '@shared/utils/constants';
```

### 翻译层面

**修改前**：
```json
{
  "hint": "파일 형식: PDF, DOC, XLS / 최대 20MB"
}
```

**修改后**：
```json
{
  "hint": "파일 형식: PDF, DOC, XLS / 최대 {{maxSize}}MB"
}
```

**使用方式**：
```javascript
import { MAX_FILE_SIZE_MB } from '@shared/utils/constants';

t('projects.attachments.hint', { maxSize: MAX_FILE_SIZE_MB })
```

## 修改的文件

### 代码文件
1. ✅ `frontend/src/shared/utils/constants.js` - 添加 MB 单位常量
2. ✅ `frontend/src/shared/components/FileAttachments.jsx` - 导入使用常量

### 翻译文件（使用变量插值）
3. ✅ `frontend/src/member/modules/projects/locales/ko.json` - 4处
4. ✅ `frontend/src/member/modules/projects/locales/zh.json` - 4处
5. ✅ `frontend/src/member/modules/support/locales/ko.json` - 1处
6. ✅ `frontend/src/member/modules/support/locales/zh.json` - 1处
7. ✅ `frontend/src/member/modules/performance/locales/ko.json` - 2处
8. ✅ `frontend/src/member/modules/performance/locales/zh.json` - 2处

## 使用示例

### 在组件中使用

```javascript
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '@shared/utils/constants';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    alert(t('projects.fileTooLarge', { maxSize: MAX_FILE_SIZE_MB }));
    return;
  }
  
  // 显示提示
  return (
    <p>{t('projects.uploadHint', { maxSize: MAX_FILE_SIZE_MB })}</p>
  );
}
```

### 在 helpers.js 中使用

```javascript
import { MAX_FILE_SIZE, MAX_IMAGE_SIZE, MAX_DOCUMENT_SIZE } from './constants';

export function getMaxFileSize(category) {
  if (!category) return MAX_FILE_SIZE;
  if (category === 'image') return MAX_IMAGE_SIZE;
  if (category === 'document') return MAX_DOCUMENT_SIZE;
  return MAX_FILE_SIZE;
}
```

## 优势

1. **单一数据源**: 只需在 `constants.js` 中修改一次
2. **类型安全**: 字节和 MB 单位分开定义，避免混淆
3. **易于维护**: 所有配置集中管理
4. **国际化友好**: 翻译文本使用变量插值
5. **向后兼容**: 不影响现有功能

## 未来修改容量限制

只需修改 `constants.js` 中的两个值：

```javascript
export const MAX_FILE_SIZE = 30 * 1024 * 1024; // 改为 30MB
export const MAX_FILE_SIZE_MB = 30; // 改为 30MB
```

所有使用该常量的地方会自动更新！

## 注意事项

1. **后端配置**: 后端的 `settings.py` 仍需单独修改
2. **环境变量**: 可以考虑将配置移到环境变量中
3. **废弃文件**: `*_deprecated` 文件未修改，因为不再使用

## 完成状态

- [x] 添加 MB 单位常量到 constants.js
- [x] 修改 FileAttachments.jsx 导入常量
- [x] 更新所有翻译文件使用变量插值
- [x] 创建重构文档
- [ ] 更新使用这些翻译的组件传入 maxSize 参数

## 后续任务

需要更新所有使用这些翻译键的组件，确保传入 `maxSize` 参数：

```javascript
// 需要更新的组件示例
t('projects.attachments.hint', { maxSize: MAX_FILE_SIZE_MB })
t('projects.fileTooLarge', { maxSize: MAX_FILE_SIZE_MB, fileName: file.name })
```

这样才能正确显示文件大小限制。
