/**
 * Banner Component - Generic
 * 通用横幅组件 - 简化版，以性能为主
 * 
 * 内部集成 useBanners hook，自动加载数据
 */

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { BANNER_TYPES } from "@shared/utils/constants";
import { useBanners } from "@shared/hooks/useBanners";

// 移动端断点宽度
const MOBILE_BREAKPOINT = 1024;

/**
 * Custom hook for detecting mobile screen width
 */
function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= breakpoint;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Generic Banner Component
 * 
 * @param {string} bannerType - 横幅类型（必需）
 * @param {string} className - 额外的类名
 * @param {string} sectionClassName - section 元素的类名
 * @param {number} autoSwitchInterval - 自动切换间隔（毫秒）
 * @param {string} height - 横幅高度
 * @param {boolean} fullWidth - 是否全宽（用于主 banner）
 */
export default function Banner({
  bannerType,
  className = "",
  sectionClassName = "",
  autoSwitchInterval = 5000,
  height = "400px",
  fullWidth = true,
}) {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  
  // 使用 useBanners hook 加载数据
  const { banners } = useBanners(bannerType);
  
  // 检测移动端
  const isMobile = useIsMobile();

  // 获取当前图片 URL
  const currentImageUrl = useMemo(() => {
    const bannerData = banners[currentBanner];
    if (!bannerData) return null;
    
    // 移动端优先使用移动端图片
    if (isMobile && bannerData.mobileImageUrl) {
      return bannerData.mobileImageUrl;
    }
    
    return bannerData.imageUrl;
  }, [banners, currentBanner, isMobile]);

  // 自动切换横幅
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, autoSwitchInterval);
    return () => clearInterval(timer);
  }, [banners.length, autoSwitchInterval]);

  // 点击横幅处理
  const handleBannerClick = useCallback(() => {
    const link = banners[currentBanner]?.link;
    if (!link) return;
    
    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank");
    } else {
      navigate(link.startsWith("/") ? link : `/${link}`);
    }
  }, [banners, currentBanner, navigate]);

  // 如果没有横幅类型，不显示
  if (!bannerType) {
    return null;
  }
  
  // 全宽样式
  const fullWidthClasses = fullWidth 
    ? "w-screen max-w-[100vw] -mt-[70px] max-md:-mt-[60px] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]" 
    : "w-full h-full";

  // 高度样式
  const heightClasses = fullWidth 
    ? "min-h-[400px] max-md:min-h-[300px] max-sm:min-h-[250px]" 
    : "h-full";

  const hasLink = !!banners[currentBanner]?.link;

  return (
    <section className={`relative overflow-hidden ${fullWidthClasses} ${sectionClassName} ${className}`}>
      {/* Banner 图层 */}
      <div
        className={`relative w-full ${heightClasses} bg-cover bg-center bg-no-repeat ${
          hasLink ? "cursor-pointer hover:opacity-90" : ""
        }`}
        style={{
          backgroundImage: currentImageUrl ? `url(${currentImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: fullWidth ? height : '100%',
        }}
        onClick={hasLink ? handleBannerClick : undefined}
        role="img"
        aria-label={banners[currentBanner]?.title || "Banner"}
      />

      {/* 指示器 */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`p-0 border-none cursor-pointer transition-all duration-300 ${
                index === currentBanner 
                  ? "w-6 h-2.5 bg-white rounded" 
                  : "w-2.5 h-2.5 bg-white/50 rounded-full hover:bg-white/70"
              }`}
              onClick={() => setCurrentBanner(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Export the useIsMobile hook for use in other components
export { useIsMobile };
