---
name: prd_export_i18n
description: Admin 模块导出功能国际化需求文档
---

# PRD-007: 导出功能国际化 (Export i18n)

## 0. 版本信息

| 版本 | 日期       | 作者   | 说明                                       |
| :--- | :--------- | :----- | :----------------------------------------- |
| v1.0 | 2026-02-07 | Claude | 初始版本                                   |
| v1.1 | 2026-02-07 | Claude | 采用方案B：前端生成 Excel，完整国际化支持 |
| v1.2 | 2026-02-07 | Claude | 扩展至所有 Admin 模块（4个模块）          |

## 1. 执行摘要与目标

### 1.1 功能概述

将 Admin 所有模块的导出功能（文件名、工作表名、列名、数据值）全部转换为国际化，确保导出的 Excel/CSV 文件根据用户语言设置显示对应的中文或韩文内容。

### 1.2 涉及模块

| 模块 | 文件 | 当前导出方法 |
|------|------|--------------|
| Statistics (统计报告) | `useStatistics.js` | `statisticsService.exportToExcel()` |
| Performance (业绩管理) | `PerformanceList.jsx` | `performanceService.exportPerformance()` |
| Members (会员管理) | `MemberList.jsx` | `membersService.exportMembers()` |
| Projects (事业公告) | `ProjectList.jsx` | `projectsService.exportProjects()` |

### 1.3 核心业务痛点

- 当前后端导出的列名为英文数据库字段名（如 `business_number`, `company_name`）
- 数据值未翻译（如 `MALE`, `GROWTH` 等枚举值直接输出）
- 工作表名硬编码为英文
- 导出内容与用户界面语言不一致，影响专业性

### 1.4 成功指标

- **100% 国际化覆盖**：所有模块导出相关的用户可见文本均使用 i18n
- **语言一致性**：导出文件内容与用户界面语言一致

### 1.5 技术方案选择

**采用方案B：前端生成 Excel**

| 考虑因素 | 说明 |
|----------|------|
| 翻译一致性 | ✅ 复用前端现有 i18n 系统 |
| 维护成本 | ✅ 只需维护一套翻译文件 |
| 代码复用 | ✅ 共享导出工具，各模块复用 |
| 实现方式 | 前端引入 `xlsx` 库，获取数据后本地生成 Excel |

## 2. 当前状态分析

### 2.1 各模块已有表格列配置 ✅

| 模块 | 列配置位置 | 使用 i18n |
|------|------------|-----------|
| Statistics | `TABLE_COLUMN_CONFIGS` in `enum.js` | ✅ `labelKey` |
| Performance | `tableColumns` in `PerformanceList.jsx` | ✅ `t()` |
| Members | `tableColumns` in `MemberList.jsx` | ✅ `t()` |
| Projects | `tableColumns` in `ProjectList.jsx` | ✅ `t()` |

### 2.2 后端导出问题 ❌

所有模块的后端导出都存在相同问题：
- 列名为英文数据库字段名
- 数据值未翻译
- 工作表名/文件名硬编码

## 3. 功能需求 (Functional Requirements)

### 3.1 创建共享导出工具（新增）

**新增文件**：
```
frontend/src/shared/utils/excelExporter.js
```

**核心函数**：
```javascript
/**
 * 通用 Excel 导出工具
 * @param {Object} options - 导出配置
 * @param {Array} options.data - 数据数组
 * @param {Array} options.columns - 列配置 [{key, label, render?}]
 * @param {Function} options.t - i18n 翻译函数
 * @param {string} options.filename - 文件名（不含扩展名）
 * @param {string} options.sheetName - 工作表名
 * @param {Function} options.valueTranslator - 可选的值翻译函数
 */
export const exportToExcel = async (options) => {
  const XLSX = await import('xlsx'); // 动态导入，按需加载

  const { data, columns, t, filename, sheetName, valueTranslator } = options;

  // 1. 生成翻译后的列名
  const headers = columns.map(col => col.label || t(col.labelKey) || col.key);

  // 2. 翻译数据值
  const translatedData = data.map(row => {
    const translatedRow = {};
    columns.forEach(col => {
      const rawValue = row[col.key];
      const header = col.label || t(col.labelKey) || col.key;

      // 使用自定义渲染或值翻译器
      if (col.exportRender) {
        translatedRow[header] = col.exportRender(rawValue, row);
      } else if (valueTranslator) {
        translatedRow[header] = valueTranslator(col.key, rawValue, row);
      } else {
        translatedRow[header] = rawValue ?? '';
      }
    });
    return translatedRow;
  });

  // 3. 生成 Excel 并下载
  const ws = XLSX.utils.json_to_sheet(translatedData, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * 通用 CSV 导出工具
 */
export const exportToCsv = async (options) => {
  const XLSX = await import('xlsx');
  // ... 类似逻辑，输出 CSV
};
```

### 3.2 各模块修改

#### 3.2.1 Statistics 模块

**修改文件**: `useStatistics.js`

```javascript
import { exportToExcel } from '@shared/utils/excelExporter';
import { TABLE_COLUMN_CONFIGS, getFieldTranslation } from '../enum';

const handleExportToExcel = async () => {
  // 获取全部数据（不分页）
  const allData = await statisticsService.queryCompanies({ ...params, pageSize: 10000 });

  await exportToExcel({
    data: allData.items,
    columns: TABLE_COLUMN_CONFIGS,
    t,
    filename: `${t('statistics.export.filename')}_${year}_${timestamp}`,
    sheetName: t('statistics.export.sheetName'),
    valueTranslator: (key, value) => getFieldTranslation(t, key, value),
  });
};
```

#### 3.2.2 Performance 模块

**修改文件**: `PerformanceList.jsx`

```javascript
import { exportToExcel } from '@shared/utils/excelExporter';

const handleExport = async (format) => {
  const exportColumns = tableColumns.filter(col => col.key !== 'actions');

  await exportToExcel({
    data: allRecords,
    columns: exportColumns,
    t,
    filename: `${t('admin.performance.export.filename')}_${timestamp}`,
    sheetName: t('admin.performance.export.sheetName'),
  });
};
```

#### 3.2.3 Members 模块

**修改文件**: `MemberList.jsx`

```javascript
import { exportToExcel } from '@shared/utils/excelExporter';

const handleExport = async (format) => {
  const exportColumns = tableColumns.filter(col => col.key !== 'actions');

  await exportToExcel({
    data: allMembers,
    columns: exportColumns,
    t,
    filename: `${t('admin.members.export.filename')}_${timestamp}`,
    sheetName: t('admin.members.export.sheetName'),
  });
};
```

#### 3.2.4 Projects 模块

**修改文件**: `ProjectList.jsx`

```javascript
import { exportToExcel } from '@shared/utils/excelExporter';

const handleExport = async (format) => {
  const exportColumns = tableColumns.filter(col => col.key !== 'actions');

  await exportToExcel({
    data: allProjects,
    columns: exportColumns,
    t,
    filename: `${t('admin.projects.export.filename')}_${timestamp}`,
    sheetName: t('admin.projects.export.sheetName'),
  });
};
```

### 3.3 新增翻译键

#### Statistics 模块 (`locales/zh.json` / `ko.json`)
已有 `statistics.export.filename`，需新增 `sheetName`

#### Performance 模块
```json
// zh.json
"admin": {
  "performance": {
    "export": {
      "filename": "业绩报告",
      "sheetName": "业绩数据"
    }
  }
}

// ko.json
"admin": {
  "performance": {
    "export": {
      "filename": "실적_리포트",
      "sheetName": "실적데이터"
    }
  }
}
```

#### Members 模块
```json
// zh.json
"admin": {
  "members": {
    "export": {
      "filename": "会员列表",
      "sheetName": "会员数据"
    }
  }
}

// ko.json
"admin": {
  "members": {
    "export": {
      "filename": "회원_목록",
      "sheetName": "회원데이터"
    }
  }
}
```

#### Projects 模块
```json
// zh.json
"admin": {
  "projects": {
    "export": {
      "filename": "事业公告",
      "sheetName": "公告数据"
    }
  }
}

// ko.json
"admin": {
  "projects": {
    "export": {
      "filename": "사업_공고",
      "sheetName": "공고데이터"
    }
  }
}
```

## 4. 验收标准 (Acceptance Criteria)

### 4.1 功能验收

**所有模块通用**：
- [ ] 中文环境：文件名、工作表名、列名、数据值均为中文
- [ ] 韩文环境：文件名、工作表名、列名、数据值均为韩文
- [ ] CSV 导出同样遵循国际化规则
- [ ] 切换语言后导出内容即时更新

**各模块独立验证**：
- [ ] Statistics: 导出包含所有统计列，枚举值已翻译
- [ ] Performance: 导出包含业绩记录，状态已翻译
- [ ] Members: 导出包含会员信息，审批状态已翻译
- [ ] Projects: 导出包含公告信息，状态已翻译

### 4.2 代码质量

- [ ] 共享导出工具位于 `@shared/utils/`
- [ ] 各模块复用共享工具，无重复代码
- [ ] 无硬编码的中文/韩文/英文文本
- [ ] 所有新增翻译键在 zh.json 和 ko.json 中同步
- [ ] 使用动态导入 `import()` 按需加载 xlsx 库

## 5. 修改文件清单

| 文件路径 | 修改类型 | 说明 |
|----------|----------|------|
| **共享** | | |
| `frontend/package.json` | 修改 | 添加 `xlsx` 依赖 |
| `frontend/src/shared/utils/excelExporter.js` | 新增 | 共享 Excel/CSV 导出工具 |
| **Statistics 模块** | | |
| `frontend/src/admin/modules/statistics/hooks/useStatistics.js` | 修改 | 改用前端导出 |
| `frontend/src/admin/modules/statistics/locales/zh.json` | 修改 | 添加 sheetName |
| `frontend/src/admin/modules/statistics/locales/ko.json` | 修改 | 添加 sheetName |
| **Performance 模块** | | |
| `frontend/src/admin/modules/performance/PerformanceList.jsx` | 修改 | 改用前端导出 |
| `frontend/src/admin/modules/performance/locales/zh.json` | 修改 | 添加 export 键 |
| `frontend/src/admin/modules/performance/locales/ko.json` | 修改 | 添加 export 键 |
| **Members 模块** | | |
| `frontend/src/admin/modules/members/MemberList.jsx` | 修改 | 改用前端导出 |
| `frontend/src/admin/modules/members/locales/zh.json` | 修改 | 添加 export 键 |
| `frontend/src/admin/modules/members/locales/ko.json` | 修改 | 添加 export 键 |
| **Projects 模块** | | |
| `frontend/src/admin/modules/projects/ProjectList.jsx` | 修改 | 改用前端导出 |
| `frontend/src/admin/modules/projects/locales/zh.json` | 修改 | 添加 export 键 |
| `frontend/src/admin/modules/projects/locales/ko.json` | 修改 | 添加 export 键 |

## 6. 开发工作量估算

| 任务 | 预估时间 |
|------|----------|
| 安装 xlsx 依赖 | 2 分钟 |
| 创建共享 excelExporter.js | 45 分钟 |
| 修改 Statistics 模块 | 30 分钟 |
| 修改 Performance 模块 | 20 分钟 |
| 修改 Members 模块 | 20 分钟 |
| 修改 Projects 模块 | 20 分钟 |
| 更新所有翻译文件 | 20 分钟 |
| 功能测试（4个模块） | 40 分钟 |
| **合计** | **约 3.5 小时** |

## 7. 技术依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| xlsx | ^0.18.5 | Excel/CSV 文件生成 |

## 8. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| xlsx 库包体积 (~500KB) | 中 | 使用动态导入 `import()` 按需加载 |
| 大数据量性能 | 低 | 各模块数据通常 < 10000 条 |
| 列配置不一致 | 低 | 复用现有 tableColumns，添加 exportRender |
| 后端接口保留 | 无 | 后端 /export 接口保留作为备用 |

## 9. 实施顺序

1. **Phase 1**: 创建共享导出工具 + 安装依赖
2. **Phase 2**: 修改 Statistics 模块（最复杂，有数据值翻译）
3. **Phase 3**: 修改 Members 模块
4. **Phase 4**: 修改 Performance 模块
5. **Phase 5**: 修改 Projects 模块
6. **Phase 6**: 全面测试

---

_本 PRD 根据项目规范生成。_
