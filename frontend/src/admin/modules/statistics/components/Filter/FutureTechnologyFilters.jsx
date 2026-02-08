/*
 * FutureTechnologyFilters - 未来有望新技术筛选组件（单选）
 */
import { useTranslation } from "react-i18next";
import { Select } from "@shared/components";
import { FUTURE_TECHNOLOGIES, getTranslatedOptions } from "@/shared/enums";

export const FutureTechnologyFilters = ({ technologies = [], onChange }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const value = e.target.value;
    // 单选：如果选择了值，设置为包含该值的数组；如果选择"全部"，设置为空数组
    onChange("futureTechnologies", value ? [value] : []);
  };

  // 获取当前选中的值（取数组第一个元素）
  const selectedValue = technologies.length > 0 ? technologies[0] : "";

  // 获取翻译后的选项
  const translatedOptions = getTranslatedOptions(
    FUTURE_TECHNOLOGIES,
    "enums.industry.futureTech",
    t,
  );

  return (
    <Select
      value={selectedValue}
      options={[
        { value: "", label: t("admin.statistics.filters.all", "전체") },
        ...translatedOptions,
      ]}
      onChange={handleChange}
      containerClassName="mb-0"
      className="w-full sm:w-80 h-9"
    />
  );
};
