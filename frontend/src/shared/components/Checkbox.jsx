/**
 * Checkbox Component
 * 复选框组件
 */

import { forwardRef } from 'react';

const Checkbox = forwardRef(({ 
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  size = 'md',
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.checked, event);
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={`
            ${sizeClasses[size]}
            text-blue-600 
            border-gray-300 
            rounded 
            focus:ring-blue-500 
            focus:ring-2
            disabled:opacity-50 
            disabled:cursor-not-allowed
            cursor-pointer
          `}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label className={`
              text-sm font-medium text-gray-900 cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              {label}
            </label>
          )}
          {description && (
            <p className={`
              text-xs text-gray-500 mt-1
              ${disabled ? 'opacity-50' : ''}
            `}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;



