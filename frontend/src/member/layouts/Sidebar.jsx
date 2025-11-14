/**
 * Sidebar Component - Member Portal
 * 会员端侧边导航
 */

import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ collapsed }) {
  const { t } = useTranslation();

  const menuItems = [
    {
      key: 'home',
      path: '/member',
      icon: '🏠',
      label: t('menu.home'),
      exact: true
    },
    {
      key: 'projects',
      path: '/member/projects',
      icon: '📋',
      label: t('menu.projects')
    },
    {
      key: 'performance',
      path: '/member/performance',
      icon: '📊',
      label: t('menu.performance')
    },
    {
      key: 'profile',
      path: '/member/profile',
      icon: '🏢',
      label: t('menu.profile')
    },
    {
      key: 'support',
      path: '/member/support',
      icon: '💬',
      label: t('menu.support')
    },
    {
      key: 'about',
      path: '/member/about',
      icon: 'ℹ️',
      label: t('menu.about')
    }
  ];

  return (
    <aside className={`member-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.key} className="nav-item">
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

