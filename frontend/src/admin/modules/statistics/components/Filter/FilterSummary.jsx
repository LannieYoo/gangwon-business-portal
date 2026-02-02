/*
 * FilterSummary - 已选筛选条件摘要组件
 */
import { useTranslation } from "react-i18next";

export const FilterSummary = ({ summary, onRemove }) => {
  const { t } = useTranslation();

  // 始终渲染容器，即使没有筛选条件
  if (!summary || summary.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs text-gray-400">
          {t("statistics.filters.noFilters", "未选择筛选条件")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1 flex-shrink-0">
        {t("statistics.filters.title")}:
      </span>
      {summary.map((item, index) => (
        <span
          key={`${item.filterKey}-${item.value}-${index}`}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 shadow-sm whitespace-nowrap group hover:bg-blue-100"
        >
          <span>{item.label}</span>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item.filterKey, item.value)}
              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-blue-200 transition-colors"
              aria-label="删除筛选条件"
            >
              <svg
                className="w-2.5 h-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </span>
      ))}
    </div>
  );
};
