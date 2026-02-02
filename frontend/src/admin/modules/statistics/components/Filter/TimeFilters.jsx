/*
 * TimeFilters - 时间维度筛选组件 (年度/季度/月份)
 */
import { Select } from "@shared/components";
import { useTranslation } from "react-i18next";
import { QUARTER_OPTIONS, MONTH_OPTIONS } from "../../enum";

export const TimeFilters = ({ year, quarter, month, onChange }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  // 添加"全部"选项到年份列表
  const years = [
    { value: "", label: t("statistics.filters.all", "全部") },
    ...Array.from({ length: 15 }, (_, i) => ({
      value: currentYear - i,
      label:
        String(currentYear - i) + t("statistics.filters.time.yearUnit", "년"),
    }))
  ];

  const quarterOptions = QUARTER_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
  }));

  const monthOptions = MONTH_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label + t("statistics.filters.time.monthUnit", "월"),
  }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={year || ""}
        options={years}
        containerClassName="mb-0"
        className="w-28 h-9"
        onChange={(e) => {
          const val = e.target.value;
          onChange("year", val ? parseInt(val) : null);
          // 清空年份时，同时清空季度和月份
          if (!val) {
            onChange("quarter", null);
            onChange("month", null);
          }
        }}
      />
      <Select
        value={quarter || ""}
        options={quarterOptions}
        placeholder={t("statistics.filters.time.quarter")}
        containerClassName="mb-0"
        className="w-28 h-9"
        disabled={!year}
        onChange={(e) => {
          const val = e.target.value;
          onChange("quarter", val ? parseInt(val) : null);
          // 清空季度时，同时清空月份
          if (!val) {
            onChange("month", null);
          }
        }}
      />
      <Select
        value={month || ""}
        options={monthOptions}
        placeholder={t("statistics.filters.time.month")}
        containerClassName="mb-0"
        className="w-28 h-9"
        disabled={!quarter}
        onChange={(e) =>
          onChange("month", e.target.value ? parseInt(e.target.value) : null)
        }
      />
    </div>
  );
};
