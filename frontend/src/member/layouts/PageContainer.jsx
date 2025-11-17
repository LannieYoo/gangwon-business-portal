/**
 * PageContainer Component
 * 页面容器组件 - 统一控制页面的边距和最大宽度
 */

import './PageContainer.css';
import { cn } from '@shared/utils/helpers';

/**
 * PageContainer - 页面容器组件
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子元素
 * @param {string} props.className - 额外的CSS类名
 * @param {string} props.size - 容器大小 'default' | 'large' | 'small'
 * @param {boolean} props.fullWidth - 是否全宽度（不限制最大宽度）
 */
export function PageContainer({ 
  children, 
  className,
  size = 'default',
  fullWidth = false,
  ...props 
}) {
  return (
    <div
      className={cn(
        'page-container',
        size && `page-container-${size}`,
        fullWidth && 'page-container-full-width',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageContainer;

