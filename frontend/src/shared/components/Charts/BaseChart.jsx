/**
 * Base Chart Component
 * 基础图表组件 - 封装 ECharts React 组件，提供统一的配置和样式
 */

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';

/**
 * BaseChart - 基础图表组件
 * @param {Object} props
 * @param {Object} props.option - ECharts 配置选项
 * @param {string} props.height - 图表高度（默认: '400px'）
 * @param {string} props.width - 图表宽度（默认: '100%'）
 * @param {boolean} props.loading - 是否显示加载状态
 * @param {string} props.loadingText - 加载文本
 * @param {boolean} props.notMerge - 是否不合并配置（默认: false）
 * @param {boolean} props.lazyUpdate - 是否延迟更新（默认: false）
 * @param {string} props.renderer - 渲染器类型（'canvas' 或 'svg'，默认: 'svg'）
 * @param {Function} props.onChartReady - 图表就绪回调
 * @param {Function} props.onEvents - 事件处理函数对象
 * @param {string} props.className - 自定义类名
 * @param {Object} props.style - 自定义样式
 */
export default function BaseChart({
  option = {},
  height = '400px',
  width = '100%',
  loading = false,
  loadingText,
  notMerge = false,
  lazyUpdate = false,
  renderer = 'svg',
  onChartReady,
  onEvents,
  className = '',
  style = {}
}) {
  const { t } = useTranslation();

  // 默认加载文本
  const defaultLoadingText = loadingText || t('common.loading', '加载中...');

  // 合并样式
  const chartStyle = {
    height,
    width,
    ...style
  };

  // 如果没有数据，显示空状态
  if (!option || Object.keys(option).length === 0) {
    return (
      <div 
        className={`base-chart-empty ${className}`}
        style={chartStyle}
      >
        <div className="empty-content">
          <p>{t('admin.dashboard.charts.noData', '暂无数据')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`base-chart ${className}`} style={{ width }}>
      {loading && (
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>{defaultLoadingText}</p>
        </div>
      )}
      <ReactECharts
        option={option}
        style={chartStyle}
        opts={{
          renderer,
          notMerge,
          lazyUpdate
        }}
        onChartReady={onChartReady}
        onEvents={onEvents}
      />
    </div>
  );
}

