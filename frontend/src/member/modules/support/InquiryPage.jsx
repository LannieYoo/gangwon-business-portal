/**
 * Inquiry Page - Member Portal
 * 1:1 문의 작성 페이지
 */

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Banner, Submenu } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import { PageContainer } from '@member/layouts';
import ConsultationForm from './ConsultationForm';
import './InquiryPage.css';
import './Support.css';

export default function InquiryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmitSuccess = () => {
    // 提交成功后跳转到咨询历史页面
    navigate('/member/support/inquiry-history');
  };

  return (
    <div className="support inquiry-page">
      <Banner
        bannerType={BANNER_TYPES.SUPPORT}
        sectionClassName="member-banner-section"
      />
      <Submenu
        items={[
          {
            key: 'support-faq',
            path: '/member/support/faq',
            exact: true,
            label: t('support.faq')
          },
          {
            key: 'support-inquiry',
            path: '/member/support/inquiry',
            exact: true,
            label: t('support.inquiry')
          },
          {
            key: 'support-inquiry-history',
            path: '/member/support/inquiry-history',
            exact: true,
            label: t('support.inquiryHistory')
          }
        ]}
        className="support-submenu"
        headerSelector=".member-header"
      />
      <PageContainer>
        <div className="tab-content">
          <ConsultationForm onSubmitSuccess={handleSubmitSuccess} />
        </div>
      </PageContainer>
    </div>
  );
}

