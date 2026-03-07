/**
 * System Information Management Component - Admin Portal
 * 系统介绍管理组件
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Card, 
  TiptapEditor,
  Modal,
  Alert
} from '@shared/components';
import { contentService } from '@shared/services';

export default function SystemInfoManagement() {
  const { t } = useTranslation();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState('success');
  const [formData, setFormData] = useState({
    content: ''
  });

  // 获取系统介绍信息
  const fetchSystemInfo = async () => {
    setLoading(true);
    const response = await contentService.getSystemInfo();
    const data = response || {};
    
    setFormData({
      content: data.contentHtml || ''
    });
    setLoading(false);
  };

  // 初始加载
  useEffect(() => {
    fetchSystemInfo();
  }, []);

  // 处理字段变化
  const handleFieldChange = (field) => (event) => {
    const value = event?.target?.value !== undefined ? event.target.value : event;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理表单提交
  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      setMessageVariant('error');
      setMessage(t('admin.content.systemInfo.messages.contentRequired', '상세 내용을 입력하세요'));
      return;
    }

    setSaving(true);
    setMessage(null);
    
    const submitData = {
      contentHtml: formData.content
    };
    
    await contentService.updateSystemInfo(submitData);
    
    // 重新获取数据
    await fetchSystemInfo();
    setMessageVariant('success');
    setMessage(t('admin.content.systemInfo.messages.saved', '저장되었습니다'));
    setTimeout(() => setMessage(null), 3000);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">
          {t('common.loading', '로딩 중...')}
        </div>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <Alert variant={messageVariant} className="mb-4">
          {message}
        </Alert>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 m-0 mb-1">
          {t('admin.content.systemInfo.title', '시스템 소개 관리')}
        </h2>
        <p className="text-gray-600 text-sm m-0">
          {t('admin.content.systemInfo.description', '시스템 소개 페이지의 내용을 관리합니다.')}
        </p>
      </div>

      <Card>
        <div className="p-6">
          <TiptapEditor
            value={formData.content}
            onChange={handleFieldChange('content')}
            placeholder={t('admin.content.systemInfo.contentPlaceholder', '시스템 소개의 상세 내용을 입력하세요...')}
            height={500}
            required
            error={!formData.content.trim() ? t('error.validation.contentRequired', '상세 내용은 필수 입력 항목입니다') : ''}
          />
        </div>
      </Card>

      {/* 操作按钮 */}
      <div className="mt-6 flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={() => setShowPreview(true)}
        >
          {t('common.preview', '미리보기')}
        </Button>
        <Button 
          variant="primary"
          onClick={handleSubmit} 
          loading={saving}
          disabled={!formData.content.trim()}
        >
          {t('common.save', '저장')}
        </Button>
      </div>

      {/* 预览模态框 */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={t('common.preview', '미리보기')}
        size="lg"
      >
        <div className="space-y-6">
          {/* 预览内容 */}
          {formData.content ? (
            <div className="prose max-w-none">
              <div
                className="rich-text-preview"
                dangerouslySetInnerHTML={{ __html: formData.content }}
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#374151',
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">
                {t('admin.content.systemInfo.noContent', '미리볼 내용이 없습니다')}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="primary" onClick={() => setShowPreview(false)}>
              {t('common.close', '닫기')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



