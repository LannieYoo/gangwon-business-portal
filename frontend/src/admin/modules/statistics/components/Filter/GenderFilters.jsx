/*
 * GenderFilters - 性别筛选组件
 */
import { Select } from "@shared/components";
import { useTranslation } from "react-i18next";

export const GenderFilters = ({ gender, onChange }) => {
  const { t } = useTranslation();

  const options = [
    { value: "", label: t("admin.statistics.filters.all", "전체") },
    {
      value: "male",
      label: t("admin.statistics.filters.representative.male", "남"),
    },
    {
      value: "female",
      label: t("admin.statistics.filters.representative.female", "여"),
    },
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
