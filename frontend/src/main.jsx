/**
 * Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@shared/styles/index.css';

// Import global exception handler
import { globalExceptionHandler } from '@shared/exception';

// Import interceptors
import {
  installComponentInterceptor,
  installHookInterceptor,
  installAuthInterceptor,
  installPerformanceInterceptor,
  installRouterInterceptor
} from '@shared/interceptors';

// Import router for interceptor
import { router } from './router';

// 禁用 React DevTools 提示和 react-quill 的 findDOMNode 警告
if (typeof window !== 'undefined') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    if (message && typeof message === 'string') {
      if (message.includes('Download the React DevTools') ||
          message.includes('findDOMNode is deprecated')) {
        return;
      }
    }
    originalConsoleWarn.apply(console, args);
  };
}

// Initialize global exception handler
function initializeExceptionHandler() {
  try {
    globalExceptionHandler.updateConfig({
      enableConsoleLogging: false,
      enableDebugMode: false,
      sampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      maxErrorsPerSession: import.meta.env.PROD ? 50 : 100
    });
    globalExceptionHandler.install();
  } catch (error) {
    console.error('[Exception Handler] Failed to initialize:', error);
  }
}

// Initialize AOP interceptors
function initializeInterceptors() {
  const isDev = import.meta.env.DEV;
  const installed = [];

  // Router interceptor (always enabled)
  installRouterInterceptor(router) && installed.push('router');

  // Component interceptor (dev only)
  if (isDev && import.meta.env.VITE_ENABLE_COMPONENT_LOGGING !== 'false') {
    installComponentInterceptor() && installed.push('component');
  }

  // Hook interceptor (dev only)
  if (isDev && import.meta.env.VITE_ENABLE_HOOK_LOGGING !== 'false') {
    installHookInterceptor() && installed.push('hook');
  }

  // Store 日志通过 storeLogger 中间件自动记录，无需手动安装

  // Auth interceptor
  if (import.meta.env.VITE_ENABLE_AUTH_LOGGING !== 'false') {
    installAuthInterceptor() && installed.push('auth');
  }

  // Performance interceptor
  if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false') {
    installPerformanceInterceptor({
      reportInterval: isDev ? 30000 : 300000,
      memoryWarningThreshold: 200 * 1024 * 1024
    }) && installed.push('performance');
  }

  return installed;
}

// Enable MSW in development
async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK === 'true' && import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest(request, print) {
        if (request.url.includes('/api/')) {
          print.warning();
        }
      },
      serviceWorker: { url: '/mockServiceWorker.js' },
      quiet: false
    }).catch(console.error);
  }
  return Promise.resolve();
}

// Initialize application
async function initializeApp() {
  try {
    // Initialize interceptors
    initializeInterceptors();

    // Initialize exception handler
    initializeExceptionHandler();

    // Enable mocking if needed
    await enableMocking();

    // Render application
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);

  } catch (error) {
    console.error('[App] Failed to initialize:', error);
    globalExceptionHandler?.reportException(error, { phase: 'initialization', critical: true });

    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; text-align: center; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
        <h2>应用初始化失败</h2>
        <p>请刷新页面重试。</p>
        <p style="font-size: 12px; color: #666;">${error.message}</p>
      </div>
    `;
  }
}

initializeApp();
