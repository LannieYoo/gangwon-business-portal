/**
 * Forgot Password Page - Admin Portal
 * 管理员忘记密码页面
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, Alert, LanguageSwitcher } from '@shared/components';
import authService from '@shared/services/auth.service';

export default function AdminForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // 调用密码重置请求API
      await authService.forgotPassword({
        email: email,
        businessNumber: '' // 管理员不需要事业者登录号
      });
      setSuccess(true);
    } catch (err) {
      // 即使邮箱不存在，也显示成功消息（安全考虑）
      // 但如果是网络错误等，显示错误
      if (err.response?.status === 404 || err.response?.status === 400) {
        // 为了安全，不透露邮箱是否存在
        setSuccess(true);
      } else {
        setError(err.response?.data?.message || t('admin.auth.forgotPasswordError'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-8 px-6 sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t('admin.auth.forgotPasswordSentTitle')}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {t('admin.auth.forgotPasswordSentMessage')}
              </p>
              <Button
                onClick={() => navigate('/admin/login')}
                className="w-full"
              >
                {t('admin.auth.backToLogin')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('admin.auth.forgotPasswordTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('admin.auth.forgotPasswordSubtitle')}
          </p>
        </div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-8 px-6 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            <Input
              label={t('admin.auth.email')}
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder={t('admin.auth.emailPlaceholder')}
            />
            
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              {t('admin.auth.sendResetLink')}
            </Button>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            {t('admin.auth.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
