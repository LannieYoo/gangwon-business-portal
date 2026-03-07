/**
 * useBanners Hook (Shared)
 * 管理横幅数据加载 - 可被所有模块使用
 * 
 * 遵循 dev-frontend_patterns skill 规范
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { contentService } from '@shared/services';

/**
 * 横幅数据管理 Hook
 * @param {string} bannerType - 横幅类型
 * @param {object} defaultBannerImages - 默认横幅图片映射
 * @returns {object} { banners, loading, error, reload }
 */
export function useBanners(bannerType, defaultBannerImages = {}) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(Boolean(bannerType));
  
  const [error, setError] = useState(null);
  const loadedImagesRef = useRef(new Set());
  const defaultBannerImagesRef = useRef(defaultBannerImages);

  /**
   * 预加载图片
   */
  const preloadImage = useCallback((imageUrl) => {
    return new Promise((resolve, reject) => {
      if (loadedImagesRef.current.has(imageUrl)) {
        resolve();
        return;
      }
      const img = new Image();
      img.onload = () => {
        loadedImagesRef.current.add(imageUrl);
        resolve();
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }, []);

  /**
   * 生成占位符图片
   */
  const generatePlaceholderImage = useCallback((width = 1920, height = 400) => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
      </svg>
    `.trim();
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }, []);

  /**
   * 加载横幅数据
   */
  const loadBanners = useCallback(async () => {
    if (!bannerType) {
      setBanners([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await contentService.getBanners({ bannerType });
      const bannersData = response.items || response || [];
      let newBanners = [];

      if (Array.isArray(bannersData) && bannersData.length > 0) {
        newBanners = bannersData.map((b) => ({
          id: b.id,
          imageUrl: b.imageUrl,
          mobileImageUrl: b.mobileImageUrl || null,
          link: b.linkUrl || null,
          title: b.titleKo || null,
          subtitle: b.subtitleKo || null,
          textTheme: b.textTheme === 'dark' ? 'dark' : 'light',
          overlayStrength: ['soft', 'medium', 'strong'].includes(b.overlayStrength) ? b.overlayStrength : 'medium',
          textPosition: ['left', 'center', 'right'].includes(b.textPosition) ? b.textPosition : 'left',
        }));
      } else {
        // 使用默认横幅
        newBanners = [{
          id: "default",
          imageUrl: defaultBannerImagesRef.current?.[bannerType] || generatePlaceholderImage(1920, 400),
          mobileImageUrl: null,
          link: null,
          title: null,
          subtitle: null,
          textTheme: 'light',
          overlayStrength: 'medium',
          textPosition: 'left',
        }];
      }

      // 预加载图片
      try {
        const imagesToPreload = newBanners.flatMap((banner) => {
          const images = [banner.imageUrl];
          if (banner.mobileImageUrl) {
            images.push(banner.mobileImageUrl);
          }
          return images;
        });
        await Promise.all(imagesToPreload.map((url) => preloadImage(url)));
      } catch (preloadError) {
        console.warn('[useBanners] Image preload failed:', preloadError);
      }

      setBanners(newBanners);
    } catch (err) {
      console.error('[useBanners] Failed to load banners:', err);
      setError(err);

      // 使用 fallback banner
      const fallbackBanner = [{
        id: "default",
        imageUrl: defaultBannerImagesRef.current?.[bannerType] || generatePlaceholderImage(1920, 400),
        mobileImageUrl: null,
        link: null,
        title: null,
        subtitle: null,
        textTheme: 'light',
        overlayStrength: 'medium',
        textPosition: 'left',
      }];

      try {
        await preloadImage(fallbackBanner[0].imageUrl);
      } catch (preloadError) {
        console.warn('[useBanners] Fallback image preload failed:', preloadError);
      }

      setBanners(fallbackBanner);
    } finally {
      setLoading(false);
    }
  }, [bannerType, preloadImage, generatePlaceholderImage]);

  /**
   * 重新加载横幅
   */
  const reload = useCallback(() => {
    loadBanners();
  }, [loadBanners]);

  // 加载横幅数据
  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  return {
    banners,
    loading,
    error,
    reload,
  };
}

export default useBanners;




