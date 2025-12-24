/**
 * Language Switcher Component
 * Only visible in development environment
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeIcon } from './Icons';
import { setStorage } from '@shared/utils/storage';
import { exceptionService } from '@shared/exception';
import { cn } from '@shared/utils/helpers';

/**
 * @param {Object} props
 * @param {'light'|'dark'} props.variant - Style variant: 'light' for dark backgrounds, 'dark' for light backgrounds
 */
export default function LanguageSwitcher({ variant = 'dark' }) {
  const { i18n } = useTranslation();
  
  // Only show in development environment
  const isDevelopment = import.meta.env.DEV;

  const languages = [
    { code: 'ko', label: '한국어' },
    { code: 'zh', label: '中文' }
  ];

  // Normalize current language: extract base language (e.g., 'ko-KR' -> 'ko')
  const currentLangCode = (i18n.language || 'ko').split('-')[0];
  const currentLanguage = languages.find(lang => lang.code === currentLangCode) || languages[0];
  const nextLanguage = languages.find(lang => lang.code !== currentLangCode) || languages[1];

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', currentLangCode);
    }
  }, [currentLangCode]);

  const persistLanguagePreference = (code) => {
    setStorage('language', code);
    try {
      localStorage.setItem('i18nextLng', code);
    } catch (error) {
      exceptionService.recordException(error, {
        request_path: window.location.pathname,
        error_code: 'PERSIST_LANGUAGE_FAILED',
        context_data: { language_code: code }
      });
    }
  };

  const toggleLanguage = () => {
    const targetCode = nextLanguage.code;
    persistLanguagePreference(targetCode);
    i18n.changeLanguage(targetCode).catch(error => {
      exceptionService.recordException(error, {
        request_path: window.location.pathname,
        error_code: error.code || 'CHANGE_LANGUAGE_FAILED',
        context_data: { target_language: targetCode }
      });
    });
  };

  // Hide in production environment
  if (!isDevelopment) {
    return null;
  }

  return (
    <button
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'light'
          ? 'focus:ring-white text-white hover:opacity-80'
          : 'focus:ring-primary-500 text-gray-700 dark:text-gray-300 hover:opacity-80'
      )}
      onClick={toggleLanguage}
      title={`Switch to ${nextLanguage.label}`}
    >
      <GlobeIcon className="w-5 h-5" />
    </button>
  );
}

