/*
 * ReportHeader - 统计报告页头组件
 */
import { useTranslation } from "react-i18next";
import { Button } from "@shared/components";
export const ReportHeader = ({ loading, exporting, onExport }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {t("admin.statistics.title")}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {t("admin.statistics.subtitle")}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="md"
          onClick={onExport}
          disabled={loading || exporting}
          className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-4 py-2 min-h-[40px]"
          loading={exporting}
        >
          {t("admin.statistics.filters.export")}
        </Button>
      </div>
    </div>
  );
};
