/**
 * Sales Employment Tab Component
 * 销售雇佣标签页内容
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components';
import { useDateFormatter } from '@shared/hooks';

export default function SalesEmploymentTab({ record, currentLanguage, onDownload, onDownloadByUrl }) {
  const { t } = useTranslation();
  const { formatDate, formatNumber, formatValue } = useDateFormatter();

  if (!record?.dataJson?.salesEmployment) {
    return (
      <div className="text-center text-gray-500 py-8">
        {t('performance.noData', '暂无数据')}
      </div>
    );
  }

  const { salesEmployment } = record.dataJson;

  return (
    <div className="space-y-8">
      {/* 销售额 */}
      <div>
        <h3 className="text-md font-semibold mb-4 pb-2 border-b border-gray-200">
          {t('performance.salesEmploymentFields.sales', '销售额')}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({t('performance.salesEmploymentFields.unit.won', '원')})
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('performance.salesEmploymentFields.previousYear', '上年度')}
            </label>
            <span className="text-base text-gray-900">
              {formatNumber(salesEmployment.sales?.previousYear)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {record.year}{t('performance.year', '年度')}
            </label>
            <span className="text-base text-gray-900">
              {formatNumber(salesEmployment.sales?.currentYear)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('performance.salesEmploymentFields.reportingDate', '报告日期')}
            </label>
            <span className="text-base text-gray-900">
              {formatDate(salesEmployment.sales?.reportingDate)}
            </span>
          </div>
        </div>
      </div>

      {/* 出口额 */}
      <div>
        <h3 className="text-md font-semibold mb-4 pb-2 border-b border-gray-200">
          {t('performance.salesEmploymentFields.export', '出口额')}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({t('performance.salesEmploymentFields.unit.won', '원')})
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('performance.salesEmploymentFields.previousYear', '上年度')}
            </label>
            <span className="text-base text-gray-900">
              {formatNumber(salesEmployment.export?.previousYear)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {record.year}{t('performance.year', '年度')}
            </label>
            <span className="text-base text-gray-900">
              {formatNumber(salesEmployment.export?.currentYear)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('performance.salesEmploymentFields.reportingDate', '报告日期')}
            </label>
            <span className="text-base text-gray-900">
              {formatDate(salesEmployment.export?.reportingDate)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('performance.salesEmploymentFields.hskCode', 'HSK代码')}
            </label>
            <span className="text-base text-gray-900">
              {formatValue(salesEmployment.export?.hskCode)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('performance.salesEmploymentFields.exportCountry1', '出口国家1')}
            </label>
            <span className="text-base text-gray-900">
              {formatValue(salesEmployment.export?.exportCountry1)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-medium">
              {t('performance.salesEmploymentFields.exportCountry2', '出口国家2')}
            </label>
            <span className="text-base text-gray-900">
              {formatValue(salesEmployment.export?.exportCountry2)}
            </span>
          </div>
        </div>
      </div>

      {/* 雇佣创造 */}
      <div>
        <h3 className="text-md font-semibold mb-4 pb-2 border-b border-gray-200">
          {t('performance.salesEmploymentFields.employment', '雇佣创造')}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({t('performance.salesEmploymentFields.unit.people', '명')})
          </span>
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t('performance.salesEmploymentFields.currentEmployees', '现在职员工')}
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t('performance.salesEmploymentFields.previousYear', '上年度')}
              </label>
              <span className="text-base text-gray-900">
                {formatNumber(salesEmployment.employment?.currentEmployees?.previousYear)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {record.year}{t('performance.year', '年度')}
              </label>
              <span className="text-base text-gray-900">
                {formatNumber(salesEmployment.employment?.currentEmployees?.currentYear)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t('performance.salesEmploymentFields.newEmployees', '新增雇佣人员')}
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t('performance.salesEmploymentFields.previousYear', '上年度')}
              </label>
              <span className="text-base text-gray-900">
                {formatNumber(salesEmployment.employment?.newEmployees?.previousYear)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {record.year}{t('performance.year', '年度')}
              </label>
              <span className="text-base text-gray-900">
                {formatNumber(salesEmployment.employment?.newEmployees?.currentYear)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t('performance.salesEmploymentFields.totalEmployees', '总人员')}
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t('performance.salesEmploymentFields.previousYear', '上年度')}
              </label>
              <span className="text-base text-gray-900">
                {formatNumber(salesEmployment.employment?.totalEmployees?.previousYear)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {record.year}{t('performance.year', '年度')}
              </label>
              <span className="text-base text-gray-900">
                {formatNumber(salesEmployment.employment?.totalEmployees?.currentYear)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 증빙서류 (证明文件) */}
      {salesEmployment.attachments && salesEmployment.attachments.length > 0 && (
        <div>
          <h3 className="text-md font-semibold mb-4 pb-2 border-b border-gray-200">
            {t('performance.salesEmploymentFields.attachments', '증빙서류')}
          </h3>
          <div className="space-y-2">
            {salesEmployment.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">{attachment.fileName || '证明文件'}</span>
                  {attachment.fileSize && (
                    <span className="text-xs text-gray-500">
                      ({(attachment.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (attachment.fileUrl) {
                      onDownloadByUrl(attachment.fileUrl, attachment.fileName);
                    } else if (attachment.fileId) {
                      onDownload(attachment.fileId, attachment.fileName);
                    }
                  }}
                >
                  {t('common.download', '下载')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
