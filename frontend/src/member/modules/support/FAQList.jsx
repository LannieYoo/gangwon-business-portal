/**
 * FAQ List Component - Member Portal
 * FAQ列表组件（问题标题列表，点击展开答案的折叠结构）
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@shared/components/Card';
import { EyeIcon, ChevronDownIcon, ChevronUpIcon } from '@shared/components/Icons';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import './Support.css';

export default function FAQList() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    const loadFAQs = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`${API_PREFIX}/content/faqs`);
        if (response.records) {
          setFaqs(response.records);
        }
      } catch (error) {
        console.error('Failed to load FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFAQs();
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <div className="faq-header">
        <h2>{t('support.faq', '常见问题')}</h2>
      </div>

      {loading ? (
        <div className="loading">
          <p>{t('common.loading', '加载中...')}</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="no-data">
          <p>{t('common.noData', '暂无数据')}</p>
        </div>
      ) : (
        <div className="faq-list">
          {faqs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);
            return (
              <div key={faq.id} className={`faq-item ${isExpanded ? 'expanded' : ''}`}>
                <div 
                  className="faq-question"
                  onClick={() => toggleExpand(faq.id)}
                >
                  <h3>Q: {faq.question || faq.title}</h3>
                  <button className="faq-toggle">
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {isExpanded && (
                  <div className="faq-answer">
                    <p>A: {faq.answer || faq.content}</p>
                    {faq.views !== undefined && (
                      <div className="faq-meta" style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        <span>
                          <EyeIcon className="w-4 h-4" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                          {faq.views} {t('support.views', '次浏览')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

