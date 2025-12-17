/**
 * Message Analytics Component - Admin Portal
 * 消息统计分析 - 显示消息相关的统计数据
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Select } from '@shared/components';
import { LineChart, BarChart } from '@shared/components/Charts';
import { messageService } from '@shared/services';

export default function MessageAnalytics() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    responseTime: 0,
    messagesByDay: [],
    messagesByCategory: [],
    responseTimeByDay: []
  });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await messageService.getAnalytics({ timeRange });
      console.log('Analytics response:', response); // Debug log
      
      // Handle both camelCase and snake_case responses
      setAnalytics({
        totalMessages: response.totalMessages ?? response.total_messages ?? 0,
        unreadMessages: response.unreadMessages ?? response.unread_messages ?? 0,
        responseTime: response.responseTime ?? response.response_time ?? 0,
        messagesByDay: response.messagesByDay ?? response.messages_by_day ?? [],
        messagesByCategory: response.messagesByCategory ?? response.messages_by_category ?? [],
        responseTimeByDay: response.responseTimeByDay ?? response.response_time_by_day ?? []
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError(error.message || t('admin.messages.analytics.loadFailed', '加载统计数据失败'));
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const timeRangeOptions = [
    { value: '7d', label: t('admin.messages.analytics.last7Days', '最近7天') },
    { value: '30d', label: t('admin.messages.analytics.last30Days', '最近30天') },
    { value: '90d', label: t('admin.messages.analytics.last90Days', '最近90天') },
    { value: 'all', label: t('admin.messages.analytics.allTime', '全部时间') }
  ];

  const formatResponseTime = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} ${t('admin.messages.analytics.minutes', '分钟')}`;
    }
    const hours = Math.round(minutes / 60);
    return `${hours} ${t('admin.messages.analytics.hours', '小时')}`;
  };

  return (
    <div className="w-full space-y-6">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 m-0 mb-1">
              {t('admin.messages.analytics.title', '消息统计')}
            </h2>
            <p className="text-gray-600 text-sm m-0">
              {t('admin.messages.analytics.description', '查看消息相关的统计数据和趋势分析。')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={timeRangeOptions}
              className="w-40"
              inline={true}
              placeholder={null}
            />
            <Button
              variant="outline"
              onClick={loadAnalytics}
              loading={loading}
            >
              {t('common.refresh', '刷新')}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('admin.messages.analytics.totalMessages', '总消息数')}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.totalMessages}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('admin.messages.analytics.unreadMessages', '未读消息')}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.unreadMessages}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('admin.messages.analytics.avgResponseTime', '平均响应时间')}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatResponseTime(analytics.responseTime)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('admin.messages.analytics.responseRate', '响应率')}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.totalMessages > 0 
                  ? Math.round(((analytics.totalMessages - analytics.unreadMessages) / analytics.totalMessages) * 100)
                  : 0
                }%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('admin.messages.analytics.messagesTrend', '消息趋势')}
          </h3>
          <LineChart
            categories={analytics.messagesByDay?.map(item => item.date) || []}
            series={[{
              name: t('admin.messages.analytics.messageCount', '消息数量'),
              data: analytics.messagesByDay?.map(item => item.count) || [],
              color: '#3b82f6'
            }]}
            height="300px"
            loading={loading}
            smooth={true}
            area={true}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('admin.messages.analytics.messagesByCategory', '消息分类统计')}
          </h3>
          <BarChart
            categories={analytics.messagesByCategory?.map(item => {
              const categoryMap = {
                'general': t('admin.messages.analytics.categoryGeneral', '一般'),
                'support': t('admin.messages.analytics.categorySupport', '支持'),
                'performance': t('admin.messages.analytics.categoryPerformance', '绩效'),
                'project': t('admin.messages.analytics.categoryProject', '项目')
              };
              return categoryMap[item.category] || item.category;
            }) || []}
            series={[{
              name: t('admin.messages.analytics.messageCount', '消息数量'),
              data: analytics.messagesByCategory?.map(item => item.count) || [],
              color: '#10b981'
            }]}
            height="300px"
            loading={loading}
          />
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('admin.messages.analytics.responseTimeTrend', '响应时间趋势')}
        </h3>
        <LineChart
          categories={analytics.responseTimeByDay?.map(item => item.date) || []}
          series={[{
            name: t('admin.messages.analytics.responseTime', '响应时间'),
            data: analytics.responseTimeByDay?.map(item => item.responseTime) || [],
            color: '#8b5cf6'
          }]}
          height="300px"
          loading={loading}
          smooth={true}
          area={true}
          yAxis={{
            axisLabel: {
              formatter: (value) => `${value} ${t('admin.messages.analytics.minutes', '分钟')}`
            }
          }}
        />
      </Card>
    </div>
  );
}