/**
 * Sidebar Component - Admin Portal
 * 管理员端侧边导航
 */

import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ collapsed }) {
  const { t } = useTranslation();

  const menuItems = [
    {
      key: 'dashboard',
      path: '/admin',
      icon: '📊',
      label: t('admin.menu.dashboard'),
      exact: true
    },
    {
      key: 'members',
      path: '/admin/members',
      icon: '🏢',
      label: t('admin.menu.members')
    },
    {
      key: 'performance',
      path: '/admin/performance',
      icon: '📈',
      label: t('admin.menu.performance')
    },
    {
      key: 'projects',
      path: '/admin/projects',
      icon: '📋',
      label: t('admin.menu.projects')
    },
    {
      key: 'content',
      path: '/admin/content',
      icon: '📝',
      label: t('admin.menu.content')
    },
    {
      key: 'settings',
      path: '/admin/settings',
      icon: '⚙️',
      label: t('admin.menu.settings')
    },
    {
      key: 'reports',
      path: '/admin/reports',
      icon: '📑',
      label: t('admin.menu.reports')
    }
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
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

