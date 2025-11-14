/**
 * Tabs Component
 * 标签页组件
 */

import { cn } from '@shared/utils/helpers';
import './Tabs.css';

export function Tabs({ tabs, activeTab, onChange, className, ...props }) {
  return (
    <div className={cn('tabs', className)} {...props}>
      <div className="tabs-list">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={cn('tab-item', activeTab === tab.key && 'active')}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

