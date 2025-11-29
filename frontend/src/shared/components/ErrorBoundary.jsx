/**
 * Error Boundary Component
 * Catches React component errors and displays a fallback UI
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { Alert } from './Alert';
import { RefreshIcon, HomeIcon } from './Icons';
import './ErrorBoundary.css';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Log error to error reporting service (e.g., Sentry) in production
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          fallback={this.props.fallback}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback UI Component
 */
function ErrorFallback({ error, errorInfo, onReset, onReload, onGoHome, fallback }) {
  const { t } = useTranslation();
  
  // If custom fallback is provided, use it
  if (fallback) {
    return fallback(error, errorInfo, onReset);
  }

  // Default fallback UI
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <div className="error-boundary">
      <div className="error-boundary-container">
        <div className="error-boundary-content">
          <div className="error-boundary-icon">
            <svg 
              className="error-boundary-icon-svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          
          <h1 className="error-boundary-title">
            {t('error.boundary.title', '发生错误')}
          </h1>
          
          <p className="error-boundary-message">
            {t('error.boundary.message', '抱歉，应用程序遇到了意外错误。请尝试刷新页面或返回首页。')}
          </p>

          {isDevelopment && error && (
            <div className="error-boundary-details">
              <Alert variant="error" className="error-boundary-alert">
                <details className="error-boundary-details-content">
                  <summary className="error-boundary-details-summary">
                    {t('error.boundary.details', '错误详情（开发模式）')}
                  </summary>
                  <div className="error-boundary-details-text">
                    <pre className="error-boundary-stack">
                      {error.toString()}
                      {errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              </Alert>
            </div>
          )}

          <div className="error-boundary-actions">
            <Button
              variant="primary"
              onClick={onReload}
              icon={<RefreshIcon />}
            >
              {t('error.boundary.reload', '刷新页面')}
            </Button>
            
            <Button
              variant="secondary"
              onClick={onGoHome}
              icon={<HomeIcon />}
            >
              {t('error.boundary.home', '返回首页')}
            </Button>
            
            {onReset && (
              <Button
                variant="outline"
                onClick={onReset}
              >
                {t('error.boundary.retry', '重试')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook-based Error Boundary Wrapper
 * For functional components that need error boundaries
 */
export function ErrorBoundary({ children, fallback, ...props }) {
  return (
    <ErrorBoundaryClass fallback={fallback} {...props}>
      {children}
    </ErrorBoundaryClass>
  );
}

export default ErrorBoundary;

