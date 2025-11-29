/**
 * Admin Portal Layout
 * 管理员端主布局
 */

import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './AdminLayout.css';

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <Header onToggleSidebar={toggleMobileMenu} />
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}
      
      <div className="layout-body">
        <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileMenuOpen} onClose={closeMobileMenu} />
        
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

