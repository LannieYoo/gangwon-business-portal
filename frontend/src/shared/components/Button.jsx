/**
 * Button Component
 */

import { cn } from '@shared/utils/helpers';
import './Button.css';

const variantStyles = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
  outline: 'btn-outline'
};

const sizeStyles = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg'
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        'btn',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner" />
      )}
      {children}
    </button>
  );
}

export default Button;

