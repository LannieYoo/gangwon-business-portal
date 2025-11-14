/**
 * Register Page - Member Portal
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@shared/hooks';
import { Button, Input, Alert, LanguageSwitcher } from '@shared/components';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    companyName: '',
    representativeName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate password match
    if (formData.password !== formData.passwordConfirm) {
      setError(t('validation.passwordMismatch'));
      return;
    }
    
    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다');
    }
  };
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Alert variant="success">
            {t('auth.registerSuccess')}
            <p className="mt-2">로그인 페이지로 이동합니다...</p>
          </Alert>
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
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {t('common.register')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          창업기업 회원가입
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            <Input
              label={t('member.companyName')}
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
            
            <Input
              label={t('member.representativeName')}
              name="representativeName"
              value={formData.representativeName}
              onChange={handleChange}
              required
            />
            
            <Input
              label={t('auth.email')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            
            <Input
              label={t('member.phone')}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            
            <Input
              label={t('auth.password')}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              help="최소 8자 이상"
            />
            
            <Input
              label={t('auth.passwordConfirm')}
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              {t('common.register')}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-gray-600">{t('auth.hasAccount')} </span>
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                {t('common.login')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

