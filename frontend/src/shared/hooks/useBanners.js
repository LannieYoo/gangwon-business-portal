/**
 * useBanners Hook (Shared)
 * 管理横幅数据加载 - 可被所有模块使用
 * 
 * 遵循 dev-frontend_patterns skill 规范
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { contentService } from '@shared/services';

// Banner 数据缓存 - 在模块级别缓存，避免重复请求
const bannerCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 横幅数据管理 Hook
 * @param {string} bannerType - 横幅类型
 * @param {object} defaultBannerImages - 默认横幅图片映射
 * @returns {object} { banners, loading, error, reload }
 */
export function useBanners(bannerType, defaultBannerImages = {}) {
  const { i18n } = useTranslation();
  
  // 从缓存初始化 state，避免闪烁
  const [banners, setBanners] = useState(() => {
    if (!bannerType) return [];
    const cacheKey = `${bannerType}-${i18n.language}`;
    const cached = bannerCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.banners;
    }
    return [];
  });
  
  const [loading, setLoading] = useState(() => {
    if (!bannerType) return false;
    const cacheKey = `${bannerType}-${i18n.language}`;
    const cached = bannerCache.get(cacheKey);
    return !(cached && Date.now() - cached.timestamp < CACHE_DURATION);
  });
  
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
  const generatePlaceholderImage = useCallback((width = 1920, height = 400, text = "") => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
          ${text || "Banner Placeholder"}
        </text>
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

    // 检查缓存
    const cacheKey = `${bannerType}-${i18n.language}`;
    const cached = bannerCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setBanners(cached.banners);
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
          title: i18n.language === "zh" ? b.titleZh || b.titleKo : b.titleKo || b.titleZh,
          subtitle: i18n.language === "zh" ? b.subtitleZh || b.subtitleKo : b.subtitleKo || b.subtitleZh,
        }));
      } else {
        // 使用默认横幅
        newBanners = [{
          id: "default",
          imageUrl: defaultBannerImagesRef.current?.[bannerType] || generatePlaceholderImage(1920, 400, "Banner"),
          mobileImageUrl: null,
          link: null,
          title: null,
          subtitle: null,
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

      // 缓存数据
      bannerCache.set(cacheKey, { banners: newBanners, timestamp: Date.now() });
      setBanners(newBanners);
    } catch (err) {
      console.error('[useBanners] Failed to load banners:', err);
      setError(err);

      // 使用 fallback banner
      const fallbackBanner = [{
        id: "default",
        imageUrl: defaultBannerImagesRef.current?.[bannerType] || generatePlaceholderImage(1920, 400, "Banner"),
        mobileImageUrl: null,
        link: null,
        title: null,
        subtitle: null,
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
  }, [bannerType, i18n.language, preloadImage, generatePlaceholderImage]);

  /**
   * 重新加载横幅
   */
  const reload = useCallback(() => {
    // 清除缓存
    const cacheKey = `${bannerType}-${i18n.language}`;
    bannerCache.delete(cacheKey);
    loadBanners();
  }, [bannerType, i18n.language, loadBanners]);

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




