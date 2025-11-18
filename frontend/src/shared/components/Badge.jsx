/**
 * Badge Component
 */

import { cn } from '@shared/utils/helpers';
import './Badge.css';

const variantStyles = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  gray: 'badge-gray'
};

export function Badge({ children, variant = 'primary', className, ...props }) {
  return (
    <span
      className={cn(
        'badge',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

