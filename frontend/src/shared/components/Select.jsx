/**
 * Select Component
 */

import { forwardRef } from 'react';
import { cn } from '@shared/utils/helpers';

export const Select = forwardRef(function Select({
  label,
  error,
  help,
  required,
  options = [],
  placeholder = '선택하세요',
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
      <select
        ref={ref}
        className={cn(
          'input',
          error && 'input-error',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="form-error">{error}</p>
      )}
      {help && !error && (
        <p className="form-help">{help}</p>
      )}
    </div>
  );
});

