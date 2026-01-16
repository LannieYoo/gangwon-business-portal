/**
 * Forgot Password Page - Member Portal
 * 会员忘记密码页面
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, Alert, LanguageSwitcher } from '@shared/components';
import authService from '@shared/services/auth.service';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    businessNumber: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await authService.forgotPassword(formData);
      setSuccess(true);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.detail;
      if (message?.includes('do not match') || message?.includes('不匹配')) {
        setError(t('auth.businessEmailMismatch'));
      } else {
        setError(message || t('admin.auth.forgotPasswordError'));
      }
    } finally {
      setIsLoading(false);
    }
  }
  
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
                onClick={() => navigate('/member/home')}
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
              label={t('auth.businessLicense')}
              type="text"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleChange}
              required
              placeholder={t('auth.businessLicensePlaceholder')}
            />
            
            <Input
              label={t('auth.email')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
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
            onClick={() => navigate('/member/home')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            {t('admin.auth.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
