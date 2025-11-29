# Charts Components

图表组件库 - 基于 ECharts 的 React 图表组件封装

## 组件列表

### 基础组件

- **BaseChart**: 基础图表组件，封装了 ECharts React 组件
- **LineChart**: 折线图组件，用于显示趋势数据
- **BarChart**: 柱状图组件，用于显示分类数据对比
- **MixedChart**: 混合图表组件，支持柱状图和折线图组合

### 业务组件

- **PerformanceTrendChart**: 绩效数据趋势图组件
- **MemberGrowthChart**: 会员增长图表组件
- **ProjectApplicationChart**: 项目申请统计图表组件

## 使用方法

### 基础图表组件

#### LineChart - 折线图

```jsx
import { LineChart } from '@shared/components';

<LineChart
  categories={['2020', '2021', '2022', '2023', '2024']}
  series={[
    {
      name: '销售额',
      data: [100, 200, 150, 300, 250],
      color: '#3b82f6'
    }
  ]}
  height="400px"
  smooth={true}
  area={true}
/>
```

#### BarChart - 柱状图

```jsx
import { BarChart } from '@shared/components';

<BarChart
  categories={['Q1', 'Q2', 'Q3', 'Q4']}
  series={[
    {
      name: '申请数',
      data: [10, 20, 15, 30],
      color: '#10b981'
    },
    {
      name: '批准数',
      data: [8, 18, 12, 25],
      color: '#3b82f6'
    }
  ]}
  height="400px"
/>
```

#### MixedChart - 混合图表

```jsx
import { MixedChart } from '@shared/components';

<MixedChart
  categories={['2020', '2021', '2022', '2023']}
  series={[
    {
      name: '销售额',
      type: 'bar',
      data: [100, 200, 150, 300],
      color: '#10b981',
      yAxisIndex: 0
    },
    {
      name: '增长率',
      type: 'line',
      data: [10, 20, 15, 30],
      color: '#f59e0b',
      yAxisIndex: 1,
      smooth: true
    }
  ]}
  height="400px"
  yAxis={[
    {
      type: 'value',
      name: '销售额',
      position: 'left'
    },
    {
      type: 'value',
      name: '增长率 (%)',
      position: 'right'
    }
  ]}
/>
```

### 业务图表组件

#### PerformanceTrendChart - 绩效数据趋势图

```jsx
import { PerformanceTrendChart } from '@shared/components';

<PerformanceTrendChart
  data={[
    { period: '2024-Q1', sales: 1000000, employment: 50, ip: 10 },
    { period: '2024-Q2', sales: 1200000, employment: 55, ip: 12 }
  ]}
  type="all" // 'sales' | 'employment' | 'ip' | 'all'
  height="400px"
/>
```

#### MemberGrowthChart - 会员增长图表

```jsx
import { MemberGrowthChart } from '@shared/components';

<MemberGrowthChart
  data={[
    { period: '2024-01', value: 100 },
    { period: '2024-02', value: 120 },
    { period: '2024-03', value: 150 }
  ]}
  height="400px"
  showArea={true}
/>
```

#### ProjectApplicationChart - 项目申请统计图表

```jsx
import { ProjectApplicationChart } from '@shared/components';

<ProjectApplicationChart
  data={[
    { period: '2024-Q1', applications: 50, approved: 40, rejected: 5, pending: 5 },
    { period: '2024-Q2', applications: 60, approved: 45, rejected: 8, pending: 7 }
  ]}
  chartType="bar" // 'bar' | 'mixed'
  height="400px"
/>
```

## Props 说明

### BaseChart

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| option | Object | {} | ECharts 配置选项 |
| height | string | '400px' | 图表高度 |
| width | string | '100%' | 图表宽度 |
| loading | boolean | false | 是否显示加载状态 |
| loadingText | string | - | 加载文本 |
| renderer | string | 'svg' | 渲染器类型 ('canvas' \| 'svg') |

### LineChart

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| categories | Array<string> | [] | X 轴分类数据 |
| series | Array<Object> | [] | 系列数据数组 |
| height | string | '400px' | 图表高度 |
| smooth | boolean | true | 是否平滑曲线 |
| area | boolean | false | 是否显示面积 |
| showLegend | boolean | true | 是否显示图例 |
| showTooltip | boolean | true | 是否显示提示框 |

### BarChart

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| categories | Array<string> | [] | X 轴分类数据 |
| series | Array<Object> | [] | 系列数据数组 |
| height | string | '400px' | 图表高度 |
| horizontal | boolean | false | 是否横向显示 |
| barWidth | string | '60%' | 柱状图宽度 |

### MixedChart

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| categories | Array<string> | [] | X 轴分类数据 |
| series | Array<Object> | [] | 系列数据数组（支持 type: 'bar' \| 'line'） |
| height | string | '400px' | 图表高度 |
| yAxis | Array<Object> | [] | Y 轴配置数组（支持双 Y 轴） |

## 响应式设计

所有图表组件都支持响应式设计，在移动端会自动调整布局和字体大小。

## 国际化支持

所有图表组件都支持国际化，会自动使用当前语言环境（韩语/中文）进行格式化。

## 样式定制

可以通过传入 `className` 和 `style` 属性来自定义图表样式。

## 注意事项

1. 确保数据格式正确，categories 和 series 数组长度应匹配
2. 对于大量数据，建议使用 `renderer: 'canvas'` 以获得更好的性能
3. 图表组件会自动处理空数据情况，显示友好的空状态提示

