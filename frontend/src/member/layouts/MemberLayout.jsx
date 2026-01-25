/**
 * Member Portal Layout
 * 企业会员端主布局
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

/**
 * MemberLayout Component
 * @returns {JSX.Element}
 */
function MemberLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* 
        pt-[70px] 对应 desktop header 高度 
        max-md:pt-[60px] 对应 mobile header 高度
      */}
      <div className="flex flex-1 flex-col pt-[70px] max-md:pt-[60px]">
        <main className="flex-1 flex flex-col w-full bg-gray-50">
          <div className="flex-1 w-full flex flex-col">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default MemberLayout;
