import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import { useEnumTranslation } from "@shared/hooks";
import {
  STARTUP_TYPES,
  STARTUP_STAGES,
  KSIC_MAJOR_CATEGORIES,
  MAIN_INDUSTRY_KSIC_MAJORS,
  GANGWON_FUTURE_INDUSTRIES,
  FUTURE_TECHNOLOGIES,
  PARTICIPATION_PROGRAMS,
  getSubCategoriesByMajor,
  getMainIndustryCodesByMajor,
} from "@/shared/enums";

export const RegisterStep4Business = ({
  formData,
  handleChange,
  setFormData,
}) => {
  const { t } = useTranslation();
  const {
    getStartupTypeOptions,
    getStartupStageOptions,
    getKsicMajorOptions,
    getKsicSubOptions,
    getMainIndustryKsicOptions,
    getMainIndustryKsicCodesOptions,
    getGangwonIndustryOptions,
    getFutureTechOptions,
    translateParticipationPrograms,
  } = useEnumTranslation();

  const [ksicSubKeys, setKsicSubKeys] = useState([]);
  const [mainIndustrySubKeys, setMainIndustrySubKeys] = useState([]);

  useEffect(() => {
    if (formData.ksicMajor) {
      const subKeys = getSubCategoriesByMajor(formData.ksicMajor);
      setKsicSubKeys(subKeys);
    } else {
      setKsicSubKeys([]);
      setFormData((prev) => ({ ...prev, ksicSub: "" }));
    }
  }, [formData.ksicMajor, setFormData]);

  useEffect(() => {
    if (formData.mainIndustryKsicMajor) {
      const subKeys = getMainIndustryCodesByMajor(
        formData.mainIndustryKsicMajor,
      );
      setMainIndustrySubKeys(subKeys);
    } else {
      setMainIndustrySubKeys([]);
      setFormData((prev) => ({ ...prev, mainIndustryKsicCodes: "" }));
    }
  }, [formData.mainIndustryKsicMajor, setFormData]);

  // 使用 hook 获取翻译后的选项
  const startupTypeOptions = useMemo(
    () => getStartupTypeOptions(STARTUP_TYPES, false),
    [getStartupTypeOptions],
  );
  const startupStageOptions = useMemo(
    () => getStartupStageOptions(STARTUP_STAGES, false),
    [getStartupStageOptions],
  );
  const ksicMajorOptions = useMemo(
    () => getKsicMajorOptions(KSIC_MAJOR_CATEGORIES, false),
    [getKsicMajorOptions],
  );
  const ksicSubOptions = useMemo(
    () => getKsicSubOptions(ksicSubKeys, false),
    [getKsicSubOptions, ksicSubKeys],
  );
  const mainIndustryMajorOptions = useMemo(
    () => getMainIndustryKsicOptions(MAIN_INDUSTRY_KSIC_MAJORS, false),
    [getMainIndustryKsicOptions],
  );
  const mainIndustrySubOptions = useMemo(
    () => getMainIndustryKsicCodesOptions(mainIndustrySubKeys, false),
    [getMainIndustryKsicCodesOptions, mainIndustrySubKeys],
  );
  const gangwonIndustryOptions = useMemo(
    () => getGangwonIndustryOptions(GANGWON_FUTURE_INDUSTRIES, false),
    [getGangwonIndustryOptions],
  );
  const futureTechOptions = useMemo(
    () => getFutureTechOptions(FUTURE_TECHNOLOGIES, false),
    [getFutureTechOptions],
  );

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.startupType", "창업유형")}
        </label>
        <select
          name="startupType"
          value={formData.startupType || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        >
          <option value="">
            {t("member.auth.selectStartupType", "창업유형을 선택하세요")}
          </option>
          {startupTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.startupStage", "창업구분")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <select
          name="startupStage"
          value={formData.startupStage || ""}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        >
          <option value="">
            {t("member.auth.selectStartupStage", "창업구분을 선택하세요")}
          </option>
          {startupStageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("member.auth.ksicMajor", "한국표준산업분류코드[대분류]")}
          </label>
          <select
            name="ksicMajor"
            value={formData.ksicMajor || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
            <option value="">
              {t("member.auth.selectKsicMajor", "대분류를 선택하세요")}
            </option>
            {ksicMajorOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("member.auth.ksicSub", "한국표준산업분류코드[중분류]")}
          </label>
          <select
            name="ksicSub"
            value={formData.ksicSub || ""}
            onChange={handleChange}
            disabled={!formData.ksicMajor}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {formData.ksicMajor
                ? t("member.auth.selectKsicSub", "중분류를 선택하세요")
                : t(
                    "member.auth.selectKsicMajorFirst",
                    "먼저 대분류를 선택하세요",
                  )}
            </option>
            {ksicSubOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("member.auth.mainIndustryKsicMajor", "주력산업 KSIC 코드")}
          </label>
          <select
            name="mainIndustryKsicMajor"
            value={formData.mainIndustryKsicMajor || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
            <option value="">
              {t("auth.selectMainIndustryKsicMajor", "주력산업을 선택하세요")}
            </option>
            {mainIndustryMajorOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("member.auth.mainIndustryKsicCodes", "주력산업 KSIC 세부 코드")}
          </label>
          <select
            name="mainIndustryKsicCodes"
            value={formData.mainIndustryKsicCodes || ""}
            onChange={handleChange}
            disabled={!formData.mainIndustryKsicMajor}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {formData.mainIndustryKsicMajor
                ? t(
                    "auth.selectMainIndustryKsicCodes",
                    "세부 코드를 선택하세요",
                  )
                : t(
                    "auth.selectMainIndustryKsicMajorFirst",
                    "먼저 주력산업을 선택하세요",
                  )}
            </option>
            {mainIndustrySubOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("member.auth.gangwonIndustry", "강원도 7대 미래산업")}
          </label>
          <select
            name="gangwonIndustry"
            value={formData.gangwonIndustry || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
            <option value="">
              {t("member.auth.selectGangwonIndustry", "선택하세요")}
            </option>
            {gangwonIndustryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("member.auth.futureTech", "미래유망 신기술")}
          </label>
          <select
            name="futureTech"
            value={formData.futureTech || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
            <option value="">
              {t("member.auth.selectFutureTech", "선택하세요")}
            </option>
            {futureTechOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.websiteUrl")}
        </label>
        <input
          type="url"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.mainBusiness")}
        </label>
        <textarea
          name="mainBusiness"
          value={formData.mainBusiness}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
        />
      </div>

      {/* 企业介绍 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.description", "기업 소개")}
        </label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("member.auth.sales")}
          </label>
          <input
            type="text"
            name="sales"
            value={formData.sales}
            onChange={handleChange}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("member.auth.employeeCount")}
          </label>
          <input
            type="text"
            name="employeeCount"
            value={formData.employeeCount}
            onChange={handleChange}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.cooperationFields")}
        </label>
        <input
          type="text"
          value={formData.cooperationFields.join(", ")}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              cooperationFields: e.target.value
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v),
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
        <p className="mt-1 text-xs text-gray-500">
          {t("common.commaSeparatedHint", "여러 값은 쉼표로 구분해주세요")}
        </p>
      </div>

      {/* 参与项目 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.participationPrograms", "참여 프로그램")}
        </label>
        <div className="space-y-2">
          {PARTICIPATION_PROGRAMS.map((prog) => (
            <label key={prog} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.participationPrograms?.includes(prog) || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    participationPrograms: checked
                      ? [...(prev.participationPrograms || []), prog]
                      : (prev.participationPrograms || []).filter((p) => p !== prog),
                  }));
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {translateParticipationPrograms(prog)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 投资状况 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.investmentStatus", "투자 현황")}
        </label>
        <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t("common.investmentYesNo", "투자 유무")}
            </label>
            <select
              value={formData.investmentStatus?.hasInvestment ? "true" : "false"}
              onChange={(e) => {
                const has = e.target.value === "true";
                setFormData((prev) => ({
                  ...prev,
                  investmentStatus: { ...prev.investmentStatus, hasInvestment: has },
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="false">{t("common.no", "아니오")}</option>
              <option value="true">{t("common.yes", "예")}</option>
            </select>
          </div>
          {formData.investmentStatus?.hasInvestment && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t("common.investmentAmount", "투자 금액")}
                </label>
                <input
                  type="text"
                  value={formData.investmentStatus?.amount || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      investmentStatus: { ...prev.investmentStatus, amount: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t("common.investmentInstitution", "투자 기관")}
                </label>
                <input
                  type="text"
                  value={formData.investmentStatus?.institution || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      investmentStatus: { ...prev.investmentStatus, institution: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
