/**
 * 公告事项列表页面组件 (内容组件)
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@member/layouts";
import { Card, Loading, Badge, Pagination } from "@shared/components";
import { Table } from "@shared/components/Table";

import NoticesFilter from "./NoticesFilter";

/**
 * 公告事项列表页面内容组件
 */
export default function NoticesPage({
  notices,
  loading,
  error,
  total,
  handleFilterChange,
  handleNoticeClick,
  loadNotices,
  allNotices,
  importanceFilter,
  setImportanceFilter,
  importanceOptions,
  // 分页相关
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}) {
  const { t } = useTranslation();

  const getBadgeInfo = (notice) => {
    return {
      variant: notice.important ? "danger" : "gray",
      text: notice.important
        ? t("member.support.notices.important", "중요")
        : t("member.support.notices.normal", "일반"),
    };
  };

  const filterColumns = useMemo(
    () => [{ key: "title", render: (value) => value || "" }],
    [],
  );

  return (
    <PageContainer className="pb-8">
      <div className="w-full">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("member.support.notices.title")}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {t(
              "member.support.notices.description",
              "최신 공지사항 및 중요 알림 확인",
            )}
          </p>
        </div>

        <NoticesFilter
          allNotices={allNotices}
          columns={filterColumns}
          handleFilterChange={handleFilterChange}
          importanceFilter={importanceFilter}
          setImportanceFilter={setImportanceFilter}
          importanceOptions={importanceOptions}
        />

        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              {t("common.resultsCount", "총 {{count}}건", { count: total })}
            </p>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loading />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={loadNotices}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t("common.retry", "다시 시도")}
                </button>
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="m-0">
                  {t("member.support.notices.empty", "공고가 없습니다")}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table
                    columns={[
                      {
                        key: "type",
                        label: t("common.type", "구분"),
                        width: "100px",
                        render: (_, notice) => {
                          const badgeInfo = getBadgeInfo(notice);
                          return (
                            <Badge variant={badgeInfo.variant}>
                              {badgeInfo.text}
                            </Badge>
                          );
                        },
                      },
                      {
                        key: "title",
                        label: t("common.title", "제목"),
                        cellClassName: "font-medium",
                      },
                      {
                        key: "date",
                        label: t("common.date", "날짜"),
                        width: "140px",
                        cellClassName: "text-gray-500",
                      },
                    ]}
                    data={notices}
                    onRowClick={(notice) => handleNoticeClick(notice.id)}
                  />
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {notices.map((notice) => {
                    const badgeInfo = getBadgeInfo(notice);
                    return (
                      <div
                        key={notice.id}
                        onClick={() => handleNoticeClick(notice.id)}
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-blue-200 transition-all bg-white"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={badgeInfo.variant}>
                            {badgeInfo.text}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {notice.date}
                          </span>
                        </div>
                        <h3 className="text-base font-medium text-gray-900 m-0">
                          {notice.title}
                        </h3>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={onPageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
