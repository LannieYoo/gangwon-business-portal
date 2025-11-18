/**
 * Theme Switcher Component
 * 主题切换组件
 */

import { useTranslation } from 'react-i18next';
import { useUIStore } from '@shared/stores/uiStore';
import { SunIcon, MoonIcon } from './Icons';
import './ThemeSwitcher.css';

/**
 * @param {Object} props
 * @param {'light'|'dark'} props.variant - 样式变体：'light' 用于深色背景，'dark' 用于浅色背景
 */
export default function ThemeSwitcher({ variant = 'dark' }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useUIStore();

  // 根据 variant 选择样式
  const buttonClasses = variant === 'light'
    ? 'theme-switcher-btn theme-switcher-btn-light'
    : 'theme-switcher-btn theme-switcher-btn-dark';

  const isDark = theme === 'dark';

  return (
    <button
      className={buttonClasses}
      onClick={toggleTheme}
      title={isDark ? t('common.theme.switchToLight', '切换到浅色模式') : t('common.theme.switchToDark', '切换到深色模式')}
    >
      {isDark ? (
        <SunIcon className="theme-switcher-icon" />
      ) : (
        <MoonIcon className="theme-switcher-icon" />
      )}
      <span className="theme-switcher-text">
        {isDark ? t('common.theme.light', '浅色') : t('common.theme.dark', '深色')}
      </span>
    </button>
  );
}

