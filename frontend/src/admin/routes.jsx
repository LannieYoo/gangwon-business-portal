/**
 * Admin Portal Routes
 * 管理员端路由配置
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Placeholder layout for admin portal
function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>管理员端</h1>
      </header>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

// Placeholder components for admin modules
function Dashboard() {
  const { t } = useTranslation();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">仪表盘</h1>
      <p className="text-gray-600">管理员端开发中...</p>
    </div>
  );
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

