/*
 * RevenueFilters - 年营收筛选组件
 */
import { Input, Select } from "@shared/components";
import { useTranslation } from "react-i18next";
import { REVENUE_RANGE_OPTIONS } from "../../enum";

export const RevenueFilters = ({
  revenueRange,
  minRevenue,
  maxRevenue,
  onChange,
}) => {
  const { t } = useTranslation();

  // 处理年营收区间变化
  const handleRevenueRangeChange = (value) => {
    // 如果选择空值（全部），清除筛选
    if (!value) {
      onChange("revenueRange", "all");
      onChange("minRevenue", null);
      onChange("maxRevenue", null);
      return;
    }

    const option = REVENUE_RANGE_OPTIONS.find((opt) => opt.value === value);

    if (!option) return;

    onChange("revenueRange", value);

    if (value === "custom") {
      // 保持当前的 min/max 值
    } else {
      onChange("minRevenue", option.min);
      onChange("maxRevenue", option.max);
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={revenueRange === "all" ? "" : revenueRange}
        options={REVENUE_RANGE_OPTIONS.map((opt) => ({
          value: opt.value,
          label: t(opt.labelKey),
        }))}
        placeholder={t("statistics.filters.quantitive.revenueRange.all", "全部")}
        onChange={(e) => handleRevenueRangeChange(e.target.value)}
        containerClassName="mb-0"
        className="w-56 h-9"
      />

      {revenueRange === "custom" && (
        <div className="flex items-center gap-2 ml-4">
          <Input
            type="number"
            placeholder={t("statistics.filters.investment.minAmount", "最小值")}
            value={minRevenue || ""}
            onChange={(e) =>
              onChange(
                "minRevenue",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            containerClassName="mb-0"
            className="w-32 h-9"
          />
          <span className="text-gray-400">~</span>
          <Input
            type="number"
            placeholder={t("statistics.filters.investment.maxAmount", "最大值")}
            value={maxRevenue || ""}
            onChange={(e) =>
              onChange(
                "maxRevenue",
                e.target.value ? parseInt(e.target.value) : null
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
  );
};
