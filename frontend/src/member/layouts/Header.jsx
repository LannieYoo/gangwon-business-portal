/**
 * Header Component - Member Portal
 * 会员端顶部导航
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '@shared/stores/authStore';
import LanguageSwitcher from '@shared/components/LanguageSwitcher';
import './Header.css';

export default function Header({ onToggleSidebar }) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/member/login';
  };

  return (
    <header className="member-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
        
        <Link to="/member" className="header-logo">
          <img src="/logo.png" alt="GangwonBiz" />
          <span className="logo-text">{t('common.siteName')}</span>
        </Link>
      </div>

      <div className="header-right">
        {/* 语言切换 */}
        <LanguageSwitcher />

        {/* 通知 */}
        <button className="header-icon-btn" title={t('header.notifications')}>
          🔔
          <span className="notification-badge">3</span>
        </button>

        {/* 用户菜单 */}
        <div className="user-menu">
          <button 
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.companyName?.charAt(0) || 'U'}
            </div>
            <span className="user-name">{user?.companyName || t('common.user')}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <Link 
                to="/member/profile" 
                className="menu-item"
                onClick={() => setShowUserMenu(false)}
              >
                <span className="menu-icon">👤</span>
                {t('header.profile')}
              </Link>
              
              <Link 
                to="/member/support" 
                className="menu-item"
                onClick={() => setShowUserMenu(false)}
              >
                <span className="menu-icon">💬</span>
                {t('header.support')}
              </Link>
              
              <div className="menu-divider" />
              
              <button 
                className="menu-item"
                onClick={handleLogout}
              >
                <span className="menu-icon">🚪</span>
                {t('header.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

