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
    if (typeof window !== "undefined") {
      return window.innerWidth <= breakpoint;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

function getOverlayClass(overlayStrength = "medium") {
  if (overlayStrength === "soft") {
    return "bg-gradient-to-r from-black/35 via-black/15 to-transparent";
  }
  if (overlayStrength === "strong") {
    return "bg-gradient-to-r from-black/70 via-black/45 to-transparent";
  }
  return "bg-gradient-to-r from-black/55 via-black/25 to-transparent";
}

function getTextClasses(textTheme = "light") {
  if (textTheme === "dark") {
    return {
      wrapper: "text-gray-900",
      title: "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]",
      subtitle: "text-gray-800/90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.25)]",
    };
  }

  return {
    wrapper: "text-white",
    title: "text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]",
    subtitle: "text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]",
  };
}

function getTextPositionClasses(textPosition = "left") {
  if (textPosition === "center") {
    return {
      container: "justify-center",
      text: "mx-auto w-full max-w-5xl text-center",
    };
  }

  if (textPosition === "right") {
    return {
      container: "justify-end",
      text: "ml-auto w-full max-w-5xl text-right",
    };
  }

  return {
    container: "justify-start",
    text: "w-full max-w-5xl text-left",
  };
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

  const currentBannerData = banners[currentBanner] || null;

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
    const normalizedLink = link.trim();

    if (
      normalizedLink.startsWith("http://") ||
      normalizedLink.startsWith("https://")
    ) {
      window.open(normalizedLink, "_blank");
      return;
    }

    if (/^www\./i.test(normalizedLink)) {
      window.open(`https://${normalizedLink}`, "_blank");
      return;
    }

    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(normalizedLink)) {
      window.open(`https://${normalizedLink}`, "_blank");
      return;
    }

    if (normalizedLink.startsWith("/")) {
      navigate(normalizedLink);
    } else {
      navigate(`/${normalizedLink}`);
    }
  }, [banners, currentBanner, navigate]);

  // 如果没有横幅类型，不显示
  if (!bannerType) {
    return null;
  }

  // 全宽样式
  const fullWidthClasses = fullWidth
    ? "w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]"
    : "w-full h-full";

  const sectionStyle = height ? { height } : undefined;

  const hasLink = !!currentBannerData?.link;
  const hasText = !!(currentBannerData?.title || currentBannerData?.subtitle);
  const textClasses = getTextClasses(currentBannerData?.textTheme);
  const overlayClass = getOverlayClass(currentBannerData?.overlayStrength);
  const textPositionClasses = getTextPositionClasses(currentBannerData?.textPosition);

  return (
    <section
      className={`relative overflow-hidden ${fullWidthClasses} ${sectionClassName} ${className}`}
      style={sectionStyle}
    >
      {/* Banner 图层 (Banner layer) */}
      {currentImageUrl ? (
        <div
          className={`relative h-full ${hasLink ? "cursor-pointer" : ""}`}
          onClick={hasLink ? handleBannerClick : undefined}
        >
          <img
            src={currentImageUrl}
            alt={currentBannerData?.title || "Banner"}
            className={`block h-full w-full transition-opacity object-cover ${hasLink ? "hover:opacity-90" : ""}`}
          />
          {hasText && (
            <div className={`absolute inset-0 ${overlayClass}`}>
              <div className={`mx-auto flex h-full w-full max-w-7xl items-center px-6 sm:px-10 lg:px-16 ${textPositionClasses.container}`}>
                <div className={`${textClasses.wrapper} ${textPositionClasses.text}`}>
                  {currentBannerData?.title && (
                    <h2 className={`m-0 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${textClasses.title}`}>
                      {currentBannerData.title}
                    </h2>
                  )}
                  {currentBannerData?.subtitle && (
                    <p className={`mt-3 mb-0 text-sm leading-6 sm:text-base lg:text-lg ${textClasses.subtitle}`}>
                      {currentBannerData.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="h-full w-full bg-gray-100"
          role="img"
          aria-label="Banner"
        />
      )}

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
