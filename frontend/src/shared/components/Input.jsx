/**
 * Input Component
 */

import { forwardRef } from 'react';
import { cn } from '@shared/utils/helpers';
import './Input.css';

export const Input = forwardRef(function Input({
  label,
  error,
  help,
  required,
  className,
  ...props
}, ref) {
  return (
    <div className="form-group">
      {label && (
        <label className={cn('form-label', required && 'form-label-required')}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'input',
          error && 'input-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="form-error">{error}</p>
      )}
      {help && !error && (
        <p className="form-help">{help}</p>
      )}
    </div>
  );
});

export default Input;

