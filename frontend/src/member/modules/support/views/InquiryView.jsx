/**
 * 咨询提交视图
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useInquiry } from "../hooks/useInquiry";
import InquiryPage from "../components/InquiryPage/InquiryPage";
import { Banner } from "@shared/components";
import { BANNER_TYPES } from "@shared/utils/constants";
import SupportSubmenu from "../components/SupportSubmenu";
import { clearCache } from "@shared/hooks/useApiCache";

/**
 * 咨询提交视图组件
 */
export default function InquiryView() {
  const navigate = useNavigate();

  const handleSubmitSuccess = () => {
    // Clear inquiry history cache so the list refreshes immediately
    clearCache("inquiry-history-");
    clearCache("inquiry-history-open");
    clearCache("inquiry-history-resolved");
    clearCache("inquiry-history-closed");
    navigate("/member/support/inquiry-history");
  };

  const inquiryData = useInquiry({ onSubmitSuccess: handleSubmitSuccess });

  return (
    <div className="flex flex-col w-full">
      <Banner
        bannerType={BANNER_TYPES.SUPPORT}
        sectionClassName="member-banner-section"
      />
      <SupportSubmenu />
      <InquiryPage {...inquiryData} />
    </div>
  );
}
