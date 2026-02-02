/*
 * FilterPreview - 筛选条件预览组件
 * 显示当前已选择的筛选条件，支持快速移除
 */
import { useTranslation } from 'react-i18next';

export const FilterPreview = ({ filters, onRemove, onClear }) => {
  const { t } = useTranslation();

  // 构建筛选条件标签列表
  const buildFilterTags = () => {
    const tags = [];

    // 时间范围
    if (filters.year) {
      let timeLabel = `${filters.year}${t('statistics.filters.time.yearUnit')}`;
      if (filters.quarter) {
        timeLabel += ` Q${filters.quarter}`;
      }
      if (filters.month) {
        timeLabel += ` ${filters.month}${t('statistics.filters.time.monthUnit')}`;
      }
      tags.push({ key: 'time', label: timeLabel, removable: true });
    }

    // 政策项目
    if (filters.policyTags && filters.policyTags.length > 0) {
      filters.policyTags.forEach(tag => {
        tags.push({
          key: `policy_${tag}`,
          label: t(`statistics.filters.participation.${tag.toLowerCase()}`),
          removable: true,
          onRemove: () => onRemove('policyTags', filters.policyTags.filter(t => t !== tag))
        });
      });
    }

    // 创业阶段
    if (filters.startupStages && filters.startupStages.length > 0) {
      filters.startupStages.forEach(stage => {
        tags.push({
          key: `stage_${stage}`,
          label: t(`statistics.filters.stage.${stage}`),
          removable: true,
          onRemove: () => onRemove('startupStages', filters.startupStages.filter(s => s !== stage))
        });
      });
    }

    // 投资情况
    if (filters.hasInvestment !== null && filters.hasInvestment !== undefined) {
      const label = filters.hasInvestment 
        ? t('statistics.filters.investment.yes')
        : t('statistics.filters.investment.no');
      tags.push({
        key: 'investment',
        label: `${t('statistics.filters.investment.title')}: ${label}`,
        removable: true,
        onRemove: () => onRemove('hasInvestment', null)
      });
    }

    // 年营收区间
    if (filters.revenueRange && filters.revenueRange !== 'all') {
      const label = filters.revenueRange === 'custom'
        ? t('statistics.filters.quantitive.revenueRange.custom')
        : t(`statistics.filters.quantitive.revenueRange.${filters.revenueRange}`);
      tags.push({
        key: 'revenue',
        label: `${t('statistics.filters.quantitive.revenue')}: ${label}`,
        removable: true,
        onRemove: () => {
          onRemove('revenueRange', 'all');
          onRemove('minRevenue', null);
          onRemove('maxRevenue', null);
        }
      });
    }

    // 员工人数区间
    if (filters.employeeRange && filters.employeeRange !== 'all') {
      const label = filters.employeeRange === 'custom'
        ? t('statistics.filters.quantitive.employeeRange.custom')
        : t(`statistics.filters.quantitive.employeeRange.${filters.employeeRange}`);
      tags.push({
        key: 'employee',
        label: `${t('statistics.filters.quantitive.employees')}: ${label}`,
        removable: true,
        onRemove: () => {
          onRemove('employeeRange', 'all');
          onRemove('minEmployees', null);
          onRemove('maxEmployees', null);
        }
      });
    }

    // 关键词搜索
    if (filters.searchQuery) {
      tags.push({
        key: 'search',
        label: `"${filters.searchQuery}"`,
        removable: true,
        onRemove: () => onRemove('searchQuery', '')
      });
    }

    return tags;
  };

  const filterTags = buildFilterTags();

  if (filterTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-900">
          {t('statistics.filters.selectedConditions', '已选筛选条件')}:
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {t('statistics.filters.clearAll', '清除全部')}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filterTags.map(tag => (
          <span
            key={tag.key}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-sm text-blue-900"
          >
            {tag.label}
            {tag.removable && (
              <button
                type="button"
                onClick={tag.onRemove}
                className="hover:bg-blue-100 rounded p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
