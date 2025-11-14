/**
 * Header Component - Admin Portal
 * 管理员端顶部导航
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
    window.location.href = '/login';
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
        
        <Link to="/admin" className="header-logo">
          <span className="logo-text">{t('admin.header.title')}</span>
        </Link>
      </div>

      <div className="header-right">
        {/* 语言切换 */}
        <LanguageSwitcher />

        {/* 通知 */}
          <button className="header-icon-btn" title={t('admin.header.notifications')}>
          🔔
          <span className="notification-badge">0</span>
        </button>

        {/* 用户菜单 */}
        <div className="user-menu">
          <button 
            className="user-menu-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span className="user-name">{user?.name || t('admin.header.admin')}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="menu-item">
                <span className="menu-icon">👤</span>
                {t('admin.header.profile')}
              </div>
              
              <div className="menu-divider" />
              
              <button 
                className="menu-item"
                onClick={handleLogout}
              >
                <span className="menu-icon">🚪</span>
                {t('admin.header.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

