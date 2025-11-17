/**
 * Member Portal Layout
 * 企业会员端主布局
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './MemberLayout.css';

function MemberLayout() {
  return (
    <div className="member-layout">
      <Header />
      
      <div className="layout-body">
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

export default MemberLayout;

