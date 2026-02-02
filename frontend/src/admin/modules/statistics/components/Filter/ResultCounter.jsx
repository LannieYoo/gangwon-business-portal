/*
 * ResultCounter - 实时结果计数组件
 * 显示当前筛选条件下的企业数量
 */
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export const ResultCounter = ({ filters, isLoading, count }) => {
  const { t } = useTranslation();
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    if (!isLoading) {
      setDisplayCount(count);
    }
  }, [count, isLoading]);

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {t('statistics.filters.matchingCompanies', '符合条件的企业')}:
        </span>
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
          <span className="text-sm text-gray-500">
            {t('statistics.filters.calculating', '计算中...')}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-green-600">
            {displayCount?.toLocaleString() || 0}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {t('statistics.filters.companies', '家')}
          </span>
        </div>
      )}
    </div>
  );
};
