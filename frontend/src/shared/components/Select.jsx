/**
 * Select Component
 */

import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/utils/helpers';
import './Select.css';

export const Select = forwardRef(function Select({
  label,
  error,
  help,
  required,
  options = [],
  placeholder,
  inline = false,
  className,
  ...props
}, ref) {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder !== null ? (placeholder || t('common.pleaseSelect')) : null;
  const selectElement = (
    <>
      <select
        ref={ref}
        className={cn(
          'input',
          inline && 'input-inline',
          error && 'input-error',
          className
        )}
        {...props}
      >
        {defaultPlaceholder !== null && <option value="">{defaultPlaceholder}</option>}
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
    </>
  );

  if (inline) {
    return selectElement;
  }

  return (
    <div className="form-group">
      {label && (
        <label className={cn('form-label', required && 'form-label-required')}>
          {label}
        </label>
      )}
      {selectElement}
    </div>
  );
});

export default Select;

