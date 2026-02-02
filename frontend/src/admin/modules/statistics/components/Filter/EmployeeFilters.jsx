/*
 * EmployeeFilters - 员工人数筛选组件
 */
import { Input, Select } from "@shared/components";
import { useTranslation } from "react-i18next";
import { EMPLOYEE_RANGE_OPTIONS } from "../../enum";

export const EmployeeFilters = ({
  employeeRange,
  minEmployees,
  maxEmployees,
  onChange,
}) => {
  const { t } = useTranslation();

  // 处理员工人数区间变化
  const handleEmployeeRangeChange = (value) => {
    // 如果选择空值（全部），清除筛选
    if (!value) {
      onChange("employeeRange", "all");
      onChange("minEmployees", null);
      onChange("maxEmployees", null);
      return;
    }

    const option = EMPLOYEE_RANGE_OPTIONS.find((opt) => opt.value === value);

    if (!option) return;

    onChange("employeeRange", value);

    if (value === "custom") {
      // 保持当前的 min/max 值
    } else {
      onChange("minEmployees", option.min);
      onChange("maxEmployees", option.max);
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={employeeRange === "all" ? "" : employeeRange}
        options={EMPLOYEE_RANGE_OPTIONS.map((opt) => ({
          value: opt.value,
          label: t(opt.labelKey),
        }))}
        placeholder={t("statistics.filters.quantitive.employeeRange.all", "全部")}
        onChange={(e) => handleEmployeeRangeChange(e.target.value)}
        containerClassName="mb-0"
        className="w-56 h-9"
      />

      {employeeRange === "custom" && (
        <div className="flex items-center gap-2 ml-4">
          <Input
            type="number"
            placeholder={t("statistics.filters.patent.minCount", "最小值")}
            value={minEmployees || ""}
            onChange={(e) =>
              onChange(
                "minEmployees",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            containerClassName="mb-0"
            className="w-32 h-9"
          />
          <span className="text-gray-400">~</span>
          <Input
            type="number"
            placeholder={t("statistics.filters.patent.maxCount", "最大值")}
            value={maxEmployees || ""}
            onChange={(e) =>
              onChange(
                "maxEmployees",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            containerClassName="mb-0"
            className="w-32 h-9"
          />
          <span className="text-xs text-gray-400">
            {t("common.people", "명")}
          </span>
        </div>
      )}
    </div>
  );
};
