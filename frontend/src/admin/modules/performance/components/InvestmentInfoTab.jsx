/**
 * Investment Info Tab Component
 * 投资信息标签页内容 - 管理员详情页
 */

import { useTranslation } from "react-i18next";
import { Button, Badge } from "@shared/components";
import { useDateFormatter } from "@shared/hooks";

export default function InvestmentInfoTab({
  record,
  onDownload,
  onDownloadByUrl,
}) {
  const { t } = useTranslation();
  const { formatNumber } = useDateFormatter();

  // Support both new array format and old single-object format
  let investmentItems = [];
  const investmentData = record?.dataJson?.investmentInfo;

  if (Array.isArray(investmentData)) {
    investmentItems = investmentData;
  } else if (investmentData && investmentData.hasInvestment) {
    investmentItems = [investmentData];
  }

  if (investmentItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        {t("common.noData", "데이터가 없습니다")}
      </div>
    );
  }

  const getInvestmentTypeLabel = (type) => {
    const typeMap = {
      domestic: t("admin.performance.investment.domestic", "국내"),
      overseas: t("admin.performance.investment.overseas", "해외"),
    };
    return typeMap[type] || "-";
  };

  const getInvestmentTypeVariant = (type) => {
    return type === "overseas" ? "info" : "success";
  };

  return (
    <div className="space-y-6">
      {investmentItems.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-600 mb-4">#{index + 1}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t("member.performance.investmentInfo.type", "국내/해외 구분")}
              </label>
              <div>
                {item.investmentType ? (
                  <Badge
                    variant={getInvestmentTypeVariant(item.investmentType)}
                  >
                    {getInvestmentTypeLabel(item.investmentType)}
                  </Badge>
                ) : (
                  <span className="text-base text-gray-900">-</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t(
                  "member.performance.investmentInfo.amount",
                  "투자 금액 (백만원)",
                )}
              </label>
              <span className="text-base text-gray-900">
                {item.amount ? formatNumber(item.amount) : "-"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t(
                  "member.performance.investmentInfo.institution",
                  "투자 기관",
                )}
              </label>
              <span className="text-base text-gray-900">
                {item.institution || "-"}
              </span>
            </div>
          </div>
          {item.attachments && item.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("member.performance.investmentInfo.attachments", "증빙서류")}
              </label>
              <div className="space-y-2">
                {item.attachments.map((attachment, attachmentIndex) => (
                  <div
                    key={attachmentIndex}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {attachment.originalName ||
                          attachment.fileName ||
                          t("common.document", "증명문서")}
                      </span>
                      {attachment.fileSize && (
                        <span className="text-xs text-gray-500">
                          ({(attachment.fileSize / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (attachment.fileUrl) {
                          onDownloadByUrl(
                            attachment.fileUrl,
                            attachment.originalName || attachment.fileName,
                          );
                        } else if (attachment.fileId) {
                          onDownload(
                            attachment.fileId,
                            attachment.originalName || attachment.fileName,
                          );
                        }
                      }}
                    >
                      {t("common.download", "다운로드")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
