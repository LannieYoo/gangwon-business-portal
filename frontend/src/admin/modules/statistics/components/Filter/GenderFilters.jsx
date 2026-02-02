/*
 * GenderFilters - 性别筛选组件
 */
import { Select } from "@shared/components";
import { useTranslation } from "react-i18next";

export const GenderFilters = ({ gender, onChange }) => {
  const { t } = useTranslation();

  const options = [
    { value: "", label: t("statistics.filters.all", "全部") },
    { value: "male", label: t("statistics.filters.representative.male", "男") },
    { value: "female", label: t("statistics.filters.representative.female", "女") },
  ];

  return (
    <Select
      value={gender || ""}
      options={options}
      onChange={(e) => onChange("gender", e.target.value || null)}
      containerClassName="mb-0"
      className="w-40 h-9"
    />
  );
};
