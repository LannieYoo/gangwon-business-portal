/**
 * Support Page - Member Portal
 * 支持中心
 */

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';
import Textarea from '@shared/components/Textarea';
import Select from '@shared/components/Select';

export default function Support() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('inquiry');
  const [inquiries, setInquiries] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  useEffect(() => {
    setInquiries([
      {
        id: 1,
        subject: '项目申请相关问题',
        category: 'project',
        status: 'answered',
        createdAt: '2024-12-10',
        answeredAt: '2024-12-12'
      },
      {
        id: 2,
        subject: '绩效数据提交问题',
        category: 'performance',
        status: 'pending',
        createdAt: '2024-12-15'
      }
    ]);

    setFaqs([
      {
        id: 1,
        category: 'project',
        question: '如何申请项目？',
        answer: '登录后进入项目管理页面，选择想要申请的项目，点击"申请"按钮填写申请表即可。',
        views: 234
      },
      {
        id: 2,
        category: 'performance',
        question: '绩效数据什么时候提交？',
        answer: '季度绩效数据应在每季度结束后30天内提交，年度绩效数据应在每年结束后60天内提交。',
        views: 156
      },
      {
        id: 3,
        category: 'account',
        question: '如何修改企业信息？',
        answer: '进入"企业资料"页面，点击"编辑"按钮即可修改企业信息。注意：营业执照号码不可修改。',
        views: 189
      }
    ]);

    setNotifications([
      {
        id: 1,
        type: 'approval',
        title: '您的项目申请已批准',
        content: '2025年度创业支持项目申请已通过审核。',
        read: false,
        createdAt: '2024-12-20'
      },
      {
        id: 2,
        type: 'supplement',
        title: '绩效数据需要补充',
        content: '2024年第四季度绩效数据需要补充证明文件。',
        read: false,
        createdAt: '2024-12-18'
      },
      {
        id: 3,
        type: 'notice',
        title: '系统维护通知',
        content: '系统将于2024年12月25日进行维护，预计2小时。',
        read: true,
        createdAt: '2024-12-15'
      }
    ]);
  }, []);

  const [inquiryForm, setInquiryForm] = useState({
    category: '',
    subject: '',
    content: '',
    attachments: []
  });

  const handleInquiryChange = (field, value) => {
    setInquiryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitInquiry = async () => {
    try {
      // TODO: API 调用提交咨询
      console.log('Submitting inquiry:', inquiryForm);
      alert(t('message.submitSuccess'));
      setInquiryForm({
        category: '',
        subject: '',
        content: '',
        attachments: []
      });
    } catch (error) {
      console.error('Failed to submit:', error);
      alert(t('message.submitFailed'));
    }
  };

  const categoryOptions = [
    { value: '', label: t('support.selectCategory') },
    { value: 'project', label: t('support.categories.project') },
    { value: 'performance', label: t('support.categories.performance') },
    { value: 'account', label: t('support.categories.account') },
    { value: 'technical', label: t('support.categories.technical') },
    { value: 'other', label: t('support.categories.other') }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="support">
      <div className="page-header">
        <h1>{t('support.title')}</h1>
      </div>

      {/* 标签页 */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'inquiry' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiry')}
        >
          {t('support.inquiry')}
        </button>
        <button
          className={`tab ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          {t('support.faq')}
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          {t('support.notifications')}
          {unreadCount > 0 && <span className="badge badge-danger">{unreadCount}</span>}
        </button>
      </div>

      {/* 1:1 咨询 */}
      {activeTab === 'inquiry' && (
        <div className="tab-content">
          <div className="support-grid">
            {/* 咨询表单 */}
            <Card>
              <h2>{t('support.newInquiry')}</h2>
              <div className="form-section">
                <div className="form-group">
                  <label>{t('support.category')} *</label>
                  <Select
                    value={inquiryForm.category}
                    onChange={(e) => handleInquiryChange('category', e.target.value)}
                    options={categoryOptions}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('support.subject')} *</label>
                  <Input
                    value={inquiryForm.subject}
                    onChange={(e) => handleInquiryChange('subject', e.target.value)}
                    placeholder={t('support.subjectPlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('support.content')} *</label>
                  <Textarea
                    value={inquiryForm.content}
                    onChange={(e) => handleInquiryChange('content', e.target.value)}
                    rows={8}
                    placeholder={t('support.contentPlaceholder')}
                    required
                  />
                </div>

                <Button
                  onClick={handleSubmitInquiry}
                  variant="primary"
                  disabled={!inquiryForm.category || !inquiryForm.subject || !inquiryForm.content}
                >
                  {t('common.submit')}
                </Button>
              </div>
            </Card>

            {/* 咨询历史 */}
            <Card>
              <h2>{t('support.inquiryHistory')}</h2>
              {inquiries.length === 0 ? (
                <div className="no-data">
                  <p>{t('support.noInquiries')}</p>
                </div>
              ) : (
                <div className="inquiries-list">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="inquiry-item">
                      <div className="inquiry-header">
                        <h3>{inquiry.subject}</h3>
                        <span className={`badge ${inquiry.status === 'answered' ? 'badge-success' : 'badge-warning'}`}>
                          {t(`support.status.${inquiry.status}`)}
                        </span>
                      </div>
                      <div className="inquiry-meta">
                        <span>{t(`support.categories.${inquiry.category}`)}</span>
                        <span>{t('support.createdDate')}: {inquiry.createdAt}</span>
                        {inquiry.answeredAt && (
                          <span>{t('support.answeredDate')}: {inquiry.answeredAt}</span>
                        )}
                      </div>
                      <Link to={`/member/support/inquiry/${inquiry.id}`}>
                        <Button variant="secondary" size="small">
                          {t('common.details')}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="tab-content">
          <Card>
            <div className="faq-header">
              <h2>{t('support.faq')}</h2>
              <div className="search-box">
                <Input
                  type="search"
                  placeholder={t('support.searchFAQ')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="no-data">
                <p>{t('common.noData')}</p>
              </div>
            ) : (
              <div className="faq-list">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="faq-item">
                    <div className="faq-question">
                      <span className="faq-category">{t(`support.categories.${faq.category}`)}</span>
                      <h3>Q: {faq.question}</h3>
                    </div>
                    <div className="faq-answer">
                      <p>A: {faq.answer}</p>
                    </div>
                    <div className="faq-meta">
                      <span>👁 {faq.views} {t('support.views')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 通知中心 */}
      {activeTab === 'notifications' && (
        <div className="tab-content">
          <Card>
            <h2>{t('support.notifications')}</h2>
            {notifications.length === 0 ? (
              <div className="no-data">
                <p>{t('support.noNotifications')}</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      {notification.type === 'approval' && '✅'}
                      {notification.type === 'supplement' && '⚠️'}
                      {notification.type === 'notice' && '📢'}
                    </div>
                    <div className="notification-content">
                      <h3>{notification.title}</h3>
                      <p>{notification.content}</p>
                      <span className="notification-date">{notification.createdAt}</span>
                    </div>
                    {!notification.read && <div className="unread-dot" />}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

