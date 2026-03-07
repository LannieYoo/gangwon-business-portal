/**
 * Banner Management Component
 * 横幅管理组件 - 支持桌面端和移动端图片上传
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Input, Alert } from '@shared/components';
import { apiService } from '@shared/services';
import { API_PREFIX } from '@shared/utils/constants';

export default function BannerManagement() {
  const { t } = useTranslation();
  const textThemeOptions = [
    { value: 'light', label: t('admin.content.banners.form.fields.textThemeOptions.light') },
    { value: 'dark', label: t('admin.content.banners.form.fields.textThemeOptions.dark') },
  ];
  const overlayStrengthOptions = [
    { value: 'soft', label: t('admin.content.banners.form.fields.overlayStrengthOptions.soft') },
    { value: 'medium', label: t('admin.content.banners.form.fields.overlayStrengthOptions.medium') },
    { value: 'strong', label: t('admin.content.banners.form.fields.overlayStrengthOptions.strong') },
  ];
  const textPositionOptions = [
    { value: 'left', label: t('admin.content.banners.form.fields.textPositionOptions.left') },
    { value: 'center', label: t('admin.content.banners.form.fields.textPositionOptions.center') },
    { value: 'right', label: t('admin.content.banners.form.fields.textPositionOptions.right') },
  ];
  
  // Quick banner management state (by key)
  const [quickBanners, setQuickBanners] = useState({
    mainPrimary: { image: null, mobileImage: null, file: null, mobileFile: null, url: '', titleKo: '', subtitleKo: '', textTheme: 'light', overlayStrength: 'medium', textPosition: 'left' },
    mainSecondary: { image: null, mobileImage: null, file: null, mobileFile: null, url: '', titleKo: '', subtitleKo: '', textTheme: 'light', overlayStrength: 'medium', textPosition: 'left' },
    about: { image: null, mobileImage: null, file: null, mobileFile: null, url: '', titleKo: '', subtitleKo: '', textTheme: 'light', overlayStrength: 'medium', textPosition: 'left' },
    projects: { image: null, mobileImage: null, file: null, mobileFile: null, url: '', titleKo: '', subtitleKo: '', textTheme: 'light', overlayStrength: 'medium', textPosition: 'left' },
    performance: { image: null, mobileImage: null, file: null, mobileFile: null, url: '', titleKo: '', subtitleKo: '', textTheme: 'light', overlayStrength: 'medium', textPosition: 'left' },
    support: { image: null, mobileImage: null, file: null, mobileFile: null, url: '', titleKo: '', subtitleKo: '', textTheme: 'light', overlayStrength: 'medium', textPosition: 'left' }
  });
  const [loadingQuick, setLoadingQuick] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageVariant, setMessageVariant] = useState('success');
  const fileInputRefs = useRef({});
  const mobileFileInputRefs = useRef({});

  // Quick banner management functions
  const loadQuickBanners = useCallback(async () => {
    setLoadingQuick(true);
    const response = await apiService.get(`${API_PREFIX}/admin/banners`);
    if (response && response.banners) {
      const bannerKeys = ['mainPrimary', 'mainSecondary', 'about', 'projects', 'performance', 'support'];
      const normalizedBanners = {};
      bannerKeys.forEach(key => {
        const banner = response.banners[key] || {};
        normalizedBanners[key] = {
          image: banner.image || null,
          mobileImage: banner.mobileImage || banner.mobile_image || null,
          file: null,
          mobileFile: null,
          url: banner.url || '',
          titleKo: banner.titleKo || '',
          subtitleKo: banner.subtitleKo || '',
          textTheme: banner.textTheme || 'light',
          overlayStrength: banner.overlayStrength || 'medium',
          textPosition: banner.textPosition || 'left',
        };
      });
      setQuickBanners(normalizedBanners);
    }
    setLoadingQuick(false);
  }, []);

  useEffect(() => {
    loadQuickBanners();
  }, [loadQuickBanners]);

  const handleQuickBannerImageChange = (bannerKey, file, isMobile = false) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuickBanners(prev => ({
          ...prev,
          [bannerKey]: {
            ...prev[bannerKey],
            ...(isMobile 
              ? { mobileImage: e.target.result, mobileFile: file }
              : { image: e.target.result, file: file }
            )
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickBannerUrlChange = (bannerKey, url) => {
    setQuickBanners(prev => ({
      ...prev,
      [bannerKey]: {
        ...prev[bannerKey],
        url
      }
    }));
  };

  const handleQuickBannerTitleChange = (bannerKey, titleKo) => {
    setQuickBanners(prev => ({
      ...prev,
      [bannerKey]: {
        ...prev[bannerKey],
        titleKo
      }
    }));
  };

  const handleQuickBannerSubtitleChange = (bannerKey, subtitleKo) => {
    setQuickBanners(prev => ({
      ...prev,
      [bannerKey]: {
        ...prev[bannerKey],
        subtitleKo
      }
    }));
  };

  const handleQuickBannerStyleChange = (bannerKey, field, value) => {
    setQuickBanners(prev => ({
      ...prev,
      [bannerKey]: {
        ...prev[bannerKey],
        [field]: value
      }
    }));
  };

  const handleQuickBannerSave = async (bannerKey) => {
    setLoadingQuick(true);
    const formData = new FormData();
    const banner = quickBanners[bannerKey];
    
    if (banner.file) {
      formData.append('image', banner.file);
    }
    if (banner.mobileFile) {
      formData.append('mobile_image', banner.mobileFile);
    }
    formData.append('url', banner.url || '');
    formData.append('title_ko', banner.titleKo || '');
    formData.append('subtitle_ko', banner.subtitleKo || '');
    formData.append('text_theme', banner.textTheme || 'light');
    formData.append('overlay_strength', banner.overlayStrength || 'medium');
    formData.append('text_position', banner.textPosition || 'left');
    
    // Convert camelCase to snake_case for API endpoint
    const apiKey =
      bannerKey === 'mainPrimary'
        ? 'main_primary'
        : bannerKey === 'mainSecondary'
          ? 'main_secondary'
          : bannerKey;
    
    const response = await apiService.post(
      `${API_PREFIX}/admin/banners/${apiKey}`,
      formData
    );
    
    if (response && response.banner) {
      setQuickBanners(prev => ({
        ...prev,
        [bannerKey]: {
          ...prev[bannerKey],
          image: response.banner.image !== null && response.banner.image !== undefined 
            ? response.banner.image 
            : prev[bannerKey].image,
          mobileImage: (response.banner.mobileImage !== null && response.banner.mobileImage !== undefined)
            ? response.banner.mobileImage
            : (response.banner.mobile_image !== null && response.banner.mobile_image !== undefined)
              ? response.banner.mobile_image
            : prev[bannerKey].mobileImage,
          file: null,
          mobileFile: null,
          url: response.banner.url !== undefined ? response.banner.url : prev[bannerKey].url,
          titleKo: response.banner.titleKo !== undefined ? response.banner.titleKo : prev[bannerKey].titleKo,
          subtitleKo: response.banner.subtitleKo !== undefined ? response.banner.subtitleKo : prev[bannerKey].subtitleKo,
          textTheme: response.banner.textTheme !== undefined ? response.banner.textTheme : prev[bannerKey].textTheme,
          overlayStrength: response.banner.overlayStrength !== undefined ? response.banner.overlayStrength : prev[bannerKey].overlayStrength,
          textPosition: response.banner.textPosition !== undefined ? response.banner.textPosition : prev[bannerKey].textPosition,
        }
      }));
    }
    setMessageVariant('success');
    setMessage(t('admin.content.banners.messages.saved', '저장되었습니다'));
    setTimeout(() => setMessage(null), 3000);
    setLoadingQuick(false);
  };

  return (
    <div>
      {message && (
        <Alert variant={messageVariant} className="mb-4">
          {message}
        </Alert>
      )}
      
      {loadingQuick ? (
        <div className="p-6 text-center text-gray-500">{t('common.loading', '로딩 중...')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'mainPrimary', label: t('admin.content.banners.types.mainBanner', '메인 배너') },
              { key: 'mainSecondary', label: t('admin.content.banners.types.mainSecondaryBanner', '메인 소형 배너') },
              { key: 'about', label: t('admin.content.banners.types.systemIntro', '시스템 소개') },
              { key: 'projects', label: t('admin.content.banners.types.projects', '지원사업') },
              { key: 'performance', label: t('admin.content.banners.types.performance', '성과') },
              { key: 'support', label: t('admin.content.banners.types.support', '지원') }
            ].map(({ key, label }) => (
              <Card key={key} className="w-full min-w-0 flex flex-col p-6 md:p-4">
                <h3 className="text-lg font-semibold text-gray-800 m-0 mb-6 md:text-base md:mb-4">{label}</h3>
                
                <div className="flex flex-col gap-4 md:gap-3">
                  {/* Desktop Image Upload */}
                  <div className="flex flex-col gap-3">
                    <label className="text-sm text-gray-600 font-medium">
                      {t('admin.content.banners.form.fields.desktopImage', '데스크톱 이미지')}
                    </label>
                    <p className="text-xs text-gray-400 m-0">
                      {t('admin.content.banners.form.fields.desktopImageHint', '권장: 1920 x 600 (16:5), 최소: 1440 x 450')}
                    </p>
                    <div className="flex flex-col gap-3">
                      {quickBanners[key].image && (
                        <img 
                          src={quickBanners[key].image} 
                          alt={`${label} - Desktop`}
                          className="max-w-full max-h-[100px] object-contain rounded border border-gray-200"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => (fileInputRefs.current[key] = el)}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleQuickBannerImageChange(key, e.target.files[0], false);
                          }
                        }}
                        className="hidden"
                        id={`banner-${key}-file`}
                      />
                      <Button 
                        variant="outline" 
                        type="button" 
                        className="w-full text-sm py-2"
                        onClick={() => {
                          fileInputRefs.current[key]?.click();
                        }}
                      >
                        {t('admin.content.banners.actions.uploadDesktop', '데스크톱 이미지 업로드')}
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Image Upload */}
                  <div className="flex flex-col gap-3 mt-2">
                    <label className="text-sm text-gray-600 font-medium">
                      {t('admin.content.banners.form.fields.mobileImage', '모바일 이미지')}
                    </label>
                    <p className="text-xs text-gray-400 m-0">
                      {t('admin.content.banners.form.fields.mobileImageHint', '권장: 1080 x 1350 (4:5), 최소: 750 x 938')}
                    </p>
                    <div className="flex flex-col gap-3">
                      {quickBanners[key].mobileImage && (
                        <img 
                          src={quickBanners[key].mobileImage} 
                          alt={`${label} - Mobile`}
                          className="max-w-full max-h-[100px] object-contain rounded border border-gray-200"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => (mobileFileInputRefs.current[key] = el)}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleQuickBannerImageChange(key, e.target.files[0], true);
                          }
                        }}
                        className="hidden"
                        id={`banner-${key}-mobile-file`}
                      />
                      <Button 
                        variant="outline" 
                        type="button" 
                        className="w-full text-sm py-2"
                        onClick={() => {
                          mobileFileInputRefs.current[key]?.click();
                        }}
                      >
                        {t('admin.content.banners.actions.uploadMobile', '모바일 이미지 업로드')}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm text-gray-600 font-medium">{t('admin.content.banners.form.fields.url', '링크 URL')}</label>
                      <Input
                        type="text"
                        value={quickBanners[key].url}
                        onChange={(e) => handleQuickBannerUrlChange(key, e.target.value)}
                        placeholder={t('admin.content.banners.form.fields.urlPlaceholder', 'https://example.com')}
                        className="w-full py-3 px-3 border border-gray-300 rounded text-sm font-inherit focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col gap-3">
                        <label className="text-sm text-gray-600 font-medium">
                          {t('admin.content.banners.form.fields.titleKo', '주제목')}
                        </label>
                        <Input
                          type="text"
                          value={quickBanners[key].titleKo}
                          onChange={(e) => handleQuickBannerTitleChange(key, e.target.value)}
                          placeholder={t('admin.content.banners.form.fields.titleKoPlaceholder', '배너 주제목을 입력하세요')}
                          className="w-full py-3 px-3 border border-gray-300 rounded text-sm font-inherit focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-sm text-gray-600 font-medium">
                          {t('admin.content.banners.form.fields.subtitleKo', '부제목')}
                        </label>
                        <Input
                          type="text"
                          value={quickBanners[key].subtitleKo}
                          onChange={(e) => handleQuickBannerSubtitleChange(key, e.target.value)}
                          placeholder={t('admin.content.banners.form.fields.subtitleKoPlaceholder', '배너 부제목을 입력하세요')}
                          className="w-full py-3 px-3 border border-gray-300 rounded text-sm font-inherit focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <div className="flex flex-col gap-3">
                        <label className="text-sm text-gray-600 font-medium">
                          {t('admin.content.banners.form.fields.textTheme')}
                        </label>
                        <select
                          value={quickBanners[key].textTheme}
                          onChange={(e) => handleQuickBannerStyleChange(key, 'textTheme', e.target.value)}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        >
                          {textThemeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-sm text-gray-600 font-medium">
                          {t('admin.content.banners.form.fields.overlayStrength')}
                        </label>
                        <select
                          value={quickBanners[key].overlayStrength}
                          onChange={(e) => handleQuickBannerStyleChange(key, 'overlayStrength', e.target.value)}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        >
                          {overlayStrengthOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-sm text-gray-600 font-medium">
                          {t('admin.content.banners.form.fields.textPosition')}
                        </label>
                        <select
                          value={quickBanners[key].textPosition}
                          onChange={(e) => handleQuickBannerStyleChange(key, 'textPosition', e.target.value)}
                          className="w-full rounded border border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        >
                          {textPositionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-3">
                    <Button 
                      onClick={() => handleQuickBannerSave(key)} 
                      className="w-full text-sm py-2"
                      loading={loadingQuick}
                    >
                      {t('admin.content.banners.actions.save', '저장')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}




