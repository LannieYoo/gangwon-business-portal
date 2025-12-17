/**
 * Project Form Component - Admin Portal
 * 项目创建/编辑表单
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Input, Select, Textarea, Loading } from '@shared/components';
import { adminService } from '@shared/services';


// Helper to format date for form (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

export default function ProjectForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    target_company_name: '',
    target_business_number: '',
    startDate: '',
    endDate: '',
    status: 'active', // active, inactive
    content: '',
    // Files will be handled separately
    image: null,
    attachments: []
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadProject();
    }
  }, [id, isEditMode]);

  const loadProject = async () => {
    if (!id) return;
    setLoading(true);
    const data = await adminService.getProject(id);
    if (data) {
      setFormData({
          title: data.title || '',
          target_company_name: data.target_company_name || '',
          target_business_number: data.target_business_number || '',
          startDate: formatDateForInput(data.start_date || data.startDate),
          endDate: formatDateForInput(data.end_date || data.endDate),
          status: data.status || 'active',
          content: data.description || data.content || '',
          image: data.image_url || data.image || null,
          attachments: data.attachments || []
      });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (field, files) => {
      setFormData(prev => ({
          ...prev,
          [field]: files
      }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
        alert('请填写必填项：项目标题、开始日期、结束日期');
        return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('结束日期不能早于开始日期');
      return;
    }

    setSubmitting(true);
    
    const payload = {
      title: formData.title,
      description: formData.content,
      target_company_name: formData.target_company_name || null,
      target_business_number: formData.target_business_number || null,
      start_date: formData.startDate,
      end_date: formData.endDate,
      status: formData.status,
      image_url: null,
    };

    if (isEditMode) {
      await adminService.updateProject(id, payload);
    } else {
      await adminService.createProject(payload);
    }

    setSubmitting(false);
    navigate('/admin/projects');
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full max-w-4xl mx-auto">

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? '编辑项目' : '新建项目'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/admin/projects')}>
          {t('common.cancel')}
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <Input
            label="项目标题"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="请输入项目标题"
          />

          <Input
            label="目标企业名称（可选）"
            name="target_company_name"
            value={formData.target_company_name}
            onChange={handleChange}
            placeholder="例：三星电子株式会社（留空表示公开招募）"
          />

          <Input
            label="营业执照号（可选）"
            name="target_business_number"
            value={formData.target_business_number}
            onChange={handleChange}
            placeholder="例：123-45-67890"
            maxLength={12}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                开始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                结束日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

           <Select
              label="项目状态"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'active', label: '进行中' },
                { value: 'inactive', label: '已结束' },
                { value: 'archived', label: '已归档' }
              ]}
            />
            
            <Textarea
                label="项目详情"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                placeholder="请输入项目详细说明..."
            />

            {/* 文件上传功能暂时禁用 */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                    <strong>注意：</strong> 图片和附件上传功能正在开发中，暂时不可用。
                </p>
            </div>

          <div className="flex justify-end gap-4">
             <Button variant="outline" type="button" onClick={() => navigate('/admin/projects')}>
                取消
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
                {isEditMode ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
