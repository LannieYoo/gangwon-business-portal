/**
 * Projects Page Container - Member Portal
 * 项目页面容器组件
 */

import { Routes, Route } from 'react-router-dom';
import ProjectList from './ProjectList';
import ProjectDetail from './ProjectDetail';

export default function Projects() {
  return (
    <Routes>
      <Route index element={<ProjectList />} />
      <Route path=":id" element={<ProjectDetail />} />
    </Routes>
  );
}
