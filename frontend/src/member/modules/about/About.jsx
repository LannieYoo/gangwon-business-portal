/**
 * About Page - Member Portal
 * 系统介绍
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Banner } from '@shared/components';
import { BANNER_TYPES, API_PREFIX } from '@shared/utils/constants';
import { apiService, loggerService, exceptionService } from '@shared/services';
import { PageContainer } from '@member/layouts';
import './About.css';

export default function About() {
  const { t, i18n } = useTranslation();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        setLoading(true);
        // Use correct API endpoint: /api/system-info instead of /api/content/about
        const data = await apiService.get(`${API_PREFIX}/system-info`);
        
        if (data && data.content_html) {
          setHtmlContent(data.content_html);
        } else {
          setHtmlContent('');
        }
        setError(null);
      } catch (err) {
        // Extract error message properly
        const errorMessage = err.response?.data?.message || err.response?.data?.detail || err.message || (typeof err === 'string' ? err : JSON.stringify(err)) || t('about.fetchError');
        setError(errorMessage);
        
        loggerService.error('Error fetching about content', {
          module: 'About',
          function: 'fetchAboutContent',
          request_path: `${API_PREFIX}/system-info`,
          error_message: errorMessage,
          error_code: err.response?.data?.code || err.code
        });
        
        // Only record exception if it's not a 404 (404 is already recorded by API interceptor)
        // This avoids duplicate exception records
        const status = err.response?.status || err.status;
        if (status && status !== 404) {
          // Create proper Error object with meaningful message
          const errorObj = err instanceof Error 
            ? err 
            : new Error(errorMessage || 'Failed to fetch about content');
          
          // Ensure error object has proper message
          if (!errorObj.message || errorObj.message === '[object Object]') {
            errorObj.message = errorMessage;
          }
          
          // Record exception to backend (only for non-404 errors to avoid duplicates)
          exceptionService.recordException(errorObj, {
            request_method: 'GET',
            request_path: `${API_PREFIX}/system-info`,
            error_code: err.response?.data?.code || err.code || 'ABOUT_CONTENT_FETCH_ERROR',
            status_code: status,
            context_data: {
              component: 'About',
              action: 'fetchAboutContent',
            },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, [i18n.language, t]);

  return (
    <div className="about">
      <Banner
        bannerType={BANNER_TYPES.ABOUT}
        sectionClassName="member-banner-section"
      />
      <PageContainer>
        <div className="about-content">
          {loading && <div className="about-loading">{t('about.loading')}</div>}
          {error && <div className="about-error">{t('about.errorMessage', { message: error })}</div>}
          {!loading && !error && htmlContent && (
            <div 
              className="about-html-content-wrapper"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>
      </PageContainer>
    </div>
  );
}

