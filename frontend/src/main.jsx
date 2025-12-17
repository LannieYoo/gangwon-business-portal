/**
 * Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@shared/styles/index.css';

// 禁用 React DevTools 提示和 react-quill 的 findDOMNode 警告
if (typeof window !== 'undefined') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    
    // 忽略 React DevTools 提示
    if (message && typeof message === 'string' && message.includes('Download the React DevTools')) {
      return;
    }
    
    // 忽略 react-quill 的 findDOMNode 弃用警告
    if (message && typeof message === 'string' && message.includes('findDOMNode is deprecated')) {
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };
}

// Enable MSW in development (disabled by default - use real backend API)
async function enableMocking() {
  // MSW is disabled by default. Set VITE_USE_MOCK=true in .env to enable
  if (import.meta.env.VITE_USE_MOCK === 'true' && import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    
    return worker.start({
      onUnhandledRequest(request, print) {
        // Only intercept API requests, ignore route requests
        if (request.url.includes('/api/')) {
          print.warning();
        }
        // Silently ignore non-API requests (routes, static assets, etc.)
      },
      serviceWorker: {
        url: '/mockServiceWorker.js'
      },
      quiet: false // Enable logging to see if MSW is working
    }).catch((error) => {
      console.error('[MSW] Failed to start Mock Service Worker:', error);
    });
  }
  
  // MSW disabled - using real backend API
  return Promise.resolve();
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  );
});

