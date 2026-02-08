/*
 * QuantitiveFilters - 量化指标筛选组件 (年销售额 / 员工人数)
 * 支持预设区间选择 + 自定义区间输入
 */
import { Input, Select } from "@shared/components";
import { useTranslation } from "react-i18next";
import { REVENUE_RANGE_OPTIONS, EMPLOYEE_RANGE_OPTIONS } from "../../enum";

export const QuantitiveFilters = ({
  revenueRange,
  minRevenue,
  maxRevenue,
  employeeRange,
  minEmployees,
  maxEmployees,
  onChange,
}) => {
  const { t } = useTranslation();

  // 处理年营收区间变化
  const handleRevenueRangeChange = (value) => {
    const option = REVENUE_RANGE_OPTIONS.find((opt) => opt.value === value);

    if (!option) return;

    onChange("revenueRange", value);

    if (value === "all") {
      onChange("minRevenue", null);
      onChange("maxRevenue", null);
    } else if (value === "custom") {
      // 保持当前的 min/max 值
    } else {
      onChange("minRevenue", option.min);
      onChange("maxRevenue", option.max);
    }
  };

  // 处理员工人数区间变化
  const handleEmployeeRangeChange = (value) => {
    const option = EMPLOYEE_RANGE_OPTIONS.find((opt) => opt.value === value);

    if (!option) return;

    onChange("employeeRange", value);

    if (value === "all") {
      onChange("minEmployees", null);
      onChange("maxEmployees", null);
    } else if (value === "custom") {
      // 保持当前的 min/max 值
    } else {
      onChange("minEmployees", option.min);
      onChange("maxEmployees", option.max);
    }
  };

  return (
    <div className="space-y-4">
      {/* 年营收区间 */}
      <div>
        <Select
          label={t("admin.statistics.filters.quantitive.revenue")}
          value={revenueRange || "all"}
          options={REVENUE_RANGE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: t(opt.labelKey),
          }))}
          onChange={(e) => handleRevenueRangeChange(e.target.value)}
          containerClassName="mb-0"
          className="w-56 h-9"
        />

        {revenueRange === "custom" && (
          <div className="flex items-center gap-2 mt-2 ml-4">
            <Input
              type="number"
              placeholder={t(
                "admin.statistics.filters.investment.minAmount",
                "최소 금액",
              )}
              value={minRevenue || ""}
              onChange={(e) =>
                onChange(
                  "minRevenue",
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
                "admin.statistics.filters.investment.maxAmount",
                "최대 금액",
              )}
              value={maxRevenue || ""}
              onChange={(e) =>
                onChange(
                  "maxRevenue",
                  e.target.value ? parseInt(e.target.value) : null,
                )
              }
              containerClassName="mb-0"
              className="w-32 h-9"
            />
            <span className="text-xs text-gray-400">
              {t("common.currency.krw", "₩")}
            </span>
          </div>
        )}
      </div>

      {/* 员工人数区间 */}
      <div>
        <Select
          label={t("admin.statistics.filters.quantitive.employees")}
          value={employeeRange || "all"}
          options={EMPLOYEE_RANGE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: t(opt.labelKey),
          }))}
          onChange={(e) => handleEmployeeRangeChange(e.target.value)}
          containerClassName="mb-0"
          className="w-56 h-9"
        />

        {employeeRange === "custom" && (
          <div className="flex items-center gap-2 mt-2 ml-4">
            <Input
              type="number"
              placeholder={t(
                "admin.statistics.filters.patent.minCount",
                "최소 수량",
              )}
              value={minEmployees || ""}
              onChange={(e) =>
                onChange(
                  "minEmployees",
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
              value={maxEmployees || ""}
              onChange={(e) =>
                onChange(
                  "maxEmployees",
                  e.target.value ? parseInt(e.target.value) : null,
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
    </div>
  );
};
