/**
 * Reports Component - Admin Portal
 * 统计报表
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Select } from '@shared/components';
import './Reports.css';

export default function Reports() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');

  // 生成年份选项（最近5年）
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
  }));

  return (
    <div className="admin-reports">
      <div className="page-header">
        <h1 className="page-title">{t('admin.reports.title')}</h1>
        <div className="header-actions">
          <Select
            inline
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={yearOptions}
          />
          <Select
            inline
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            options={[
              { value: 'all', label: t('admin.reports.quarter.all') },
              { value: 'Q1', label: t('admin.reports.quarter.Q1') },
              { value: 'Q2', label: t('admin.reports.quarter.Q2') },
              { value: 'Q3', label: t('admin.reports.quarter.Q3') },
              { value: 'Q4', label: t('admin.reports.quarter.Q4') }
            ]}
          />
        </div>
      </div>

      <Card>
        <div className="reports-placeholder">
          <p>{t('admin.reports.placeholder')}</p>
        </div>
      </Card>
    </div>
  );
}

