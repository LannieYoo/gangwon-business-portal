/**
 * Consultation Form Component - Member Portal
 * 1:1咨询表单组件（姓名、邮箱、手机号、咨询标题、咨询内容、附件最多3个）
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@shared/components/Card';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';
import Textarea from '@shared/components/Textarea';
import { PaperclipIcon, XIcon, DocumentIcon } from '@shared/components/Icons';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import './Support.css';

export default function ConsultationForm({ onSubmitSuccess }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    content: '',
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - formData.attachments.length);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.content) {
      alert(t('support.fillAllFields', '请填写所有必填字段'));
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('subject', formData.subject);
      submitData.append('content', formData.content);
      
      formData.attachments.forEach((file) => {
        submitData.append('attachments', file);
      });

      await apiService.post(`${API_PREFIX}/member/consultations`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(t('message.submitSuccess', '提交成功'));
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        content: '',
        attachments: []
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Failed to submit consultation:', error);
      alert(t('message.submitFailed', '提交失败'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h2>{t('support.newInquiry', '新建咨询')}</h2>
      <form onSubmit={handleSubmit} className="consultation-form">
        <div className="form-group">
          <label>{t('support.name', '姓名')} *</label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t('support.namePlaceholder', '请输入姓名')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.email', '邮箱')} *</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder={t('support.emailPlaceholder', '请输入邮箱')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.phone', '手机号')} *</label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder={t('support.phonePlaceholder', '请输入手机号')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.subject', '咨询标题')} *</label>
          <Input
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            placeholder={t('support.subjectPlaceholder', '请输入咨询标题')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.content', '咨询内容')} *</label>
          <Textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={8}
            placeholder={t('support.contentPlaceholder', '请输入咨询内容')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.attachments', '附件')} (最多3个)</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="consultation-files"
              multiple
              onChange={handleFileUpload}
              disabled={formData.attachments.length >= 3}
              style={{ display: 'none' }}
            />
            <Button
              type="button"
              onClick={() => document.getElementById('consultation-files').click()}
              variant="secondary"
              disabled={formData.attachments.length >= 3}
            >
              <PaperclipIcon className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
              {t('common.upload', '上传')}
            </Button>
            <small className="form-hint">
              {t('support.maxFiles', '最多可上传3个文件')} ({formData.attachments.length}/3)
            </small>
          </div>

          {formData.attachments.length > 0 && (
            <div className="uploaded-files">
              {formData.attachments.map((file, index) => (
                <div key={index} className="file-item">
                  <DocumentIcon className="w-4 h-4" />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <Button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    variant="text"
                    size="small"
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !formData.name || !formData.email || !formData.phone || !formData.subject || !formData.content}
        >
          {isSubmitting ? t('common.submitting', '提交中...') : t('common.submit', '提交')}
        </Button>
      </form>
    </Card>
  );
}

