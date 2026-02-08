/*
 * ExportButtons - 通用导出按钮组件
 * 
 * 提供 Excel 和 CSV 导出按钮，可在任何需要导出功能的页面使用
 */
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

/**
 * 导出按钮组件
 * 
 * @param {Object} props
 * @param {boolean} props.loading - 页面加载状态
 * @param {boolean} props.exporting - Excel 导出中状态
 * @param {boolean} props.exportingCsv - CSV 导出中状态
 * @param {Function} props.onExportExcel - Excel 导出处理函数
 * @param {Function} props.onExportCsv - CSV 导出处理函数
 * @param {boolean} props.showExcel - 是否显示 Excel 按钮（默认 true）
 * @param {boolean} props.showCsv - 是否显示 CSV 按钮（默认 true）
 * @param {string} props.excelLabel - Excel 按钮文本（可选，使用翻译键或自定义文本）
 * @param {string} props.csvLabel - CSV 按钮文本（可选，使用翻译键或自定义文本）
 * @param {string} props.className - 额外的 CSS 类名
 */
export const ExportButtons = ({
  loading = false,
  exporting = false,
  exportingCsv = false,
  onExportExcel,
  onExportCsv,
  showExcel = true,
  showCsv = true,
  excelLabel,
  csvLabel,
  className = "",
}) => {
  const { t } = useTranslation();

  const defaultExcelLabel = t("common.export.excel", "Excel 내보내기");
  const defaultCsvLabel = t("common.export.csv", "CSV 내보내기");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showExcel && onExportExcel && (
        <Button
          variant="outline"
          size="md"
          onClick={onExportExcel}
          disabled={loading || exporting}
          className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-4 py-2 min-h-[40px]"
          loading={exporting}
        >
          {excelLabel || defaultExcelLabel}
        </Button>
      )}
      
      {showCsv && onExportCsv && (
        <Button
          variant="outline"
          size="md"
          onClick={onExportCsv}
          disabled={loading || exportingCsv}
          className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-4 py-2 min-h-[40px]"
          loading={exportingCsv}
        >
          {csvLabel || defaultCsvLabel}
        </Button>
      )}
    </div>
  );
};

export default ExportButtons;




