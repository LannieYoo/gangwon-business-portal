/**
 * Inquiry History Page - Member Portal
 * 1:1 문의 내역 페이지
 */

import { useTranslation } from 'react-i18next';
import { Banner, Submenu } from '@shared/components';
import { BANNER_TYPES } from '@shared/utils/constants';
import { PageContainer } from '@member/layouts';
import ConsultationHistory from './ConsultationHistory';
import './InquiryHistoryPage.css';
import './Support.css';

export default function InquiryHistoryPage() {
  const { t } = useTranslation();

  return (
    <div className="support inquiry-history-page">
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
          <ConsultationHistory />
        </div>
      </PageContainer>
    </div>
  );
}

