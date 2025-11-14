/**
 * Admin Portal Routes
 * 管理员端路由配置
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import { Loading } from '@shared/components';

// Lazy load modules for code splitting
const Dashboard = lazy(() => import('./modules/dashboard'));
const MemberList = lazy(() => import('./modules/members/MemberList'));
const MemberDetail = lazy(() => import('./modules/members/MemberDetail'));
const PerformanceList = lazy(() => import('./modules/performance/PerformanceList'));
const ProjectList = lazy(() => import('./modules/projects/ProjectList'));
const ContentManagement = lazy(() => import('./modules/content/ContentManagement'));
const Settings = lazy(() => import('./modules/settings'));
const Reports = lazy(() => import('./modules/reports'));

// Wrapper component for lazy-loaded routes with Suspense
function LazyRoute({ children }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* 仪表盘 */}
        <Route 
          index 
          element={
            <LazyRoute>
              <Dashboard />
            </LazyRoute>
          } 
        />
        
        {/* 企业会员管理 */}
        <Route 
          path="members" 
          element={
            <LazyRoute>
              <MemberList />
            </LazyRoute>
          } 
        />
        <Route 
          path="members/:id" 
          element={
            <LazyRoute>
              <MemberDetail />
            </LazyRoute>
          } 
        />
        
        {/* 业绩管理 */}
        <Route 
          path="performance" 
          element={
            <LazyRoute>
              <PerformanceList />
            </LazyRoute>
          } 
        />
        
        {/* 项目管理 */}
        <Route 
          path="projects" 
          element={
            <LazyRoute>
              <ProjectList />
            </LazyRoute>
          } 
        />
        
        {/* 内容管理 */}
        <Route 
          path="content" 
          element={
            <LazyRoute>
              <ContentManagement />
            </LazyRoute>
          } 
        />
        
        {/* 系统设置 */}
        <Route 
          path="settings" 
          element={
            <LazyRoute>
              <Settings />
            </LazyRoute>
          } 
        />
        
        {/* 统计报表 */}
        <Route 
          path="reports" 
          element={
            <LazyRoute>
              <Reports />
            </LazyRoute>
          } 
        />
        
        {/* 默认重定向到仪表盘 */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

