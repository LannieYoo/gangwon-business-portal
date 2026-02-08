/**
 * Line Chart Component
 * 折线图组件 - 用于显示趋势数据
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseChart from './BaseChart';

/**
 * LineChart - 折线图组件
 * @param {Object} props
 * @param {Array<string>} props.categories - X 轴分类数据
 * @param {Array<Object>} props.series - 系列数据数组 [{ name, data, color }]
 * @param {string} props.title - 图表标题
 * @param {string} props.height - 图表高度
 * @param {boolean} props.smooth - 是否平滑曲线（默认: true）
 * @param {boolean} props.area - 是否显示面积（默认: false）
 * @param {boolean} props.showLegend - 是否显示图例（默认: true）
 * @param {boolean} props.showTooltip - 是否显示提示框（默认: true）
 * @param {Function} props.formatter - 自定义格式化函数
 * @param {Object} props.grid - 网格配置
 * @param {Object} props.xAxis - X 轴配置
 * @param {Object} props.yAxis - Y 轴配置
 */
export default function LineChart({
  categories = [],
  series = [],
  title,
  height = '400px',
  smooth = true,
  area = false,
  showLegend = true,
  showTooltip = true,
  formatter,
  grid = {},
  xAxis = {},
  yAxis = {},
  ...otherProps
}) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'ko';

  const option = useMemo(() => {
    if (!categories.length || !series.length) {
      return {};
    }

    // 默认网格配置
    const defaultGrid = {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      ...grid
    };

    // 计算 x 轴标签显示间隔
    // 当数据点过多时，自动调整间隔以避免标签拥挤
    const calculateInterval = () => {
      const maxLabels = 15; // 最多显示 15 个标签
      if (categories.length <= maxLabels) {
        return 0; // 显示所有标签
      }
      // 计算间隔：每隔 N 个显示一个标签，确保不超过 maxLabels
      return Math.ceil(categories.length / maxLabels) - 1;
    };

    // 计算标签旋转角度
    // 数据点越多，旋转角度越大，以便更好地显示标签
    const calculateRotate = () => {
      if (categories.length <= 6) {
        return 0;
      } else if (categories.length <= 15) {
        return 45;
      } else if (categories.length <= 30) {
        return 60;
      } else {
        return 75;
      }
    };

    // 默认 X 轴配置
    const defaultXAxis = {
      type: 'category',
      boundaryGap: false,
      data: categories,
      axisLabel: {
        rotate: calculateRotate(),
        interval: calculateInterval(),
        ...xAxis.axisLabel
      },
      ...xAxis
    };

    // 默认 Y 轴配置
    const defaultYAxis = {
      type: 'value',
      axisLabel: {
        formatter: (value) => value.toLocaleString(currentLanguage === 'zh' ? 'zh-CN' : 'ko-KR'),
        ...yAxis.axisLabel
      },
      ...yAxis
    };

    // 默认提示框配置
    const defaultTooltip = {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      },
      formatter: formatter || ((params) => {
        let result = `${params[0].name}<br/>`;
        params.forEach(param => {
          result += `${param.seriesName}: ${param.value.toLocaleString(currentLanguage === 'zh' ? 'zh-CN' : 'ko-KR')}<br/>`;
        });
        return result;
      })
    };

    // 构建系列数据
    const chartSeries = series.map((s, index) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: s.smooth !== undefined ? s.smooth : smooth,
      itemStyle: {
        color: s.color || (index === 0 ? '#3b82f6' : ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 4])
      },
      areaStyle: area ? {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: s.color ? `rgba(${hexToRgb(s.color)}, 0.3)` : `rgba(59, 130, 246, 0.3)` },
            { offset: 1, color: s.color ? `rgba(${hexToRgb(s.color)}, 0.05)` : `rgba(59, 130, 246, 0.05)` }
          ]
        }
      } : undefined
    }));

    return {
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      } : undefined,
      tooltip: showTooltip ? defaultTooltip : undefined,
      legend: showLegend && series.length > 1 ? {
        data: series.map(s => s.name),
        top: title ? 30 : 10
      } : undefined,
      grid: defaultGrid,
      xAxis: defaultXAxis,
      yAxis: defaultYAxis,
      series: chartSeries
    };
  }, [categories, series, title, smooth, area, showLegend, showTooltip, formatter, grid, xAxis, yAxis, currentLanguage]);

  return (
    <BaseChart
      option={option}
      height={height}
      {...otherProps}
    />
  );
}

// 辅助函数：将十六进制颜色转换为 RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '59, 130, 246';
}





