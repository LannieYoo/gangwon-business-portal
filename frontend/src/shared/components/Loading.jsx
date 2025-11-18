/**
 * Loading Component
 */

import { cn } from '@shared/utils/helpers';
import './Loading.css';

export function Loading({ size = 'md', text = '로딩 중...', className }) {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg'
  };
  
  return (
    <div className={cn('loading-container', className)}>
      <div className={cn('spinner', sizeClasses[size])} />
      {text && (
        <p className="loading-text">{text}</p>
      )}
    </div>
  );
}

export function LoadingOverlay({ text = '처리 중...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <Loading text={text} />
      </div>
    </div>
  );
}

