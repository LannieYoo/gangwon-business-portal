/**
 * Member Portal Layout
 * 企业会员端主布局
 */

import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './MemberLayout.css';

export default function MemberLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`member-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="layout-body">
        <Sidebar collapsed={sidebarCollapsed} />
        
        <main className="main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

