/**
 * 项目详情内容组件
 *
 * 显示项目标题、元数据、图片和HTML内容。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from "react-i18next";
import { Badge } from "@shared/components";
import { formatDate } from "@shared/utils";
import { useProjectStatus } from "../../hooks/useProjectStatus";

export default function ProjectDetailContent({ project }) {
  const { t, i18n } = useTranslation();
  const { getStatusInfo } = useProjectStatus();
  const currentLanguage = i18n.language === "zh" ? "zh" : "ko";

  if (!project) return null;

  const badgeInfo = getStatusInfo(project.status);

  return (
    <>
      {/* 基本信息和封面图片 - 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 左侧：基本信息 */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 m-0">
              {t("projects.detail.basicInfo", "기본 정보")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm text-gray-600 font-medium">
                {t("projects.detail.title", "지원사업")}
              </label>
              <span className="text-base text-gray-900">
                {project.title || "-"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t("projects.detail.status", "상태")}
              </label>
              <div>
                <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t("projects.detail.createdAt", "생성일")}
              </label>
              <span className="text-base text-gray-900">
                {formatDate(project.createdAt, "yyyy-MM-dd", currentLanguage)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t("projects.detail.startDate", "시작일")}
              </label>
              <span className="text-base text-gray-900">
                {formatDate(project.startDate, "yyyy-MM-dd", currentLanguage)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t("projects.detail.endDate", "종료일")}
              </label>
              <span className="text-base text-gray-900">
                {formatDate(project.endDate, "yyyy-MM-dd", currentLanguage)}
              </span>
            </div>
          </div>
        </div>

        {/* 右侧：封面图片 */}
        <div>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 m-0">
              {t("projects.detail.image", "대표 이미지")}
            </h2>
          </div>
          <div className="flex justify-center items-center h-48">
            {project.imageUrl ? (
              <img
                src={project.imageUrl}
                alt={project.title}
                className="max-w-full max-h-48 object-contain rounded-lg border border-gray-200"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">
                  {t("projects.detail.noImage", "표지 이미지가 없습니다")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 项目详情内容 */}
      {(project.description || project.contentHtml) && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 m-0">
              {t("projects.detail.content", "지원사업")}
            </h2>
          </div>
          <div className="prose prose-sm md:prose max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: project.description || project.contentHtml,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
