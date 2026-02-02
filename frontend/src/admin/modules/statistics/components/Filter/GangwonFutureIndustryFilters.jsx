/*
 * GangwonFutureIndustryFilters - 江原道7大未来产业筛选组件（单选）
 */
import { useTranslation } from "react-i18next";
import { Select } from "@shared/components";
import { GANGWON_FUTURE_INDUSTRY_OPTIONS } from "../../enum";

export const GangwonFutureIndustryFilters = ({ industries = [], onChange }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const value = e.target.value;
    // 单选：如果选择了值，设置为包含该值的数组；如果选择"全部"，设置为空数组
    onChange("gangwonFutureIndustries", value ? [value] : []);
  };

  // 获取当前选中的值（取数组第一个元素）
  const selectedValue = industries.length > 0 ? industries[0] : "";

  return (
    <Select
      value={selectedValue}
      options={[
        { value: "", label: t("statistics.filters.all", "全部") },
        ...GANGWON_FUTURE_INDUSTRY_OPTIONS.map((option) => ({
          value: option.value,
          label: t(option.labelKey),
        }))
      ]}
      onChange={handleChange}
      containerClassName="mb-0"
      className="w-full sm:w-80 h-9"
    />
  );
};
