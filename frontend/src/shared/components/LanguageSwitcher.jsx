/**
 * Language Switcher Component
 * 语言切换组件
 */

import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'ko', label: '한국어' },
    { code: 'zh', label: '中文' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const nextLanguage = languages.find(lang => lang.code !== i18n.language) || languages[1];

  const toggleLanguage = () => {
    i18n.changeLanguage(nextLanguage.code);
  };

  return (
    <button
      className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-primary-600 text-white hover:bg-primary-700"
      onClick={toggleLanguage}
      title={`切换到 ${nextLanguage.label} / Switch to ${nextLanguage.label}`}
    >
      {currentLanguage.code.toUpperCase()}
    </button>
  );
}

