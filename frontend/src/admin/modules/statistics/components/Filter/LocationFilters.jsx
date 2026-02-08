/*
 * LocationFilters - 所在地筛选组件
 */
import { Select } from "@shared/components";
import { useTranslation } from "react-i18next";
import { LOCATION_OPTIONS } from "../../enum";

export const LocationFilters = ({ region, onChange }) => {
  const { t } = useTranslation();

  const options = LOCATION_OPTIONS.map((o) => ({
    value: o.value,
    label: t(o.labelKey),
  }));

  return (
    <Select
      value={region || ""}
      options={options}
      placeholder={t("admin.statistics.filters.location.selectLocation")}
      containerClassName="mb-0"
      className="w-full sm:w-80 h-9"
      onChange={(e) => onChange("region", e.target.value || null)}
    />
  );
};
