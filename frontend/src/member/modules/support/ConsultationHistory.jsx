/**
 * Consultation History Component - Member Portal
 * 咨询历史记录组件（标题、注册日期、处理状态、详情查看）
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Card from '@shared/components/Card';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import './Support.css';

export default function ConsultationHistory() {
  const { t } = useTranslation();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInquiries = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`${API_PREFIX}/member/consultations`);
        if (response.records) {
          setInquiries(response.records);
        }
      } catch (error) {
        console.error('Failed to load inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, []);

  return (
    <Card>
      <h2>{t('support.inquiryHistory', '咨询历史')}</h2>
      {loading ? (
        <div className="loading">
          <p>{t('common.loading', '加载中...')}</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="no-data">
          <p>{t('support.noInquiries', '暂无咨询记录')}</p>
        </div>
      ) : (
        <div className="inquiries-list">
          {inquiries.map((inquiry) => (
            <Link 
              key={inquiry.id} 
              to={`/member/support/consultation/${inquiry.id}`} 
              className="ac-card inquiry-item"
            >
              <div 
                className="ac-card-img" 
                style={{ 
                  backgroundImage: `url('/uploads/banners/support.png')` 
                }}
              />
              <div className="ac-card-body">
                <div className="inquiry-header">
                  <h2>{inquiry.subject || inquiry.title}</h2>
                  <span className={`badge ${inquiry.status === 'answered' ? 'badge-success' : 'badge-warning'}`}>
                    {t(`support.status.${inquiry.status}`, inquiry.status === 'answered' ? '已回复' : '待处理')}
                  </span>
                </div>
                <div className="inquiry-meta" style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <span>{t('support.createdDate', '注册日期')}: {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : ''}</span>
                  {inquiry.answeredAt && (
                    <span>{t('support.answeredDate', '回复日期')}: {new Date(inquiry.answeredAt).toLocaleDateString()}</span>
                  )}
                </div>
                <span className="ac-btn bg-light-grey arrow">{t('common.details', '查看详情')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

