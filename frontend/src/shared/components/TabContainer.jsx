/**
 * TabContainer Component
 * 标签页容器组件 - 封装 Card + Tabs 的通用组合
 */

import { useState, useMemo } from 'react';
import { Card, Tabs } from '@shared/components';
import { cn } from '@shared/utils/helpers';

/**
 * TabContainer 组件
 * @param {Object} props
 * @param {Array} props.tabs - 标签页配置数组 [{ key: string, label: string, content: ReactNode }]
 * @param {string} props.defaultTab - 默认激活的标签页 key
 * @param {string} props.title - 页面标题（可选）
 * @param {ReactNode} props.headerActions - 标题右侧的操作按钮（可选）
 * @param {boolean} props.lazy - 是否懒加载标签页内容（默认 false）
 * @param {boolean} props.withCard - 是否使用 Card 包裹（默认 true）
 * @param {string} props.className - 容器额外的 CSS 类名
 * @param {string} props.cardClassName - Card 额外的 CSS 类名
 * @param {string} props.contentClassName - 内容区域额外的 CSS 类名
 * @param {Function} props.onTabChange - 标签页切换回调函数
 */
export function TabContainer({
  tabs = [],
  defaultTab,
  title,
  headerActions,
  lazy = false,
  withCard = true,
  className,
  cardClassName,
  contentClassName,
  onTabChange,
  ...props
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key);
  const [loadedTabs, setLoadedTabs] = useState(new Set([activeTab]));

  // 处理标签页切换
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (lazy) {
      setLoadedTabs(prev => new Set([...prev, tabKey]));
    }
    onTabChange?.(tabKey);
  };

  // 提取标签页配置（不包含 content）
  const tabConfigs = useMemo(() => 
    tabs.map(({ key, label }) => ({ key, label })),
    [tabs]
  );

  // 获取当前激活的标签页内容
  const activeContent = useMemo(() => {
    const activeTabConfig = tabs.find(tab => tab.key === activeTab);
    return activeTabConfig?.content;
  }, [tabs, activeTab]);

  // 渲染标签页内容
  const renderContent = () => {
    if (lazy) {
      // 懒加载模式：只渲染已加载过的标签页
      return tabs.map(tab => (
        <div
          key={tab.key}
          className={cn(
            activeTab === tab.key ? 'block' : 'hidden'
          )}
        >
          {loadedTabs.has(tab.key) && tab.content}
        </div>
      ));
    }
    // 非懒加载模式：只显示当前激活的标签页
    return activeContent;
  };

  // 标签页内容区域
  const tabsContent = (
    <>
      <Tabs
        tabs={tabConfigs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />
      {/* 使用与原内容管理相同的样式：mt-6 p-6 */}
      <div className={cn('mt-6 p-6', contentClassName)}>
        {renderContent()}
      </div>
    </>
  );

  return (
    <div className={cn('w-full', className)} {...props}>
      {/* 页面标题和操作按钮 */}
      {(title || headerActions) && (
        <div className="mb-6 flex items-center justify-between">
          {title && (
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 m-0">
              {title}
            </h1>
          )}
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* 标签页内容 - 可选是否使用 Card 包裹 */}
      {withCard ? (
        <Card className={cardClassName}>
          {tabsContent}
        </Card>
      ) : (
        tabsContent
      )}
    </div>
  );
}

export default TabContainer;




