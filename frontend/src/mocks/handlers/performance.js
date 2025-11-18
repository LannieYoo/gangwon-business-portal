/**
 * MSW Handlers for Performance API
 */

import { http, HttpResponse } from 'msw';
import { API_PREFIX, API_BASE_URL } from '@shared/utils/constants';
import { delay, loadMockData, shouldSimulateError, getErrorStatus, getCurrentLanguage } from '../config.js';

// Base URL for performance API (use absolute paths - MSW best practice)
const BASE_URL = `${API_BASE_URL}${API_PREFIX}/performance`;
const ADMIN_BASE_URL = `${API_BASE_URL}${API_PREFIX}/admin/performance`;

// In-memory storage for performance records (simulates database)
let performanceData = null;
let currentDataLanguage = null; // Track the language of loaded data

// Initialize data on first load or when language changes
async function initializeData() {
  const currentLanguage = getCurrentLanguage();
  
  // Reload data if language has changed
  if (!performanceData || currentDataLanguage !== currentLanguage) {
    const data = await loadMockData('performance');
    performanceData = [...data.performanceRecords];
    currentDataLanguage = currentLanguage;
  }
}

// Get all performance records (admin)
async function getAllPerformanceRecords(req) {
  await delay();
  
  if (shouldSimulateError(ADMIN_BASE_URL)) {
    return HttpResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  await initializeData();
  
  // Parse query parameters
  const url = new URL(req.request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);
  const status = url.searchParams.get('status');
  const memberId = url.searchParams.get('memberId');
  const year = url.searchParams.get('year');
  const quarter = url.searchParams.get('quarter');
  
  let filteredRecords = [...performanceData];
  
  // Apply filters
  if (status && status !== 'all') {
    filteredRecords = filteredRecords.filter(r => r.status === status);
  }
  
  if (memberId) {
    filteredRecords = filteredRecords.filter(r => r.memberId === parseInt(memberId, 10));
  }
  
  if (year) {
    filteredRecords = filteredRecords.filter(r => r.year === parseInt(year, 10));
  }
  
  if (quarter) {
    if (quarter === 'annual') {
      filteredRecords = filteredRecords.filter(r => r.quarter === null);
    } else {
      filteredRecords = filteredRecords.filter(r => r.quarter === parseInt(quarter, 10));
    }
  }
  
  // Sort by createdAt descending (newest first)
  filteredRecords.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Pagination
  const total = filteredRecords.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedRecords = filteredRecords.slice(start, end);
  
  return HttpResponse.json({
    records: paginatedRecords,
    pagination: {
      page,
      pageSize,
      total,
      totalPages
    }
  });
}

// Get performance records for current member
async function getMemberPerformanceRecords(req) {
  await delay();
  
  if (shouldSimulateError(BASE_URL)) {
    return HttpResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  await initializeData();
  
  // Parse query parameters
  const url = new URL(req.request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('page_size') || '10', 10);
  const status = url.searchParams.get('status');
  const year = url.searchParams.get('year');
  const quarter = url.searchParams.get('quarter');
  
  const memberId = 1; // Mock: current user ID
  
  let filteredRecords = performanceData.filter(r => r.memberId === memberId);
  
  // Apply filters
  if (status && status !== 'all') {
    filteredRecords = filteredRecords.filter(r => r.status === status);
  }
  
  if (year) {
    filteredRecords = filteredRecords.filter(r => r.year === parseInt(year, 10));
  }
  
  if (quarter) {
    if (quarter === 'annual') {
      filteredRecords = filteredRecords.filter(r => r.quarter === null);
    } else {
      filteredRecords = filteredRecords.filter(r => r.quarter === parseInt(quarter, 10));
    }
  }
  
  // Sort by createdAt descending (newest first)
  filteredRecords.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Pagination
  const total = filteredRecords.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedRecords = filteredRecords.slice(start, end);
  
  return HttpResponse.json({
    records: paginatedRecords,
    pagination: {
      page,
      pageSize,
      total,
      totalPages
    }
  });
}

// Get performance record by ID
async function getPerformanceRecordById(req) {
  await delay();
  
  await initializeData();
  
  const { id } = req.params;
  const record = performanceData.find(r => r.id === parseInt(id, 10));
  
  if (!record) {
    return HttpResponse.json(
      { message: 'Performance record not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  return HttpResponse.json({ record });
}

// Create performance record (member)
async function createPerformanceRecord(req) {
  await delay(500);
  
  if (shouldSimulateError(BASE_URL)) {
    return HttpResponse.json(
      { message: 'Failed to create performance record', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  await initializeData();
  
  const body = await req.request.json();
  const memberId = 1; // Mock: current user ID
  
  // Generate new ID
  const newId = Math.max(...performanceData.map(r => r.id), 0) + 1;
  
  const now = new Date().toISOString();
  const newRecord = {
    id: newId,
    memberId,
    status: 'draft',
    ...body,
    submittedAt: null,
    reviewer: null,
    reviewedAt: null,
    reviewComment: null,
    createdAt: now,
    updatedAt: now
  };
  
  performanceData.push(newRecord);
  
  return HttpResponse.json(
    { record: newRecord },
    { status: 201 }
  );
}

// Update performance record
async function updatePerformanceRecord(req) {
  await delay(400);
  
  if (shouldSimulateError(BASE_URL)) {
    return HttpResponse.json(
      { message: 'Failed to update performance record', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  await initializeData();
  
  const { id } = req.params;
  const body = await req.request.json();
  
  const index = performanceData.findIndex(r => r.id === parseInt(id, 10));
  
  if (index === -1) {
    return HttpResponse.json(
      { message: 'Performance record not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  const updatedRecord = {
    ...performanceData[index],
    ...body,
    updatedAt: new Date().toISOString()
  };
  
  performanceData[index] = updatedRecord;
  
  return HttpResponse.json({ record: updatedRecord });
}

// Submit performance record (member)
async function submitPerformanceRecord(req) {
  await delay(500);
  
  await initializeData();
  
  const { id } = req.params;
  const index = performanceData.findIndex(r => r.id === parseInt(id, 10));
  
  if (index === -1) {
    return HttpResponse.json(
      { message: 'Performance record not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  const now = new Date().toISOString();
  const updatedRecord = {
    ...performanceData[index],
    status: 'pending',
    submittedAt: now,
    updatedAt: now
  };
  
  performanceData[index] = updatedRecord;
  
  return HttpResponse.json({ record: updatedRecord });
}

// Approve performance record (admin)
async function approvePerformanceRecord(req) {
  await delay(400);
  
  await initializeData();
  
  const { id } = req.params;
  const index = performanceData.findIndex(r => r.id === parseInt(id, 10));
  
  if (index === -1) {
    return HttpResponse.json(
      { message: 'Performance record not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  const now = new Date().toISOString();
  const updatedRecord = {
    ...performanceData[index],
    status: 'approved',
    reviewer: 1, // Mock admin user ID
    reviewedAt: now,
    updatedAt: now
  };
  
  performanceData[index] = updatedRecord;
  
  return HttpResponse.json({ record: updatedRecord });
}

// Request revision (admin)
async function requestRevision(req) {
  await delay(400);
  
  await initializeData();
  
  const { id } = req.params;
  const body = await req.request.json();
  
  const index = performanceData.findIndex(r => r.id === parseInt(id, 10));
  
  if (index === -1) {
    return HttpResponse.json(
      { message: 'Performance record not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  const now = new Date().toISOString();
  const updatedRecord = {
    ...performanceData[index],
    status: 'revision_required',
    reviewer: 1, // Mock admin user ID
    reviewedAt: now,
    reviewComment: body.comment || body.reviewComment,
    updatedAt: now
  };
  
  performanceData[index] = updatedRecord;
  
  return HttpResponse.json({ record: updatedRecord });
}

// Delete performance record
async function deletePerformanceRecord(req) {
  await delay(300);
  
  await initializeData();
  
  const { id } = req.params;
  const index = performanceData.findIndex(r => r.id === parseInt(id, 10));
  
  if (index === -1) {
    return HttpResponse.json(
      { message: 'Performance record not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  performanceData.splice(index, 1);
  
  return HttpResponse.json(
    { message: 'Performance record deleted successfully' },
    { status: 200 }
  );
}

// Export handlers
// Use absolute paths (MSW best practice)
export const performanceHandlers = [
  // Admin: Get all performance records
  http.get(`${ADMIN_BASE_URL}`, getAllPerformanceRecords),
  
  // Admin: Get single performance record
  http.get(`${ADMIN_BASE_URL}/:id`, getPerformanceRecordById),
  
  // Admin: Approve performance record
  http.post(`${ADMIN_BASE_URL}/:id/approve`, approvePerformanceRecord),
  
  // Admin: Request revision
  http.post(`${ADMIN_BASE_URL}/:id/revision`, requestRevision),
  
  // Member: Get performance records
  http.get(`${BASE_URL}`, getMemberPerformanceRecords),
  http.get(`${API_BASE_URL}${API_PREFIX}/member/performance`, getMemberPerformanceRecords),
  
  // Member: Get single performance record
  http.get(`${BASE_URL}/:id`, getPerformanceRecordById),
  http.get(`${API_BASE_URL}${API_PREFIX}/member/performance/:id`, getPerformanceRecordById),
  
  // Member: Create performance record
  http.post(`${BASE_URL}`, createPerformanceRecord),
  http.post(`${API_BASE_URL}${API_PREFIX}/member/performance`, createPerformanceRecord),
  
  // Member: Update performance record
  http.put(`${BASE_URL}/:id`, updatePerformanceRecord),
  http.patch(`${BASE_URL}/:id`, updatePerformanceRecord),
  http.put(`${API_BASE_URL}${API_PREFIX}/member/performance/:id`, updatePerformanceRecord),
  http.patch(`${API_BASE_URL}${API_PREFIX}/member/performance/:id`, updatePerformanceRecord),
  
  // Member: Submit performance record
  http.post(`${BASE_URL}/:id/submit`, submitPerformanceRecord),
  http.post(`${API_BASE_URL}${API_PREFIX}/member/performance/:id/submit`, submitPerformanceRecord),
  
  // Member: Delete performance record (draft only)
  http.delete(`${BASE_URL}/:id`, deletePerformanceRecord),
  http.delete(`${API_BASE_URL}${API_PREFIX}/member/performance/:id`, deletePerformanceRecord)
];

