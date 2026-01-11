/**
 * News Management Component
 * 新闻管理组件
 */

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Alert, Card, Modal, ModalFooter } from '@shared/components';
import { contentService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';
import { validateImageFile, formatDate } from '@shared/utils';
import { validateNewsForm } from './utils';
import { useUpload } from '@shared/hooks';

export default function NewsManagement() {
  const { t, i18n } = useTranslation();
  
  // State
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(createEmptyForm());
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState('success');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, newsId: null });

  // 使用统一的上传 hook
  const { uploading: imageUploading, upload } = useUpload();

  // Load news
  const loadNews = useCallback(async (pageNum = 1) => {
    setLoading(true);
    const response = await contentService.listPressReleases({ page: pageNum, pageSize: 20 });
    setNews(response.items || []);
    setTotal(response.total || 0);
    setPage(pageNum);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    loadNews(1);
  }, [loadNews]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMessageVariant('error');
      setMessage(validation.error || t('admin.content.news.messages.invalidImageType', '请选择图片文件'));
      event.target.value = '';
      return;
    }

    setMessage(null);
    
    try {
      const response = await upload(file);
      
      if (response?.file_url) {
        setForm((prev) => ({
          ...prev,
          imageUrl: response.file_url
        }));
        setMessageVariant('success');
        setMessage(t('admin.content.news.messages.imageUploaded', '图片上传成功'));
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessageVariant('error');
        setMessage(t('admin.content.news.messages.uploadFailed', '图片上传失败'));
      }
    } catch (error) {
      setMessageVariant('error');
      setMessage(error.message || t('admin.content.news.messages.uploadFailed', '图片上传失败'));
      setTimeout(() => setMessage(null), 3000);
    } finally {
      event.target.value = '';
    }
  };

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSelect = (newsItem) => {
    setForm({
      id: newsItem.id,
      title: newsItem.title,
      imageUrl: newsItem.imageUrl || ''
    });
    setErrors({});
    setMessage(null);
  };

  const handleNew = () => {
    setForm(createEmptyForm());
    setErrors({});
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateNewsForm(form, t);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setMessageVariant('error');
      setMessage(t('admin.content.news.messages.validationError', '请补全必填信息'));
      return;
    }
    
    setSaving(true);
    let savedNews;
    if (form.id) {
      savedNews = await contentService.updatePressRelease(form.id, form);
    } else {
      savedNews = await contentService.createPressRelease(form);
    }
    await loadNews(page);
    setForm(savedNews);
    setMessageVariant('success');
    setMessage(t('admin.content.news.messages.saved', '保存成功'));
    setTimeout(() => setMessage(null), 3000);
    setSaving(false);
  };

  const handleDelete = (newsId) => {
    if (!newsId) return;
    setDeleteConfirm({ open: true, newsId });
  };

  const confirmDelete = async () => {
    const { newsId } = deleteConfirm;
    if (!newsId) return;
    
    await contentService.deletePressRelease(newsId);
    await loadNews(page);
    if (form.id === newsId) {
      setForm(createEmptyForm());
    }
    setMessageVariant('success');
    setMessage(t('admin.content.news.messages.deleted', '删除成功'));
    setTimeout(() => setMessage(null), 3000);
    setDeleteConfirm({ open: false, newsId: null });
  };

  return (
    <div>
      {message && (
        <Alert variant={messageVariant} className="mb-4">
          {message}
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4 gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-gray-900">{t('admin.content.news.list.title', '新闻列表')}</h2>
              <p className="m-0 text-gray-500 text-sm">{t('admin.content.news.list.description', '管理新闻稿')}</p>
            </div>
            <Button type="button" variant="secondary" onClick={handleNew}>
              {t('admin.content.news.actions.new', '新建')}
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500">{t('common.loading', '加载中...')}</div>
          ) : news.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>{t('admin.content.news.list.empty', '暂无新闻')}</p>
            </div>
          ) : (
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {news.map((newsItem) => (
                <li
                  key={newsItem.id}
                  className={`flex justify-between items-center p-4 bg-white border rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                    form.id === newsItem.id 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/10' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleSelect(newsItem)}
                >
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-3 font-semibold text-gray-900 mb-1.5">
                      <span>{newsItem.title}</span>
                    </div>
                    <p className="m-0 text-gray-500 text-sm">
                      {newsItem.createdAt ? formatDate(newsItem.createdAt, 'yyyy-MM-dd', i18n.language) : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(newsItem.id);
                    }}
                  >
                    {t('common.delete', '删除')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="mt-0 mb-4 text-lg font-semibold text-gray-900">
            {form.id
              ? t('admin.content.news.form.editTitle', '编辑新闻')
              : t('admin.content.news.form.newTitle', '新建新闻')}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t('admin.content.news.form.fields.title', '标题')}
              value={form.title}
              onChange={handleFieldChange('title')}
              required
              error={errors.title}
            />
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {t('admin.content.news.form.fields.image', '上传图片')}
              </label>
              <p className="text-sm text-gray-500 m-0">
                {t('admin.content.news.form.fields.imageHint', '支持 JPG、PNG、GIF 格式，建议尺寸 800x600 像素')}
              </p>
              
              <div className="space-y-4">
                {form.imageUrl ? (
                  <div className="relative group">
                    <div className="w-full aspect-video overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                      <img
                        src={form.imageUrl}
                        alt="News preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, imageUrl: '' }));
                        setMessage(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 text-sm font-medium rounded-md shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {t('common.remove', '移除')}
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center aspect-video flex flex-col items-center justify-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      {t('admin.content.news.form.fields.noImage', '暂无图片')}
                    </p>
                  </div>
                )}
                
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          setMessageVariant('error');
                          setMessage(t('admin.content.news.messages.imageTooLarge', '图片大小不能超过5MB'));
                          setTimeout(() => setMessage(null), 3000);
                          e.target.value = '';
                          return;
                        }
                        handleImageUpload(e);
                      }
                    }}
                    disabled={imageUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
                  />
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
              >
                {form.id
                  ? t('admin.content.news.actions.update', '更新')
                  : t('admin.content.news.actions.create', '创建')}
              </Button>
            </div>
          </form>
          </div>
        </Card>
      </div>

      {/* 删除确认对话框 */}
      <Modal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, newsId: null })}
        title={t('admin.content.news.actions.confirmDelete', '确定要删除这条新闻吗？')}
        size="sm"
      >
        <div className="py-4">
          <p className="text-gray-600">
            {t('admin.content.news.actions.confirmDeleteMessage', '此操作不可撤销，确定要继续吗？')}
          </p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, newsId: null })}>
            {t('common.cancel', '取消')}
          </Button>
          <Button variant="primary" onClick={confirmDelete}>
            {t('common.delete', '删除')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function createEmptyForm() {
  return {
    id: null,
    title: '',
    imageUrl: ''
  };
}