/*
 * InvestmentFilters - 投资引进情况筛选组件
 * 联动逻辑：只有选择"是"时，才显示投资金额范围
 */
import { Select } from "@shared/components";
import { useTranslation } from "react-i18next";
import { INVESTMENT_RANGES_OPTIONS } from "../../enum";

export const InvestmentFilters = ({
  hasInvestment,
  minInvestment,
  maxInvestment,
  onChange,
}) => {
  const { t } = useTranslation();

  // 处理投资状态变化
  const handleInvestmentStatusChange = (value) => {
    const hasInv = value === "" ? null : value === "yes";
    onChange("hasInvestment", hasInv);

    // 如果选择"否"或清空，同时清除投资金额范围
    if (!hasInv) {
      onChange("minInvestment", null);
      onChange("maxInvestment", null);
    }
  };

  // 计算当前选中的投资范围
  const getCurrentRange = () => {
    if (!minInvestment && !maxInvestment) return "";
    const range = INVESTMENT_RANGES_OPTIONS.find(
      (r) => r.min === minInvestment && r.max === maxInvestment,
    );
    return range ? range.value : "";
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={hasInvestment === null ? "" : hasInvestment ? "yes" : "no"}
        options={[
          { value: "yes", label: t("admin.statistics.filters.investment.yes") },
          { value: "no", label: t("admin.statistics.filters.investment.no") },
        ]}
        placeholder={t("admin.statistics.filters.investment.status")}
        containerClassName="mb-0"
        className="w-32 h-9"
        onChange={(e) => handleInvestmentStatusChange(e.target.value)}
      />

      {/* 只有选择"是"时才显示投资金额范围 */}
      {hasInvestment === true && (
        <Select
          value={getCurrentRange()}
          placeholder={t("admin.statistics.filters.investment.amountRange")}
          options={INVESTMENT_RANGES_OPTIONS.map((r) => ({
            value: r.value,
            label: t(r.labelKey),
          }))}
          containerClassName="mb-0"
          className="w-48 h-9"
          onChange={(e) => {
            const range = INVESTMENT_RANGES_OPTIONS.find(
              (r) => r.value === e.target.value,
            );
            if (range) {
              onChange("minInvestment", range.min);
              onChange("maxInvestment", range.max);
            } else {
              onChange("minInvestment", null);
              onChange("maxInvestment", null);
            }
          }}
        />
      )}
    </div>
  );
};
