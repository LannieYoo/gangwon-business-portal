/*
 * AgeFilters - 年龄筛选组件
 * 支持预设年龄段选择 + 自定义区间输入
 */
import { Select, Input } from "@shared/components";
import { useTranslation } from "react-i18next";
import { AGE_RANGE_OPTIONS } from "../../enum";

export const AgeFilters = ({ ageRange, minAge, maxAge, onChange }) => {
  const { t } = useTranslation();

  // 处理年龄段区间变化
  const handleAgeRangeChange = (value) => {
    // 如果是 "all" 或空值，清除所有年龄筛选
    if (value === "all" || !value) {
      onChange("ageRange", "all");
      onChange("minAge", null);
      onChange("maxAge", null);
      return;
    }

    const option = AGE_RANGE_OPTIONS.find((opt) => opt.value === value);

    if (!option) return;

    onChange("ageRange", value);

    if (value === "custom") {
      // 保持当前的 min/max 值
    } else {
      onChange("minAge", option.min);
      onChange("maxAge", option.max);
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={ageRange && ageRange !== "all" ? ageRange : ""}
        options={[
          {
            value: "",
            label: t(
              "admin.statistics.filters.representative.ageRange.all",
              "전체",
            ),
          },
          ...AGE_RANGE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: t(opt.labelKey),
          })),
        ]}
        onChange={(e) => handleAgeRangeChange(e.target.value || "all")}
        containerClassName="mb-0"
        className="w-56 h-9"
      />

      {ageRange === "custom" && (
        <div className="flex items-center gap-2 ml-4">
          <Input
            type="number"
            placeholder={t(
              "admin.statistics.filters.patent.minCount",
              "최소 수량",
            )}
            value={minAge || ""}
            onChange={(e) =>
              onChange(
                "minAge",
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            containerClassName="mb-0"
            className="w-32 h-9"
          />
          <span className="text-gray-400">~</span>
          <Input
            type="number"
            placeholder={t(
              "admin.statistics.filters.patent.maxCount",
              "최대 수량",
            )}
            value={maxAge || ""}
            onChange={(e) =>
              onChange(
                "maxAge",
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            containerClassName="mb-0"
            className="w-32 h-9"
          />
          <span className="text-xs text-gray-400">
            {t("common.age.unit", "세")}
          </span>
        </div>
      )}
    </div>
  );
};
