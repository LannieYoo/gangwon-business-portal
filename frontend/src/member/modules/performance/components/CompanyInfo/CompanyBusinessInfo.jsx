/**
 * Company Business Info
 *
 * 企业经营信息部分。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, Input, Select, Badge } from "@shared/components";
import { useEnumTranslation } from "@shared/hooks";
import {
  STARTUP_TYPE_KEYS,
  STARTUP_STAGE_KEYS,
  KSIC_MAJOR_CATEGORY_KEYS,
  getSubCategoryKeysByMajor,
  BUSINESS_FIELD_KEYS,
  MAIN_INDUSTRY_KSIC_MAJOR_KEYS,
  getMainIndustryKsicCodesByMajor,
  GANGWON_FUTURE_INDUSTRIES,
  FUTURE_TECHNOLOGIES,
} from "../../enum";

const CompanyBusinessInfo = ({
  data,
  isEditing,
  onChange,
  onCooperationChange,
  onParticipationChange,
}) => {
  const { t, i18n } = useTranslation();
  const {
    getStartupTypeOptions,
    getStartupStageOptions,
    getKsicMajorOptions,
    getKsicSubOptions,
    getBusinessFieldOptions,
    getMainIndustryKsicOptions,
    getMainIndustryKsicCodesOptions,
    getGangwonIndustryOptions,
    getFutureTechOptions,
  } = useEnumTranslation();

  // Options using useEnumTranslation hook
  const startupTypeOptions = useMemo(
    () => getStartupTypeOptions(STARTUP_TYPE_KEYS),
    [getStartupTypeOptions, i18n.language],
  );
  const startupStageOptions = useMemo(
    () => getStartupStageOptions(STARTUP_STAGE_KEYS),
    [getStartupStageOptions, i18n.language],
  );
  const ksicMajorOptions = useMemo(
    () => getKsicMajorOptions(KSIC_MAJOR_CATEGORY_KEYS),
    [getKsicMajorOptions, i18n.language],
  );
  const ksicSubOptions = useMemo(() => {
    const subKeys = getSubCategoryKeysByMajor(data.ksicMajor);
    return getKsicSubOptions(subKeys);
  }, [data.ksicMajor, getKsicSubOptions, i18n.language]);

  const mainIndustryKsicMajorOptions = useMemo(
    () => getMainIndustryKsicOptions(MAIN_INDUSTRY_KSIC_MAJOR_KEYS),
    [getMainIndustryKsicOptions, i18n.language],
  );
  const mainIndustryKsicCodeOptions = useMemo(() => {
    const codeKeys = getMainIndustryKsicCodesByMajor(
      data.mainIndustryKsicMajor,
    );
    return getMainIndustryKsicCodesOptions(codeKeys);
  }, [
    data.mainIndustryKsicMajor,
    getMainIndustryKsicCodesOptions,
    i18n.language,
  ]);

  const businessFieldOptions = useMemo(
    () => getBusinessFieldOptions(BUSINESS_FIELD_KEYS),
    [getBusinessFieldOptions, i18n.language],
  );

  const gangwonIndustryOptions = useMemo(
    () => getGangwonIndustryOptions(GANGWON_FUTURE_INDUSTRIES),
    [getGangwonIndustryOptions, i18n.language],
  );

  const futureTechOptions = useMemo(
    () => getFutureTechOptions(FUTURE_TECHNOLOGIES),
    [getFutureTechOptions, i18n.language],
  );

  const cooperationFieldOptions = [
    {
      value: "tech",
      label: t(
        "performance.companyInfo.profile.cooperationFields.tech",
        "기술협력",
      ),
    },
    {
      value: "market",
      label: t(
        "performance.companyInfo.profile.cooperationFields.market",
        "시장확대",
      ),
    },
    {
      value: "talent",
      label: t(
        "performance.companyInfo.profile.cooperationFields.talent",
        "인재양성",
      ),
    },
  ];

  const participationProgramOptions = [
    {
      value: "startup_university",
      label: t(
        "performance.companyInfo.profile.participationPrograms.startupCenterUniversity",
        "창업중심대학",
      ),
    },
    {
      value: "global_glocal",
      label: t(
        "performance.companyInfo.profile.participationPrograms.globalBusiness",
        "글로벌·글로컬 사업",
      ),
    },
    {
      value: "rise",
      label: t(
        "performance.companyInfo.profile.participationPrograms.riseBusiness",
        "RISE 사업단",
      ),
    },
    {
      value: "knu_tenant",
      label: t(
        "performance.companyInfo.profile.participationPrograms.knuTenant",
        "KNU 입주기업",
      ),
    },
  ];

  return (
    <Card className="shadow-sm p-0">
      <div className="flex items-center gap-3 border-b border-gray-100 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900 m-0">
          {t(
            "member.performance.companyInfo.sections.businessInfo",
            "사업 정보",
          )}
        </h2>
      </div>
      <div className="p-6 sm:p-8 space-y-8">
        {/* Industry Classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t(
              "member.performance.companyInfo.fields.startupType",
              "창업유형",
            )}
            value={data.startupType}
            onChange={(e) => onChange("startupType", e.target.value)}
            options={startupTypeOptions}
            disabled={!isEditing}
          />
          <Select
            label={t(
              "performance.companyInfo.fields.businessField",
              "사업 분야",
            )}
            value={data.businessField}
            onChange={(e) => onChange("businessField", e.target.value)}
            options={businessFieldOptions}
            disabled={!isEditing}
          />
          <Select
            label={t(
              "member.performance.companyInfo.fields.ksicMajor",
              "한국표준산업분류코드[대분류]",
            )}
            value={data.ksicMajor}
            onChange={(e) => onChange("ksicMajor", e.target.value)}
            options={ksicMajorOptions}
            disabled={!isEditing}
          />
          <Select
            label={t(
              "member.performance.companyInfo.fields.ksicSub",
              "한국표준사업분류코드[중분류]",
            )}
            value={data.ksicSub}
            onChange={(e) => onChange("ksicSub", e.target.value)}
            options={ksicSubOptions}
            disabled={!isEditing}
          />
        </div>

        {/* Main Industry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t(
              "performance.companyInfo.fields.mainIndustryKsicMajor",
              "주력산업 KSIC 코드",
            )}
            value={data.mainIndustryKsicMajor}
            onChange={(e) => onChange("mainIndustryKsicMajor", e.target.value)}
            options={mainIndustryKsicMajorOptions}
            disabled={!isEditing}
          />
          <Select
            label={t(
              "performance.companyInfo.fields.mainIndustryKsicCodes",
              "주력산업 KSIC 세부 코드",
            )}
            value={data.mainIndustryKsicCodes}
            onChange={(e) => onChange("mainIndustryKsicCodes", e.target.value)}
            options={mainIndustryKsicCodeOptions}
            disabled={!isEditing}
          />
          <Select
            label={t(
              "performance.companyInfo.fields.gangwonIndustry",
              "강원도 7대 미래산업",
            )}
            value={data.gangwonIndustry}
            onChange={(e) => onChange("gangwonIndustry", e.target.value)}
            options={gangwonIndustryOptions}
            disabled={!isEditing}
          />
          <Select
            label={t(
              "performance.companyInfo.fields.futureTech",
              "미래유망 신기술",
            )}
            value={data.futureTech}
            onChange={(e) => onChange("futureTech", e.target.value)}
            options={futureTechOptions}
            disabled={!isEditing}
          />
        </div>

        {/* Startup Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t("performance.companyInfo.fields.startupStage", "창업구분")}
            value={data.startupStage}
            onChange={(e) => onChange("startupStage", e.target.value)}
            options={startupStageOptions}
            disabled={!isEditing}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t(
              "member.performance.companyInfo.fields.revenue",
              "연간 매출액 (원)",
            )}
            value={data.revenue}
            onChange={(e) => onChange("revenue", e.target.value)}
            disabled={!isEditing}
            placeholder="0"
          />
          <Input
            label={t("performance.companyInfo.fields.employeeCount", "직원 수")}
            value={data.employeeCount}
            onChange={(e) => onChange("employeeCount", e.target.value)}
            disabled={!isEditing}
            placeholder="0"
          />
        </div>

        {/* Checkboxes for cooperation fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t(
              "performance.companyInfo.fields.cooperationFields",
              "산업협력 희망 분야",
            )}
          </label>
          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              cooperationFieldOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={data.cooperationFields?.includes(opt.value)}
                    onChange={(e) =>
                      onCooperationChange(opt.value, e.target.checked)
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))
            ) : data.cooperationFields?.length > 0 ? (
              data.cooperationFields.map((val) => {
                const opt = cooperationFieldOptions.find(
                  (o) => o.value === val,
                );
                return (
                  <span
                    key={val}
                    className="px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-100 rounded-md"
                  >
                    {opt ? opt.label : val}
                  </span>
                );
              })
            ) : (
              <span className="text-sm text-gray-400">
                {t("common.notSet", "설정되지 않음")}
              </span>
            )}
          </div>
        </div>

        {/* Participation Programs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t(
              "performance.companyInfo.fields.participationPrograms",
              "참여 프로그램",
            )}
          </label>
          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              participationProgramOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={data.participationPrograms?.includes(opt.value)}
                    onChange={(e) =>
                      onParticipationChange(opt.value, e.target.checked)
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))
            ) : data.participationPrograms?.length > 0 ? (
              data.participationPrograms.map((val) => {
                const opt = participationProgramOptions.find(
                  (o) => o.value === val,
                );
                return (
                  <span
                    key={val}
                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-md"
                  >
                    {opt ? opt.label : val}
                  </span>
                );
              })
            ) : (
              <span className="text-sm text-gray-400">
                {t("common.notSet", "설정되지 않음")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CompanyBusinessInfo;
