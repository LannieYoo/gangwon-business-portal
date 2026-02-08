import { useTranslation } from "react-i18next";
import { EyeIcon, EyeOffIcon } from "@shared/components/Icons";
import { useEnumTranslation } from "@shared/hooks";

export const RegisterStep1Basic = ({
  formData,
  handleChange,
  handleBusinessNumberChange,
  showPassword,
  setShowPassword,
  showPasswordConfirm,
  setShowPasswordConfirm,
}) => {
  const { t } = useTranslation();
  const { getRegionOptions } = useEnumTranslation();

  // Get region options from hook (without empty option as we add it manually)
  const regionOptions = getRegionOptions(false);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.businessLicense")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.businessNumber}
          onChange={handleBusinessNumberChange}
          maxLength={12}
          placeholder="000-00-00000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          {t("member.auth.businessLicenseHelp")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.password")} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {t("member.auth.passwordHelp")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.passwordConfirm")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswordConfirm ? "text" : "password"}
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswordConfirm ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.companyName")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          autoComplete="organization"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("member.auth.region")} <span className="text-red-500">*</span>
        </label>
        <select
          name="region"
          value={formData.region}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        >
          <option value="">{t("member.auth.selectRegion")}</option>
          {regionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("member.auth.category")} <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="individual"
              checked={formData.category === "individual"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">
              {t("member.auth.categoryIndividual")}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="corporation"
              checked={formData.category === "corporation"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">
              {t("member.auth.categoryCorporation")}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="nonprofit"
              checked={formData.category === "nonprofit"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">
              {t("member.auth.categoryNonProfit")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
