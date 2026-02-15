/**
 * Sales and Employment Form
 *
 * 매출/수출/고용 입력 폼 + 증빙서류 카테고리별 분리 (Issue 7)
 * 증빙서류를 매출액/수출액/고용창출 별로 구분하여 첨부 가능
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, FileAttachments } from "@shared/components";

// 格式化金额（添加千位分隔符）
const formatAmount = (value) => {
  if (!value) return "";
  const numStr = value.toString().replace(/[^\d]/g, "");
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 解析金额（移除千位分隔符）
const parseAmount = (value) => {
  if (!value) return "";
  return value.toString().replace(/,/g, "");
};

const EVIDENCE_CATEGORIES = [
  {
    key: "salesRevenue",
    labelKey: "member.performance.salesEmploymentFields.sales",
    defaultLabel: "매출액",
  },
  {
    key: "exportAmount",
    labelKey: "member.performance.salesEmploymentFields.export",
    defaultLabel: "수출액",
  },
  {
    key: "employmentCreation",
    labelKey: "member.performance.salesEmploymentFields.employment",
    defaultLabel: "고용창출",
  },
];

const SalesEmploymentForm = ({ data, year, onChange, onUpload }) => {
  const { t } = useTranslation();
  // Track which category is currently uploading (Issue 7 fix)
  const [uploadingCategory, setUploadingCategory] = useState(null);

  const handleAmountChange = (field, value) => {
    const parsed = parseAmount(value);
    onChange(field, parsed);
  };

  // Helper to handle categorized attachment uploads
  const handleCategoryAttachmentChange = (categoryKey) => async (files) => {
    if (Array.isArray(files) && files.length > 0 && files[0] instanceof File) {
      setUploadingCategory(categoryKey);
      try {
        const uploaded = await onUpload(files);
        if (uploaded) {
          const currentCategoryAttachments =
            data?.evidenceDocuments?.[categoryKey] || [];
          onChange(`salesEmployment.evidenceDocuments.${categoryKey}`, [
            ...currentCategoryAttachments,
            ...uploaded,
          ]);
        }
      } finally {
        setUploadingCategory(null);
      }
    } else {
      onChange(`salesEmployment.evidenceDocuments.${categoryKey}`, files);
    }
  };

  return (
    <div className="space-y-8">
      {/* Sales */}
      <div>
        <h3 className="text-md font-semibold mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
          <span>
            {t("member.performance.salesEmploymentFields.sales", "매출액")}
          </span>
          <span className="text-sm font-normal text-gray-400">
            ({t("member.performance.salesEmploymentFields.unit.won", "원")})
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t(
              "performance.salesEmploymentFields.previousYear",
              "전년도",
            )}
            value={formatAmount(data?.sales?.previousYear)}
            onChange={(e) =>
              handleAmountChange(
                "salesEmployment.sales.previousYear",
                e.target.value,
              )
            }
            placeholder="0"
          />
          <Input
            label={`${year}${t("member.performance.year", "년도")}`}
            value={formatAmount(data?.sales?.currentYear)}
            onChange={(e) =>
              handleAmountChange(
                "salesEmployment.sales.currentYear",
                e.target.value,
              )
            }
            placeholder="0"
          />
          <Input
            label={t(
              "performance.salesEmploymentFields.reportingDate",
              "작성 기준일",
            )}
            type="date"
            value={data?.sales?.reportingDate || ""}
            onChange={(e) =>
              onChange("salesEmployment.sales.reportingDate", e.target.value)
            }
          />
        </div>
      </div>

      {/* Export */}
      <div>
        <h3 className="text-md font-semibold mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
          <span>
            {t("member.performance.salesEmploymentFields.export", "수출액")}
          </span>
          <span className="text-sm font-normal text-gray-400">
            ({t("member.performance.salesEmploymentFields.unit.won", "원")})
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t(
              "performance.salesEmploymentFields.previousYear",
              "전년도",
            )}
            value={formatAmount(data?.export?.previousYear)}
            onChange={(e) =>
              handleAmountChange(
                "salesEmployment.export.previousYear",
                e.target.value,
              )
            }
            placeholder="0"
          />
          <Input
            label={`${year}${t("member.performance.year", "년도")}`}
            value={formatAmount(data?.export?.currentYear)}
            onChange={(e) =>
              handleAmountChange(
                "salesEmployment.export.currentYear",
                e.target.value,
              )
            }
            placeholder="0"
          />
          <Input
            label={t(
              "performance.salesEmploymentFields.reportingDate",
              "작성 기준일",
            )}
            type="date"
            value={data?.export?.reportingDate || ""}
            onChange={(e) =>
              onChange("salesEmployment.export.reportingDate", e.target.value)
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input
            label={t(
              "member.performance.salesEmploymentFields.hskCode",
              "HSK 코드",
            )}
            value={data?.export?.hskCode || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
              onChange("salesEmployment.export.hskCode", val);
            }}
            placeholder={t(
              "member.performance.salesEmploymentFields.hskCodePlaceholder",
              "HSK코드 10자리",
            )}
            maxLength={10}
          />
          <Input
            label={t(
              "performance.salesEmploymentFields.exportCountry1",
              "수출 국가 1",
            )}
            value={data?.export?.exportCountry1 || ""}
            onChange={(e) =>
              onChange("salesEmployment.export.exportCountry1", e.target.value)
            }
          />
          <Input
            label={t(
              "performance.salesEmploymentFields.exportCountry2",
              "수출 국가 2",
            )}
            value={data?.export?.exportCountry2 || ""}
            onChange={(e) =>
              onChange("salesEmployment.export.exportCountry2", e.target.value)
            }
          />
        </div>
      </div>

      {/* Employment */}
      <div>
        <h3 className="text-md font-semibold mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
          <span>
            {t(
              "member.performance.salesEmploymentFields.employment",
              "고용 창출",
            )}
          </span>
          <span className="text-sm font-normal text-gray-400">
            ({t("member.performance.salesEmploymentFields.unit.people", "명")})
          </span>
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <span className="text-sm font-medium pt-8">
              {t(
                "performance.salesEmploymentFields.currentEmployees",
                "현재 직원 수",
              )}
            </span>
            <Input
              label={t(
                "performance.salesEmploymentFields.previousYear",
                "전년도",
              )}
              value={data?.employment?.currentEmployees?.previousYear || ""}
              onChange={(e) =>
                onChange(
                  "salesEmployment.employment.currentEmployees.previousYear",
                  e.target.value,
                )
              }
              placeholder="0"
            />
            <Input
              label={`${year}${t("member.performance.year", "년도")}`}
              value={data?.employment?.currentEmployees?.currentYear || ""}
              onChange={(e) =>
                onChange(
                  "salesEmployment.employment.currentEmployees.currentYear",
                  e.target.value,
                )
              }
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <span className="text-sm font-medium pt-8">
              {t(
                "performance.salesEmploymentFields.newEmployees",
                "신규 고용 인원",
              )}
            </span>
            <Input
              label={t(
                "performance.salesEmploymentFields.previousYear",
                "전년도",
              )}
              value={data?.employment?.newEmployees?.previousYear || ""}
              onChange={(e) =>
                onChange(
                  "salesEmployment.employment.newEmployees.previousYear",
                  e.target.value,
                )
              }
              placeholder="0"
            />
            <Input
              label={`${year}${t("member.performance.year", "년도")}`}
              value={data?.employment?.newEmployees?.currentYear || ""}
              onChange={(e) =>
                onChange(
                  "salesEmployment.employment.newEmployees.currentYear",
                  e.target.value,
                )
              }
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Evidence Documents - Categorized (Issue 7) */}
      <div>
        <h3 className="text-md font-semibold mb-2 pb-2 border-b border-gray-100">
          {t(
            "member.performance.salesEmploymentFields.attachments",
            "증빙서류",
          )}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {t(
            "member.performance.salesEmploymentFields.evidenceDescription",
            "각 카테고리별로 증빙서류를 첨부해 주세요. (카테고리당 최대 5개, 파일당 최대 20MB)",
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EVIDENCE_CATEGORIES.map((category) => (
            <div key={category.key} className="bg-gray-50 rounded-lg p-4 flex flex-col">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 inline-block flex-shrink-0" />
                <span className="truncate">
                  {t(category.labelKey, category.defaultLabel)}
                </span>
                <span className="text-xs font-normal text-gray-400 ml-auto flex-shrink-0">
                  ({(data?.evidenceDocuments?.[category.key] || []).length}/5)
                </span>
              </h4>
              <div className="flex-1">
                <FileAttachments
                  attachments={data?.evidenceDocuments?.[category.key] || []}
                  onChange={handleCategoryAttachmentChange(category.key)}
                  uploading={uploadingCategory === category.key}
                  maxFiles={5}
                  maxSize={20}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legacy single attachments — hidden but kept for backwards compat */}
      {data?.attachments && data.attachments.length > 0 && (
        <div>
          <h3 className="text-md font-semibold mb-4 pb-2 border-b border-gray-100">
            {t(
              "member.performance.salesEmploymentFields.legacyAttachments",
              "기존 증빙서류 (미분류)",
            )}
          </h3>
          <FileAttachments
            attachments={data.attachments}
            onChange={async (files) => {
              if (
                Array.isArray(files) &&
                files.length > 0 &&
                files[0] instanceof File
              ) {
                const uploaded = await onUpload(files);
                if (uploaded) {
                  const current = data?.attachments || [];
                  onChange("salesEmployment.attachments", [
                    ...current,
                    ...uploaded,
                  ]);
                }
              } else {
                onChange("salesEmployment.attachments", files);
              }
            }}
            uploading={uploading}
          />
        </div>
      )}
    </div>
  );
};

export default SalesEmploymentForm;
