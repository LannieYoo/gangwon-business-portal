/**
 * Textarea Component
 */

import { forwardRef } from 'react';
import { cn } from '@shared/utils/helpers';
import './Textarea.css';

export const Textarea = forwardRef(function Textarea({
  label,
  error,
  help,
  required,
  rows = 4,
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
      <textarea
        ref={ref}
        rows={rows}
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

export default Textarea;

