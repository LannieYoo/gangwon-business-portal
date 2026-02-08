/*
 * StatisticsTable - 统计结果数据表格
 */

import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pagination, Badge } from "@shared/components";
import { TABLE_COLUMN_CONFIGS, SORT_ORDER } from "../../enum";
import { formatCurrency } from "@shared/utils";
import { useEnumTranslation } from "@/shared/hooks/useEnumTranslation";

const StatisticsTableComponent = ({
  data = [],
  loading = false,
  error = null,
  sortBy = "enterpriseName",
  sortOrder = "asc",
  onSort,
  page = 1,
  pageSize = 20,
  total = 0,
  totalPages = 0,
  onPageChange,
  onPageSizeChange,
  visibleColumns = null, // 可见列配置（null 表示显示所有列）
}) => {
  const { t } = useTranslation();
  const { translateFieldValue } = useEnumTranslation();

  // 根据 visibleColumns 过滤列配置
  const filteredColumnConfigs = visibleColumns
    ? TABLE_COLUMN_CONFIGS.filter((col) => visibleColumns.includes(col.key))
    : TABLE_COLUMN_CONFIGS;

  const columns = filteredColumnConfigs.map((col) => {
    return {
      key: col.key,
      label: (
        <div className="flex items-center justify-center py-1 whitespace-nowrap">
          {t(col.labelKey)}
        </div>
      ),
      align: col.align || "center",
      width: col.width,
      render: (value, row) => {
        // 时间维度列
        if (col.key === "year") {
          return value ? (
            <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
              {value}
            </span>
          ) : (
            "-"
          );
        }
        if (col.key === "quarter") {
          return value ? (
            <span className="text-sm text-gray-700 whitespace-nowrap">
              {value}
            </span>
          ) : (
            "-"
          );
        }
        if (col.key === "month") {
          return value ? (
            <span className="text-sm text-gray-700 whitespace-nowrap">
              {value}
            </span>
          ) : (
            "-"
          );
        }

        // 基本信息列
        if (col.key === "businessRegNo") {
          return (
            <span className="font-mono text-xs text-gray-500 whitespace-nowrap">
              {value}
            </span>
          );
        }
        if (col.key === "enterpriseName") {
          return (
            <span className="font-medium text-gray-900 text-sm whitespace-nowrap">
              {value}
            </span>
          );
        }

        // KSIC 和产业分类字段的通用处理
        if (
          [
            "ksicMajor",
            "ksicSub",
            "gangwonIndustry",
            "gangwonFutureIndustry",
            "futureTech",
            "region",
          ].includes(col.key)
        ) {
          if (!value) return "-";

          // 使用 hook 中的统一翻译函数
          const displayText = translateFieldValue(col.key, value);

          return (
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {displayText}
            </span>
          );
        }

        // 江原主导产业中分类 - 特殊处理（JSON 数组）
        if (col.key === "gangwonIndustrySub") {
          if (!value) return "-";

          try {
            // 解析 JSON 字符串
            const codes = typeof value === "string" ? JSON.parse(value) : value;
            if (!Array.isArray(codes) || codes.length === 0) return "-";

            // 翻译每个代码
            const translatedCodes = codes.map((code) => {
              // 移除前缀字母（如 J62 -> 62）
              const numericCode = code.replace(/^[A-Z]+/, "");

              // 尝试多个翻译路径
              const translationKeys = [
                `enums.industry.mainIndustryKsicCodes.${code}`, // 优先：完整代码
                `enums.industry.mainIndustryKsicCodes.${numericCode}`, // 数字代码
                `enums.industry.ksicSub.${numericCode}`, // KSIC 中分类
                `enums.industry.mainIndustryKsic.${code}`,
                `enums.industry.mainIndustryKsic.${numericCode}`,
              ];

              for (const key of translationKeys) {
                const result = t(key);
                if (result !== key) {
                  return result;
                }
              }

              return code; // 如果都没找到，返回原代码
            });

            return (
              <div className="flex flex-wrap gap-1 justify-center">
                {translatedCodes.map((text, index) => (
                  <Badge
                    key={index}
                    variant="info"
                    className="px-1.5 py-0 text-[10px] font-normal whitespace-nowrap"
                  >
                    {text}
                  </Badge>
                ))}
              </div>
            );
          } catch (e) {
            // 解析失败，直接显示原值
            return (
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {value}
              </span>
            );
          }
        }

        if (col.key === "startupStage") {
          if (!value) return "-";
          const displayText = translateFieldValue("startupStage", value);
          return (
            <Badge
              variant="secondary"
              className="px-2 py-0.5 font-normal text-[11px] whitespace-nowrap"
            >
              {displayText}
            </Badge>
          );
        }
        if (col.key === "workYears") {
          if (!value && value !== 0) return "-";
          return (
            <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
              {value}
            </span>
          );
        }
        if (col.key === "patentCount") {
          if (!value && value !== 0) return "-";
          return (
            <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
              {value}
            </span>
          );
        }
        if (col.key === "employeeCount") {
          if (!value && value !== 0) return "-";
          return (
            <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
              {value}
            </span>
          );
        }
        if (col.key === "policyTags") {
          if (!value || value.length === 0) return "-";
          // 使用 translateFieldValue 翻译整个数组
          const translatedText = translateFieldValue("policyTags", value);
          if (translatedText === "-") return "-";
          // 拆分翻译后的文本为数组显示 Badge
          const tags = translatedText.split(", ").filter(Boolean);
          return (
            <div className="flex flex-wrap gap-1 justify-center">
              {tags.map((displayText, index) => (
                <Badge
                  key={index}
                  variant="success"
                  className="px-1.5 py-0 text-[10px] font-normal whitespace-nowrap"
                >
                  {displayText}
                </Badge>
              ))}
            </div>
          );
        }
        if (
          ["totalInvestment", "annualRevenue", "exportAmount"].includes(col.key)
        ) {
          const formatted = formatCurrency(value);
          return (
            <span
              className={`text-sm whitespace-nowrap ${
                col.key === "totalInvestment"
                  ? "text-blue-700 font-medium"
                  : "text-gray-700"
              }`}
            >
              {formatted}
            </span>
          );
        }

        // 代表者性别
        if (col.key === "representativeGender") {
          if (!value) return "-";
          const normalizedValue = value.toUpperCase();
          const genderKey =
            normalizedValue === "MALE"
              ? "admin.statistics.table.male"
              : normalizedValue === "FEMALE"
                ? "admin.statistics.table.female"
                : null;
          const genderText = genderKey ? t(genderKey) : value;
          return (
            <span className="text-sm text-gray-700 whitespace-nowrap">
              {genderText}
            </span>
          );
        }

        // 代表者年龄
        if (col.key === "representativeAge") {
          if (!value && value !== 0) return "-";
          return (
            <span className="text-sm text-gray-700 whitespace-nowrap">
              {value}
            </span>
          );
        }

        return (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {value || "-"}
          </span>
        );
      },
    };
  });

  if (error) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p>{t("admin.statistics.messages.queryError")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 可滚动的表格区域 */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 hidden md:table">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => {
                const align = column.align || "left";
                return (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      align === "left"
                        ? "text-left"
                        : align === "center"
                          ? "text-center"
                          : "text-right"
                    }`}
                    style={
                      column.width
                        ? { width: column.width, minWidth: column.width }
                        : undefined
                    }
                  >
                    {column.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-20 text-center text-gray-400"
                >
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-20 text-center text-gray-400"
                >
                  <p className="text-sm">
                    {t("admin.statistics.table.noData")}
                  </p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.businessRegNo || rowIndex}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  {columns.map((column) => {
                    const value = row[column.key];
                    const displayValue = column.render
                      ? column.render(value, row, rowIndex)
                      : (value ?? "-");
                    const cellClassName = column.cellClassName || "";
                    const align = column.align || "left";
                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-sm text-gray-900 ${
                          align === "left"
                            ? "text-left"
                            : align === "center"
                              ? "text-center"
                              : "text-right"
                        } ${cellClassName}`}
                        style={
                          column.width
                            ? { width: column.width, minWidth: column.width }
                            : undefined
                        }
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 固定的分页区域（不随表格横向滚动） */}
      {!loading && data.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/30">
          <div className="flex items-center text-xs text-gray-500">
            {t("common.pagination.total", { total })} {total}{" "}
            {t("common.pagination.items", "개")}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <label>{t("admin.statistics.pagination.itemsPerPage")}</label>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer text-gray-600 font-medium"
              >
                {[10, 20, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v} {t("admin.statistics.pagination.items")}
                  </option>
                ))}
              </select>
            </div>

            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={onPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// 使用 React.memo 优化，避免不必要的重新渲染
export const StatisticsTable = memo(StatisticsTableComponent);
