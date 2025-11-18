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
import './ConsultationForm.css';

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
      alert(t('support.fillAllFields'));
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

      alert(t('message.submitSuccess'));
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
      alert(t('message.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h2>{t('support.newInquiry')}</h2>
      <form onSubmit={handleSubmit} className="consultation-form">
        <div className="form-group">
          <label>{t('support.name')} *</label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t('support.namePlaceholder')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.email')} *</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder={t('support.emailPlaceholder')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.phone')} *</label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder={t('support.phonePlaceholder')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.subjectLabel')} *</label>
          <Input
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            placeholder={t('support.subjectPlaceholder')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.contentLabel')} *</label>
          <Textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={8}
            placeholder={t('support.contentPlaceholder')}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('support.attachments')} ({t('support.maxFilesLabel')})</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="consultation-files"
              multiple
              onChange={handleFileUpload}
              disabled={formData.attachments.length >= 3}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => document.getElementById('consultation-files').click()}
              variant="secondary"
              disabled={formData.attachments.length >= 3}
            >
              <PaperclipIcon className="consultation-icon-attach" />
              {t('common.upload')}
            </Button>
            <small className="form-hint">
              {t('support.maxFiles')} ({formData.attachments.length}/3)
            </small>
          </div>

          {formData.attachments.length > 0 && (
            <div className="uploaded-files">
              {formData.attachments.map((file, index) => (
                <div key={index} className="file-item group">
                  <DocumentIcon className="consultation-icon-document" />
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
                    <XIcon className="consultation-icon-close" />
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
          {isSubmitting ? t('common.submitting') : t('common.submit')}
        </Button>
      </form>
    </Card>
  );
}

