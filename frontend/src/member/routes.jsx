/**
 * Member Portal Routes
 * 企业会员端路由配置
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MemberLayout from './layouts/MemberLayout';
import { Loading } from '@shared/components';

// Lazy load modules for code splitting
const Home = lazy(() => import('./modules/home/Home'));
const Projects = lazy(() => import('./modules/projects/ProjectList'));
const ProjectDetail = lazy(() => import('./modules/projects/ProjectDetail'));
const ProjectApplication = lazy(() => import('./modules/projects/ProjectApplication'));
const Profile = lazy(() => import('./modules/profile/Profile'));
const About = lazy(() => import('./modules/about/About'));
const PerformanceList = lazy(() => import('./modules/performance/PerformanceList'));
const PerformanceForm = lazy(() => import('./modules/performance/PerformanceForm'));
const PerformanceDetail = lazy(() => import('./modules/performance/PerformanceDetail'));
const Support = lazy(() => import('./modules/support/Support'));

// Wrapper component for lazy-loaded routes with Suspense
function LazyRoute({ children }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
}

export default function MemberRoutes() {
  return (
    <Routes>
      <Route element={<MemberLayout />}>
        {/* 首页 */}
        <Route 
          index 
          element={
            <LazyRoute>
              <Home />
            </LazyRoute>
          } 
        />
        <Route path="home" element={<Navigate to="/member" replace />} />
        
        {/* 项目相关 */}
        <Route 
          path="projects" 
          element={
            <LazyRoute>
              <Projects />
            </LazyRoute>
          } 
        />
        <Route 
          path="projects/:id" 
          element={
            <LazyRoute>
              <ProjectDetail />
            </LazyRoute>
          } 
        />
        <Route 
          path="projects/:id/apply" 
          element={
            <LazyRoute>
              <ProjectApplication />
            </LazyRoute>
          } 
        />
        
        {/* 绩效数据 */}
        <Route 
          path="performance" 
          element={
            <LazyRoute>
              <PerformanceList />
            </LazyRoute>
          } 
        />
        <Route 
          path="performance/new" 
          element={
            <LazyRoute>
              <PerformanceForm />
            </LazyRoute>
          } 
        />
        <Route 
          path="performance/:id" 
          element={
            <LazyRoute>
              <PerformanceDetail />
            </LazyRoute>
          } 
        />
        <Route 
          path="performance/:id/edit" 
          element={
            <LazyRoute>
              <PerformanceForm />
            </LazyRoute>
          } 
        />
        
        {/* 企业资料 */}
        <Route 
          path="profile" 
          element={
            <LazyRoute>
              <Profile />
            </LazyRoute>
          } 
        />
        
        {/* 支持中心 */}
        <Route 
          path="support" 
          element={
            <LazyRoute>
              <Support />
            </LazyRoute>
          } 
        />
        
        {/* 关于 */}
        <Route 
          path="about" 
          element={
            <LazyRoute>
              <About />
            </LazyRoute>
          } 
        />
        
        {/* 默认重定向到首页 */}
        <Route path="*" element={<Navigate to="/member" replace />} />
      </Route>
    </Routes>
  );
}

