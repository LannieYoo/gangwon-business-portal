/**
 * Error Boundary Component
 * 
 * React error boundary to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the whole app.
 */

import React from 'react';
import { cn } from '@shared/utils/helpers';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ error, errorInfo });

    // Call custom error callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset(this.state.error, this.state.errorInfo);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error, 
          this.state.errorInfo, 
          this.handleReset,
          {
            retryCount: this.state.retryCount,
            canRetry: this.state.retryCount < maxRetries,
          }
        );
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-gray-100">
          <div className="max-w-[700px] w-full bg-white rounded-lg p-12 shadow-lg text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">发生了一个错误</h1>
            <p className="text-gray-600 leading-relaxed mb-8">
              抱歉，应用程序遇到了意外错误。请尝试重试或刷新页面。
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left my-8 p-4 bg-gray-50 rounded border border-gray-200">
                <summary className="cursor-pointer font-medium text-gray-900 mb-2">错误详情（仅开发环境）</summary>
                <pre className="mt-4 p-4 bg-white border border-gray-200 rounded overflow-x-auto text-xs text-red-600 whitespace-pre-wrap break-all">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <button
                type="button"
                onClick={this.handleReset}
                disabled={this.state.retryCount >= maxRetries}
                className={cn(
                  "px-6 py-3 border-none rounded font-medium text-base cursor-pointer transition-all duration-200",
                  this.state.retryCount >= maxRetries
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {this.state.retryCount >= maxRetries ? '已达到最大重试次数' : 
                 this.state.retryCount > 0 ? `重试 (${this.state.retryCount}/${maxRetries})` : '重试'}
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-3 border border-gray-300 rounded font-medium text-base cursor-pointer transition-all duration-200 bg-gray-100 text-gray-900 hover:bg-gray-200"
              >
                重新加载页面
              </button>
            </div>
            
            {this.state.retryCount > 0 && (
              <p className="text-xs text-gray-400 mt-4">
                已重试 {this.state.retryCount} 次
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
