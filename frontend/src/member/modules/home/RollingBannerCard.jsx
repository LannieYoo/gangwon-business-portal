/**
 * Rolling Banner Card Component - Member Portal
 * 滚动横幅卡片组件 - 支持自动播放、暂停、前后切换、指示器
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@shared/components/Icons';
import './RollingBannerCard.css';

/**
 * RollingBannerCard Component
 * @param {Array} items - 横幅项目数组，每个项目包含 { id, imageUrl, title, link }
 * @param {number} autoPlayInterval - 自动播放间隔（毫秒），默认 5000
 * @param {boolean} autoPlay - 是否自动播放，默认 true
 * @param {string} className - 额外的 CSS 类名
 */
export default function RollingBannerCard({
  items = [],
  autoPlayInterval = 5000,
  autoPlay = true,
  className = ''
}) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(!autoPlay);
  const intervalRef = useRef(null);

  // 自动播放逻辑
  useEffect(() => {
    if (items.length <= 1 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [items.length, isPaused, autoPlayInterval]);

  // 切换到上一张
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // 切换到下一张
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  // 切换到指定索引
  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  // 切换暂停/播放
  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <div className={`rolling-banner-card ${className}`}>
      <div className="rolling-banner-container">
        {/* 横幅图片 */}
        <div
          className="rolling-banner-image"
          style={{
            backgroundImage: `url(${currentItem.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {currentItem.title && (
            <div className="rolling-banner-overlay">
              <h3 className="rolling-banner-title">{currentItem.title}</h3>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        {items.length > 1 && (
          <>
            {/* 上一张按钮 */}
            <button
              className="rolling-banner-btn rolling-banner-btn-prev"
              onClick={goToPrevious}
              aria-label={t('common.previous', '上一张')}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            {/* 下一张按钮 */}
            <button
              className="rolling-banner-btn rolling-banner-btn-next"
              onClick={goToNext}
              aria-label={t('common.next', '下一张')}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>

            {/* 暂停/播放按钮 */}
            <button
              className="rolling-banner-btn rolling-banner-btn-pause"
              onClick={togglePause}
              aria-label={isPaused ? t('common.play', '播放') : t('common.pause', '暂停')}
            >
              {isPaused ? (
                <PlayIcon className="w-5 h-5" />
              ) : (
                <PauseIcon className="w-5 h-5" />
              )}
            </button>
          </>
        )}

        {/* 指示器 */}
        {items.length > 1 && (
          <div className="rolling-banner-indicators">
            {items.map((_, index) => (
              <button
                key={index}
                className={`rolling-banner-indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToIndex(index)}
                aria-label={`${t('common.goToSlide', '切换到第')} ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

