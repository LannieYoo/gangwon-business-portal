/**
 * ColumnVisibilityPanel - 列可见性控制面板
 *
 * 允许用户选择显示/隐藏表格列
 */

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@shared/components";
import { TABLE_COLUMN_CONFIGS } from "../../enum";
import { COLUMN_GROUPS, COLUMN_PRESETS } from "../../hooks/useColumnVisibility";

export const ColumnVisibilityPanel = ({
  visibleColumns,
  onToggleColumn,
  onToggleGroup,
  onApplyPreset,
  onShowAll,
  onHideAll,
  isColumnVisible,
  isColumnToggleable,
  isGroupVisible,
  isGroupPartiallyVisible,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    right: 0,
    maxHeight: 500,
  });
  const buttonRef = useRef(null);

  // 计算弹框位置
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceAbove = rect.top; // 按钮上方的空间
      const maxHeight = Math.min(500, spaceAbove - 20); // 最大高度 500px 或上方剩余空间减去 20px 边距

      // 弹框顶部位置 = 按钮顶部 - 弹框高度 - 8px间距
      // 但我们用 transform 来实现向上展开效果
      setPosition({
        top: rect.top + window.scrollY - 8, // 按钮顶部位置（相对于文档）- 8px间距
        right: window.innerWidth - rect.right, // 右对齐
        maxHeight: maxHeight > 200 ? maxHeight : 200, // 最小高度 200px
      });
    }
  }, [isOpen]);

  // 获取列的显示名称
  const getColumnLabel = (columnKey) => {
    const config = TABLE_COLUMN_CONFIGS.find((c) => c.key === columnKey);
    return config ? t(config.labelKey) : columnKey;
  };

  // 渲染分组
  const renderGroup = (group) => {
    const isVisible = isGroupVisible(group.key);
    const isPartial = isGroupPartiallyVisible(group.key);

    return (
      <div key={group.key} className="mb-4">
        {/* 分组标题 */}
        <div className="flex items-center mb-2">
          <button
            type="button"
            onClick={() => onToggleGroup(group.key)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
          >
            <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center">
              {isVisible && (
                <svg
                  className="w-3 h-3 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {isPartial && !isVisible && (
                <div className="w-2 h-2 bg-primary-400 rounded-sm" />
              )}
            </div>
            <span>{t(group.labelKey)}</span>
          </button>
        </div>

        {/* 分组内的列 */}
        <div className="ml-6 space-y-1.5">
          {group.columns.map((columnKey) => {
            const visible = isColumnVisible(columnKey);
            const toggleable = isColumnToggleable(columnKey);

            return (
              <label
                key={columnKey}
                className={`flex items-center gap-2 text-sm ${
                  toggleable
                    ? "cursor-pointer hover:text-primary-600"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={visible}
                  disabled={!toggleable}
                  onChange={() => toggleable && onToggleColumn(columnKey)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:cursor-not-allowed"
                />
                <span className={visible ? "text-gray-900" : "text-gray-500"}>
                  {getColumnLabel(columnKey)}
                </span>
                {!toggleable && (
                  <span className="text-xs text-gray-400">
                    ({t("admin.statistics.table.required", "필수")})
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染弹框内容
  const renderPanel = () => {
    if (!isOpen) return null;

    return createPortal(
      <>
        {/* 遮罩层 */}
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

        {/* 面板内容 - 使用 absolute 定位，向上展开（使用 transform） */}
        <div
          className="absolute w-80 z-50 flex flex-col"
          style={{
            top: `${position.top}px`,
            right: `${position.right}px`,
            maxHeight: `${position.maxHeight}px`,
            transform: "translateY(-100%)", // 向上偏移自身高度，实现向上展开
          }}
        >
          <Card className="shadow-2xl border-2 border-gray-200 flex flex-col overflow-hidden">
            {/* 标题 - 固定不滚动 */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900">
                {t("admin.statistics.table.columnSettings", "열 설정")}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 可滚动内容区域 */}
            <div className="overflow-y-auto flex-1 p-4">
              {/* 快速操作 */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  {t("admin.statistics.table.quickActions", "빠른 설정")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.values(COLUMN_PRESETS).map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => onApplyPreset(preset.key)}
                      className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {t(preset.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 列分组 */}
              <div className="mb-4">
                {Object.values(COLUMN_GROUPS).map((group) =>
                  renderGroup(group),
                )}
              </div>
            </div>

            {/* 底部操作 - 固定不滚动 */}
            <div className="p-4 pt-3 border-t border-gray-200 flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={onShowAll}
                className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t("admin.statistics.table.showAll", "전체 표시")}
              </button>
              <button
                type="button"
                onClick={onHideAll}
                className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t("admin.statistics.table.hideAll", "전체 숨김")}
              </button>
            </div>
          </Card>
        </div>
      </>,
      document.body,
    );
  };

  return (
    <>
      {/* 触发按钮 */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        {t("admin.statistics.table.columnSettings", "열 설정")}
        <span className="text-xs text-gray-500">
          ({visibleColumns.length}/{TABLE_COLUMN_CONFIGS.length})
        </span>
      </button>

      {/* 渲染弹框到 body */}
      {renderPanel()}
    </>
  );
};
