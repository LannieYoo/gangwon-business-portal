/*
 * DemographicFilters - 代表者人口属性 (性别/年龄) 筛选组件
 * 支持预设年龄段选择 + 自定义区间输入
 */
import { Select, Input } from "@shared/components";
import { useTranslation } from "react-i18next";
import { GENDER_OPTIONS, AGE_RANGE_OPTIONS } from "../../enum";

export const DemographicFilters = ({
  gender,
  ageRange,
  minAge,
  maxAge,
  onChange,
}) => {
  const { t } = useTranslation();

  // 处理年龄段区间变化
  const handleAgeRangeChange = (value) => {
    const option = AGE_RANGE_OPTIONS.find((opt) => opt.value === value);

    if (!option) return;

    onChange("ageRange", value);

    if (value === "all") {
      onChange("minAge", null);
      onChange("maxAge", null);
    } else if (value === "custom") {
      // 保持当前的 min/max 值
    } else {
      onChange("minAge", option.min);
      onChange("maxAge", option.max);
    }
  };

  return (
    <div className="space-y-4">
      {/* 性别 */}
      <div>
        <Select
          label={t("statistics.filters.representative.gender")}
          value={gender || ""}
          options={[
            { value: "", label: t("statistics.filters.all", "全部") },
            ...GENDER_OPTIONS.map((g) => ({
              value: g.value,
              label: t(g.labelKey),
            })),
          ]}
          onChange={(e) => onChange("gender", e.target.value || null)}
          containerClassName="mb-0"
          className="w-40 h-9"
        />
      </div>

      {/* 年龄段 */}
      <div>
        <Select
          label={t("statistics.filters.representative.ageRange")}
          value={ageRange || "all"}
          options={AGE_RANGE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: t(opt.labelKey),
          }))}
          onChange={(e) => handleAgeRangeChange(e.target.value)}
          containerClassName="mb-0"
          className="w-56 h-9"
        />

        {ageRange === "custom" && (
          <div className="flex items-center gap-2 mt-2 ml-4">
            <Input
              type="number"
              placeholder={t("statistics.filters.patent.minCount", "最小值")}
              value={minAge || ""}
              onChange={(e) =>
                onChange("minAge", e.target.value ? parseInt(e.target.value) : null)
              }
              containerClassName="mb-0"
              className="w-32 h-9"
            />
            <span className="text-gray-400">~</span>
            <Input
              type="number"
              placeholder={t("statistics.filters.patent.maxCount", "最大值")}
              value={maxAge || ""}
              onChange={(e) =>
                onChange("maxAge", e.target.value ? parseInt(e.target.value) : null)
              }
              containerClassName="mb-0"
              className="w-32 h-9"
            />
            <span className="text-xs text-gray-400">
              {t("common.age.unit", "岁")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
