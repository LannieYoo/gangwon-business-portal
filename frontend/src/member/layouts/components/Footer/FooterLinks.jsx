/**
 * Footer Links Component
 * 页脚链接组件 (版权信息、服务条款、隐私政策、版本号)
 *
 * 参考 dev-frontend_patterns skill 构建
 */

import { useTranslation } from "react-i18next";
import { TERM_TYPES } from "@shared/components";

/**
 * FooterLinks Component
 * @param {Object} props
 * @param {Function} props.onOpenModal - 打开条款弹窗回调
 */
export function FooterLinks({ onOpenModal }) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const handleTermsClick = (e) => {
    e.preventDefault();
    onOpenModal(TERM_TYPES.TERMS_OF_SERVICE);
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    onOpenModal(TERM_TYPES.PRIVACY_POLICY);
  };

  return (
    <div className="max-w-full mx-auto flex justify-between items-center text-sm gap-6 whitespace-nowrap text-gray-600 max-md:gap-3 max-md:text-[0.8125rem] max-sm:text-xs max-sm:gap-2">
      {/* Copyright */}
      <div className="flex items-center gap-3 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
        <p className="m-0 text-sm leading-[1.4] font-normal whitespace-nowrap text-gray-600 max-sm:text-xs">
          &copy; {currentYear} {t("member.layout.footer.copyright")}
        </p>
      </div>

      {/* Links & Version */}
      <div className="flex items-center gap-4 text-right whitespace-nowrap flex-shrink-0 max-md:gap-3">
        <div className="flex items-center gap-2 whitespace-nowrap max-md:gap-[0.375rem]">
          <a
            href="#"
            className="text-sm no-underline transition-colors duration-200 font-medium py-1 text-gray-600 hover:underline hover:text-blue-700 max-sm:text-xs"
            onClick={handleTermsClick}
          >
            {t("member.layout.footer.termsOfService")}
          </a>
          <span className="text-sm mx-2 text-gray-300">|</span>
          <a
            href="#"
            className="text-sm no-underline transition-colors duration-200 font-medium py-1 text-gray-600 hover:underline hover:text-blue-700 max-sm:text-xs"
            onClick={handlePrivacyClick}
          >
            {t("member.layout.footer.privacyPolicy")}
          </a>
        </div>
        <span className="text-sm mx-2 text-gray-300">|</span>
        <div className="flex items-center gap-4">
          <span className="text-sm flex items-center gap-1 text-gray-600 max-sm:text-xs">
            {t("member.layout.footer.version")}:{" "}
            <strong className="font-semibold text-blue-700">1.0.0</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
