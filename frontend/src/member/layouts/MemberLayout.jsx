/**
 * Member Portal Layout
 * 会员端布局组件
 *
 * 参考 dev-frontend_patterns skill 构建
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
        pt-[70px] 配合 desktop header 高度 
        max-md:pt-[60px] 配合 mobile header 高度
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
