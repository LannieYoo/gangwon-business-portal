/*
 * TagButton - 标签按钮组件
 * 用于多选筛选条件的可视化展示
 */

export const TagButton = ({ value, selected = false, onClick, children, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      className={`
        inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium
        transition-all duration-200 ease-in-out
        ${selected
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      `}
    >
      {children}
    </button>
  );
};

/*
 * TagGroup - 标签按钮组容器
 */
export const TagGroup = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {children}
    </div>
  );
};
