/**
 * Company Basic Info
 *
 * 企业基本信息部分。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Input, Textarea, Select, Button, Modal } from "@shared/components";
import { useEnumTranslation } from "@shared/hooks";

const CompanyBasicInfo = ({
  data,
  isEditing,
  onChange,
  onLogoUpload,
  onCertificateUpload,
  uploadingLogo,
  uploadingCertificate,
  errors,
}) => {
  const { t } = useTranslation();
  const { getRegionOptions } = useEnumTranslation();
  const [previewImage, setPreviewImage] = useState(null);

  const handleDownloadImage = async () => {
    if (!previewImage?.url) {
      return;
    }

    try {
      const response = await fetch(previewImage.url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const urlPath = new URL(previewImage.url).pathname;
      const fileName = urlPath.split("/").pop() || "download";

      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const link = document.createElement("a");
      link.href = previewImage.url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 地区选项 - 使用统一的 hook 获取
  const regionOptions = useMemo(() => {
    // getRegionOptions 返回 { value, label } 格式，第一项是空选项
    return getRegionOptions(
      true,
      t("member.performance.companyInfo.fields.selectRegion", "지역 선택"),
    );
  }, [getRegionOptions, t]);

  return (
    <Card className="shadow-sm p-0">
      <div className="flex items-center gap-3 border-b border-gray-100 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900 m-0">
          {t("member.performance.companyInfo.sections.basicInfo", "기본 정보")}
        </h2>
      </div>
      <div className="p-6 sm:p-8 space-y-6">
        {/* Logo & Certificate */}
        <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Logo */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3 sm:mb-4">
                {t("member.performance.companyInfo.sections.logo", "기업 로고")}
              </label>
              {isEditing ? (
                <>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={(e) => onLogoUpload(e.target.files[0])}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                  {uploadingLogo ? (
                    <div className="w-32 h-32 border-2 border-blue-300 rounded-lg flex flex-col items-center justify-center bg-blue-50">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                      <span className="text-xs text-blue-600">
                        {t("common.uploading", "업로드 중...")}
                      </span>
                    </div>
                  ) : data.logoPreview || data.logoUrl ? (
                    <div className="flex flex-col items-start gap-2">
                      <div
                        className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => document.getElementById("logo-upload")?.click()}
                        title={t("common.changeFile", "파일 변경")}
                      >
                        <img
                          key="logo-edit"
                          src={data.logoPreview || data.logoUrl}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = ""; e.target.style.display = "none"; }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-500 text-xs sm:text-sm hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                      title={t("member.performance.companyInfo.profile.clickToUploadLogo", "로고 업로드하려면 클릭")}
                    >
                      {t("member.performance.companyInfo.profile.noLogo", "로고 없음")}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {data.logoUrl ? (
                    <div className="flex flex-col items-start gap-2">
                      <div
                        className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                        onClick={() => setPreviewImage({ url: data.logoUrl, title: t("member.performance.companyInfo.sections.logo", "기업 로고") })}
                      >
                        <img
                          key="logo-view"
                          src={data.logoUrl}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = ""; e.target.style.display = "none"; }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-500 text-xs sm:text-sm">
                      {t("member.performance.companyInfo.profile.noLogo", "로고 없음")}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Certificate / 사업자등록증 */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3 sm:mb-4">
                {t("member.performance.companyInfo.sections.certificate", "사업자등록증")}
              </label>
              {isEditing ? (
                <>
                  <input
                    type="file"
                    id="certificate-upload"
                    accept="image/*"
                    onChange={(e) => onCertificateUpload(e.target.files[0])}
                    className="hidden"
                    disabled={uploadingCertificate}
                  />
                  {uploadingCertificate ? (
                    <div className="w-32 h-32 border-2 border-blue-300 rounded-lg flex flex-col items-center justify-center bg-blue-50">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                      <span className="text-xs text-blue-600">
                        {t("common.uploading", "업로드 중...")}
                      </span>
                    </div>
                  ) : data.certificateUrl ? (
                    <div className="flex flex-col items-start gap-2">
                      <div
                        className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => document.getElementById("certificate-upload")?.click()}
                        title={t("common.changeFile", "파일 변경")}
                      >
                        <img
                          key="cert-edit"
                          src={data.certificateUrl}
                          alt={t("member.performance.companyInfo.sections.certificate", "사업자등록증")}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-500 text-xs sm:text-sm hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                      onClick={() => document.getElementById("certificate-upload")?.click()}
                      title={t("common.uploadFile", "파일 업로드")}
                    >
                      {t("common.noFile", "파일 없음")}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {data.certificateUrl ? (
                    <div className="flex flex-col items-start gap-2">
                      <div
                        className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                        onClick={() => setPreviewImage({ url: data.certificateUrl, title: t("member.performance.companyInfo.sections.certificate", "사업자등록증") })}
                      >
                        <img
                          key="cert-view"
                          src={data.certificateUrl}
                          alt={t("member.performance.companyInfo.sections.certificate", "사업자등록증")}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-500 text-xs sm:text-sm">
                      {t("common.noFile", "파일 없음")}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label={t(
              "member.performance.companyInfo.fields.companyName",
              "기업명",
            )}
            value={data.companyName}
            onChange={(e) => onChange("companyName", e.target.value)}
            disabled={!isEditing}
            required
            error={errors.companyName}
          />
          <Input
            label={t(
              "member.performance.companyInfo.fields.foundingDate",
              "설립일",
            )}
            type="date"
            value={data.foundingDate}
            onChange={(e) => onChange("foundingDate", e.target.value)}
            disabled={!isEditing}
            required
            error={errors.foundingDate}
          />
          <Input
            label={t(
              "member.performance.companyInfo.fields.businessNumber",
              "사업자등록번호",
            )}
            value={data.businessNumber}
            onChange={(e) => onChange("businessNumber", e.target.value)}
            disabled={!isEditing}
            error={errors.businessNumber}
          />
          <Input
            label={t(
              "member.performance.companyInfo.fields.corporationNumber",
              "법인등록번호",
            )}
            value={data.legalNumber}
            onChange={(e) => onChange("legalNumber", e.target.value)}
            disabled={!isEditing}
            error={errors.legalNumber}
          />
          <Select
            label={t(
              "member.performance.companyInfo.fields.region",
              "소재지역",
            )}
            value={data.region}
            onChange={(e) => onChange("region", e.target.value)}
            disabled={!isEditing}
            required
            error={errors.region}
            options={regionOptions}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 mt-6 pt-6 border-t border-gray-100">
          <Input
            label={t("member.performance.companyInfo.fields.address", "주소")}
            value={data.address}
            onChange={(e) => onChange("address", e.target.value)}
            disabled={!isEditing}
            required
            error={errors.address}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label={t("member.performance.companyInfo.fields.email", "이메일")}
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            disabled={!isEditing}
            error={errors.email}
          />
          <Input
            label={t(
              "member.performance.companyInfo.fields.phone",
              "회사대표 전화번호",
            )}
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            disabled={!isEditing}
            error={errors.phone}
          />
          <Input
            label={t(
              "member.performance.companyInfo.fields.website",
              "홈페이지",
            )}
            value={data.website}
            onChange={(e) => onChange("website", e.target.value)}
            disabled={!isEditing}
            placeholder="https://"
            error={errors.website}
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Textarea
            label={t(
              "member.performance.companyInfo.fields.description",
              "기업소개",
            )}
            value={data.description}
            onChange={(e) => onChange("description", e.target.value)}
            disabled={!isEditing}
            rows={4}
          />
        </div>

        {/* Image Preview Modal / 图片预览弹窗 */}
        {previewImage && (
          <Modal
            isOpen={!!previewImage}
            onClose={() => setPreviewImage(null)}
            title={previewImage.title}
            size="lg"
          >
            <div className="flex flex-col items-center gap-4">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleDownloadImage}
                className="inline-flex items-center justify-center font-medium no-underline rounded-md transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 hover:text-white px-4 py-2 text-base min-h-[40px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.download", "다운로드")}
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </Card>
  );
};

export default CompanyBasicInfo;
