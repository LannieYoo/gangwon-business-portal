/*
 * StandardIndustryFilters - 标准产业分类 (KSIC) 筛选组件
 */
import { Select } from "@shared/components";
import { useTranslation } from "react-i18next";
import {
  KSIC_MAJOR_CATEGORIES,
  KSIC_SUB_CATEGORIES,
  getTranslatedOptions,
} from "@/shared/enums";

export const StandardIndustryFilters = ({
  codes = [],
  subCodes = [],
  onChange,
}) => {
  const { t } = useTranslation();

  const majorValue = codes && codes.length > 0 ? codes[0] : "";
  const subValue = subCodes && subCodes.length > 0 ? subCodes[0] : "";

  // 转换大类选项
  const majorOptions = getTranslatedOptions(
    KSIC_MAJOR_CATEGORIES,
    "enums.industry.ksicMajor",
    t,
  );

  // 根据选择的大类获取中类选项
  const subCategories = majorValue ? KSIC_SUB_CATEGORIES[majorValue] || [] : [];
  const subOptions = getTranslatedOptions(
    subCategories,
    "enums.industry.ksicSub",
    t,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={majorValue}
        options={majorOptions}
        placeholder={t("admin.statistics.filters.industry.major")}
        containerClassName="mb-0"
        className="w-48 h-9"
        onChange={(e) => {
          const val = e.target.value;
          // 切换大类时，同时重置中类
          // 如果选择了值，发送数组；如果是空字符串（全部），发送空数组
          onChange("majorIndustryCodes", val ? [val] : []);
          onChange("subIndustryCodes", []);
        }}
      />
      <Select
        value={subValue}
        options={subOptions}
        disabled={!majorValue}
        placeholder={t("admin.statistics.filters.industry.medium")}
        containerClassName="mb-0"
        className="w-48 h-9"
        onChange={(e) => {
          const val = e.target.value;
          // 如果选择了值，发送数组；如果是空字符串（全部），发送空数组
          onChange("subIndustryCodes", val ? [val] : []);
        }}
      />
    </div>
  );
};
