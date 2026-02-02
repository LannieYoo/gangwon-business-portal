# 统计报表列可见性控制功能

## 功能概述

为了解决表格列太多导致的显示和使用问题，我们实现了**列可见性控制**功能，允许用户：

1. ✅ 自定义显示/隐藏任意列
2. ✅ 按分组快速切换列
3. ✅ 使用预设配置（全部、核心、最小）
4. ✅ 配置自动保存到 localStorage
5. ✅ 必须列（企业注册号、企业名）不可隐藏

## 实现文件

### 1. Hook: useColumnVisibility.js
**路径**: `frontend/src/admin/modules/statistics/hooks/useColumnVisibility.js`

**功能**:
- 管理列可见性状态
- 持久化到 localStorage
- 提供列/分组切换方法
- 预设配置管理

**核心方法**:
```javascript
const {
  visibleColumns,           // 当前可见列数组
  toggleColumn,             // 切换单个列
  toggleGroup,              // 切换整个分组
  applyPreset,              // 应用预设
  resetToDefault,           // 重置为默认
  showAll,                  // 显示全部
  hideAll,                  // 隐藏全部（保留必须列）
  isColumnVisible,          // 检查列是否可见
  isColumnToggleable,       // 检查列是否可切换
  isGroupVisible,           // 检查分组是否全部可见
  isGroupPartiallyVisible,  // 检查分组是否部分可见
} = useColumnVisibility();
```

### 2. 组件: ColumnVisibilityPanel.jsx
**路径**: `frontend/src/admin/modules/statistics/components/Report/ColumnVisibilityPanel.jsx`

**功能**:
- 提供可视化的列选择界面
- 按分组组织列
- 快速预设按钮
- 全选/全不选功能

**UI 结构**:
```
┌─────────────────────────────┐
│ 列设置 (19/19)        [×]   │
├─────────────────────────────┤
│ 快速操作:                    │
│ [全部] [核心] [最小]         │
├─────────────────────────────┤
│ ☑ 基本信息                   │
│   ☑ 企业注册号 (필수)        │
│   ☑ 企业名 (필수)            │
├─────────────────────────────┤
│ ☑ 快速筛选                   │
│   ☑ 政府项目                 │
├─────────────────────────────┤
│ ☐ 企业特征                   │
│   ☑ 标准产业(大分类)         │
│   ☐ 标准产业(中分类)         │
│   ...                        │
├─────────────────────────────┤
│ [全部显示] [全部隐藏]        │
└─────────────────────────────┘
```

## 列分组配置

### 1. 基本信息 (BASIC)
- ✅ 企业注册号 (必须)
- ✅ 企业名 (必须)

### 2. 快速筛选 (QUICK_FILTERS)
- 政府项目

### 3. 企业特征 (COMPANY_PROFILE)
- 标准产业(大分类)
- 标准产业(中分类)
- 江原主导产业(大分类)
- 江原主导产业(中分类)
- 江原7大未来产业
- 未来有望新技术
- 企业工龄
- 创业阶段
- 所在地

### 4. 经营指标 (BUSINESS_METRICS)
- 投资额
- 年营收
- 出口额
- 员工数
- 专利数

### 5. 代表者信息 (REPRESENTATIVE)
- 代表者性别
- 代表者年龄

## 预设配置

### 1. 全部 (ALL)
显示所有 19 列

### 2. 核心 (CORE) - 默认
显示 8 个核心列：
- 企业注册号
- 企业名
- 标准产业(大分类)
- 所在地
- 创业阶段
- 年营收
- 员工数
- 政府项目

### 3. 最小 (MINIMUM)
仅显示 2 个必须列：
- 企业注册号
- 企业名

## 使用方法

### 在 StatisticsReportView 中集成

```javascript
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import { ColumnVisibilityPanel } from '../components/Report/ColumnVisibilityPanel';

function StatisticsReportView() {
  // 1. 使用 hook
  const columnVisibility = useColumnVisibility();

  return (
    <div>
      {/* 2. 添加控制面板 */}
      <div className="flex justify-end mb-4">
        <ColumnVisibilityPanel
          visibleColumns={columnVisibility.visibleColumns}
          onToggleColumn={columnVisibility.toggleColumn}
          onToggleGroup={columnVisibility.toggleGroup}
          onApplyPreset={columnVisibility.applyPreset}
          onShowAll={columnVisibility.showAll}
          onHideAll={columnVisibility.hideAll}
          isColumnVisible={columnVisibility.isColumnVisible}
          isColumnToggleable={columnVisibility.isColumnToggleable}
          isGroupVisible={columnVisibility.isGroupVisible}
          isGroupPartiallyVisible={columnVisibility.isGroupPartiallyVisible}
        />
      </div>

      {/* 3. 传递给表格组件 */}
      <StatisticsTable
        visibleColumns={columnVisibility.visibleColumns}
        // ... 其他 props
      />
    </div>
  );
}
```

### 在 StatisticsTable 中使用

```javascript
function StatisticsTable({ visibleColumns, ...props }) {
  // 过滤列配置
  const filteredColumns = TABLE_COLUMN_CONFIGS.filter(col =>
    visibleColumns.includes(col.key)
  );

  return (
    <Table columns={filteredColumns} {...props} />
  );
}
```

## 数据持久化

配置自动保存到 `localStorage`，键名为 `statistics_column_visibility`。

**存储格式**:
```json
["businessRegNo", "enterpriseName", "ksicMajor", "region", ...]
```

**加载逻辑**:
1. 尝试从 localStorage 读取
2. 如果读取失败或不存在，使用默认配置（核心列）
3. 确保必须列始终包含在内

## 翻译键

### 韩语 (ko.json)
```json
{
  "statistics": {
    "table": {
      "columnSettings": "열 설정",
      "quickActions": "빠른 설정",
      "showAll": "전체 표시",
      "hideAll": "전체 숨김"
    },
    "columnGroups": {
      "basic": "기본 정보",
      "quickFilters": "빠른 필터",
      "companyProfile": "기업 특성",
      "businessMetrics": "경영 지표",
      "representative": "대표자 정보"
    },
    "columnPresets": {
      "all": "전체",
      "core": "핵심",
      "minimum": "최소"
    }
  }
}
```

### 中文 (zh.json)
```json
{
  "statistics": {
    "table": {
      "columnSettings": "列设置",
      "quickActions": "快速设置",
      "showAll": "全部显示",
      "hideAll": "全部隐藏"
    },
    "columnGroups": {
      "basic": "基本信息",
      "quickFilters": "快速筛选",
      "companyProfile": "企业特征",
      "businessMetrics": "经营指标",
      "representative": "代表者信息"
    },
    "columnPresets": {
      "all": "全部",
      "core": "核心",
      "minimum": "最小"
    }
  }
}
```

## 用户体验优化

### 1. 视觉反馈
- ✅ 选中状态清晰可见
- ✅ 部分选中状态（分组）
- ✅ 必须列标记 "(필수)"
- ✅ 禁用状态样式

### 2. 交互优化
- ✅ 点击分组标题快速切换整组
- ✅ 预设按钮一键切换
- ✅ 显示当前可见列数量
- ✅ 点击外部自动关闭面板

### 3. 性能优化
- ✅ 使用 React.memo 避免不必要的重渲染
- ✅ useCallback 缓存回调函数
- ✅ localStorage 异步操作

## 扩展建议

### 1. 列宽调整
```javascript
const [columnWidths, setColumnWidths] = useState({});

const handleColumnResize = (columnKey, width) => {
  setColumnWidths(prev => ({ ...prev, [columnKey]: width }));
};
```

### 2. 列顺序调整
```javascript
const [columnOrder, setColumnOrder] = useState([]);

const handleColumnReorder = (dragIndex, hoverIndex) => {
  // 实现拖拽排序
};
```

### 3. 保存多个配置
```javascript
const [savedConfigs, setSavedConfigs] = useState({});

const saveConfig = (name) => {
  setSavedConfigs(prev => ({
    ...prev,
    [name]: visibleColumns
  }));
};
```

### 4. 导出时包含列配置
```javascript
const exportWithConfig = () => {
  const config = {
    visibleColumns,
    data: filteredData
  };
  // 导出逻辑
};
```

## 测试清单

- [ ] 切换单个列正常工作
- [ ] 切换分组正常工作
- [ ] 预设配置正常工作
- [ ] 必须列无法隐藏
- [ ] 配置正确保存到 localStorage
- [ ] 刷新页面后配置保持
- [ ] 翻译正确显示
- [ ] 响应式布局正常
- [ ] 性能无明显问题

## 注意事项

1. **必须列保护**: 企业注册号和企业名始终可见，不可隐藏
2. **默认配置**: 首次使用显示核心列（8列），而非全部列
3. **持久化**: 配置保存在 localStorage，清除浏览器数据会重置
4. **兼容性**: 需要浏览器支持 localStorage
5. **性能**: 列数较多时，建议使用虚拟滚动优化渲染
