/**
 * Investment Info Form
 *
 * 투자 정보 입력 폼 (성과 입력 탭).
 * Issue 6: 투자 정보 탭을 지식재산권 탭 옆에 배치.
 * Issue 11: 국내/해외 구분 필드 추가 + 파일 업로드 + 다중 투자 기록 지원.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Button,
  Input,
  Select,
  FileAttachments,
} from "@shared/components";
import { PlusIcon, TrashIcon } from "@shared/components/Icons";

const InvestmentInfoForm = ({ data = [], onChange, onUpload, uploading }) => {
  const { t } = useTranslation();

  const investmentTypeOptions = [
    {
      value: "",
      label: t("member.performance.investmentInfo.selectType", "선택해주세요"),
    },
    {
      value: "domestic",
      label: t("member.performance.investmentInfo.domestic", "국내"),
    },
    {
      value: "overseas",
      label: t("member.performance.investmentInfo.overseas", "해외"),
    },
  ];

  const handleAddField = () => {
    const newItem = {
      amount: "",
      institution: "",
      investmentType: "",
      attachments: [],
    };
    onChange([...data, newItem]);
  };

  const handleRemoveField = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold m-0">
          {t("member.performance.investmentInfo.title", "투자 정보")}
        </h3>
        <Button variant="secondary" size="small" onClick={handleAddField}>
          <PlusIcon className="w-4 h-4 mr-1" />
          {t("member.performance.investmentInfo.add", "추가")}
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
          {t("common.noData", "데이터가 없습니다")}
        </div>
      )}

      {data.map((item, index) => (
        <Card key={index} className="p-4 relative">
          <div className="flex justify-between items-center mb-4">
            <span className="text-primary-600 font-bold">#{index + 1}</span>
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleRemoveField(index)}
              className="text-red-500 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t(
                "member.performance.investmentInfo.type",
                "국내/해외 구분",
              )}
              value={item.investmentType || ""}
              onChange={(e) =>
                handleItemChange(index, "investmentType", e.target.value)
              }
              options={investmentTypeOptions}
            />
            <Input
              label={t(
                "member.performance.investmentInfo.amount",
                "투자 금액 (백만원)",
              )}
              value={item.amount}
              onChange={(e) =>
                handleItemChange(index, "amount", e.target.value)
              }
              placeholder={t(
                "member.performance.investmentInfo.amountPlaceholder",
                "0",
              )}
              type="number"
            />
            <Input
              label={t(
                "member.performance.investmentInfo.institution",
                "투자 기관",
              )}
              value={item.institution}
              onChange={(e) =>
                handleItemChange(index, "institution", e.target.value)
              }
              placeholder={t(
                "member.performance.investmentInfo.institutionPlaceholder",
                "투자 기관명 입력",
              )}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <FileAttachments
              label={t(
                "member.performance.investmentInfo.attachments",
                "증빙서류",
              )}
              attachments={item.attachments || []}
              onChange={async (files) => {
                if (
                  Array.isArray(files) &&
                  files.length > 0 &&
                  files[0] instanceof File
                ) {
                  try {
                    const uploaded = await onUpload(files);
                    if (uploaded) {
                      handleItemChange(index, "attachments", [
                        ...(item.attachments || []),
                        ...uploaded,
                      ]);
                    }
                  } catch (err) {
                    console.error("File upload failed:", err);
                  }
                } else {
                  handleItemChange(index, "attachments", files);
                }
              }}
              uploading={uploading}
              maxFiles={5}
              maxSize={20}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InvestmentInfoForm;
