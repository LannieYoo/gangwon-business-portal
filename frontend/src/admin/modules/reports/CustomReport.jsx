/**
 * Custom Report Component - Admin Portal
 * 自定义报表 - 支持自定义日期范围和筛选条件生成报表
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Select, Input, Alert } from '@shared/components';
import { adminService } from '@shared/services';

export default function CustomReport() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('comprehensive');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    industry: '',
    region: '',
    year: '',
    quarter: 'all'
  });
  const [reportData, setReportData] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState('success');

  const handleFilterChange = useCallback((field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  }, []);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    
    // TODO: 实现自定义报表 API
    // const response = await adminService.generateCustomReport({
    //   reportType,
    //   ...filters
    // });
    // setReportData(response);
    
    setMessageVariant('info');
    setMessage(t('admin.reports.custom.comingSoon', '自定义报表功能开发中，敬请期待。'));
    setLoading(false);
  }, [reportType, filters, t]);

  const handleReset = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      industry: '',
      region: '',
      year: '',
      quarter: 'all'
    });
    setReportType('comprehensive');
    setReportData(null);
    setMessage(null);
  }, []);

  const reportTypeOptions = [
    { value: 'comprehensive', label: t('admin.reports.custom.types.comprehensive', '综合报表') },
    { value: 'enterprise', label: t('admin.reports.custom.types.enterprise', '企业报表') },
    { value: 'performance', label: t('admin.reports.custom.types.performance', '业绩报表') }
  ];

  return (
    <div className="w-full">
      {message && (
        <Alert variant={messageVariant} className="mb-6">
          {message}
        </Alert>
      )}

      <Card className="mb-6">
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.reports.custom.reportType', '报表类型')}
              </label>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={reportTypeOptions}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label={t('admin.reports.custom.startDate', '开始日期')}
                value={filters.startDate}
                onChange={handleFilterChange('startDate')}
              />
              <Input
                type="date"
                label={t('admin.reports.custom.endDate', '结束日期')}
                value={filters.endDate}
                onChange={handleFilterChange('endDate')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label={t('admin.reports.fields.industry')}
                value={filters.industry}
                onChange={handleFilterChange('industry')}
                placeholder={null}
                options={[{ value: '', label: t('common.all', '全部') }]}
              />
              <Select
                label={t('admin.reports.fields.region')}
                value={filters.region}
                onChange={handleFilterChange('region')}
                placeholder={null}
                options={[{ value: '', label: t('common.all', '全部') }]}
              />
              <Select
                label={t('admin.reports.fields.year')}
                value={filters.year}
                onChange={handleFilterChange('year')}
                placeholder={null}
                options={[{ value: '', label: t('common.all', '全部') }]}
              />
              <Select
                label={t('admin.reports.fields.quarter')}
                value={filters.quarter}
                onChange={handleFilterChange('quarter')}
                placeholder={null}
                options={[
                  { value: 'all', label: t('admin.reports.quarter.all', '全部') },
                  { value: 'Q1', label: t('admin.reports.quarter.Q1') },
                  { value: 'Q2', label: t('admin.reports.quarter.Q2') },
                  { value: 'Q3', label: t('admin.reports.quarter.Q3') },
                  { value: 'Q4', label: t('admin.reports.quarter.Q4') }
                ]}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={handleReset}>
                {t('common.reset', '重置')}
              </Button>
              <Button onClick={handleGenerate} loading={loading}>
                {t('admin.reports.custom.generate', '生成报表')}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {reportData && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('admin.reports.custom.reportPreview', '报表预览')}
            </h3>
            {/* TODO: 实现报表预览 */}
          </div>
        </Card>
      )}
    </div>
  );
}

