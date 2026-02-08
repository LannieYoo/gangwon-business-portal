/**
 * 公告筛选组件
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Card, SearchInput } from "@shared/components";

export default function NoticesFilter({
  allNotices,
  columns,
  handleFilterChange,
  importanceFilter,
  setImportanceFilter,
  importanceOptions,
}) {
  const { t } = useTranslation();

  return (
    <Card className="p-4 sm:p-5 lg:p-6 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          data={allNotices}
          columns={columns}
          onFilter={handleFilterChange}
          placeholder={t('member.support.notices.searchPlaceholder', '공지사항 검색...')}
          className="flex-1 min-w-[200px] max-w-md"
        />
        <div className="w-full sm:w-48 sm:flex-shrink-0">
          <select
            value={importanceFilter}
            onChange={(e) => setImportanceFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {importanceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}
