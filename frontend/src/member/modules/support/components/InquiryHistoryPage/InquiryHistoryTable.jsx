/**
 * 咨询历史表格组件
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "@shared/utils";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@shared/components/Table";
import { Badge, Button } from "@shared/components";

export default function InquiryHistoryTable({
  loading,
  filteredThreads,
  allThreads,
  openDetailModal,
  navigate,
  getStatusBadge,
  getCategoryBadge,
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-base text-gray-500 m-0">{t("common.loading")}</p>
      </div>
    );
  }

  if (filteredThreads.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-base text-gray-500 m-0 mb-4">
          {allThreads.length === 0
            ? t('member.support.noInquiries', '문의 내역이 없습니다')
            : t('member.support.noMatchingInquiries', '일치하는 문의 기록이 없습니다')}
        </p>
        {allThreads.length === 0 && (
          <Button
            variant="primary"
            onClick={() => navigate("/member/support/inquiry")}
          >
            {t("member.support.createFirstInquiry")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>{t("member.support.subject")}</TableHeader>
              <TableHeader>{t("member.support.categoryLabel")}</TableHeader>
              <TableHeader>{t("member.support.statusLabel")}</TableHeader>
              <TableHeader>{t("member.support.createdDate")}</TableHeader>
              <TableHeader>{t("member.support.lastReply")}</TableHeader>
              <TableHeader>{t("member.support.messageCount")}</TableHeader>
              <TableHeader>{t("common.actions")}</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredThreads.map((thread) => (
              <TableRow key={thread.id}>
                <TableCell className="whitespace-normal min-w-[300px]">
                  <span className="font-medium">{thread.subject}</span>
                </TableCell>
                <TableCell>{getCategoryBadge(thread.category)}</TableCell>
                <TableCell>{getStatusBadge(thread.status)}</TableCell>
                <TableCell className="text-gray-600 text-sm whitespace-nowrap">
                  {thread.createdAt ? formatDateTime(thread.createdAt) : "-"}
                </TableCell>
                <TableCell className="text-gray-600 text-sm whitespace-nowrap">
                  {thread.lastMessageAt
                    ? formatDateTime(thread.lastMessageAt)
                    : "-"}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {thread.messageCount || 0}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => openDetailModal(thread.id)}
                    className="text-primary-600 hover:text-primary-900 font-medium text-sm bg-transparent border-none"
                  >
                    {t("common.view")}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filteredThreads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => openDetailModal(thread.id)}
            className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-blue-200 transition-all bg-white"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {getCategoryBadge(thread.category)}
              {getStatusBadge(thread.status)}
            </div>
            <h3 className="text-base font-medium text-gray-900 m-0 mb-2">
              {thread.subject}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{thread.createdAt ? formatDateTime(thread.createdAt) : "-"}</span>
              <span>{t("member.support.messageCount")}: {thread.messageCount || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
