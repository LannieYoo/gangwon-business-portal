/**
 * MSW Browser Setup
 * Used in development mode to mock API requests in the browser
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index.js';

// Setup MSW worker for browser environment
export const worker = setupWorker(...handlers);

// Note: Worker is started in main.jsx, not here
// This file only exports the worker instance

