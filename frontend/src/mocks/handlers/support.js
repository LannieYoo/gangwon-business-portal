/**
 * MSW Handlers for Support API (Consultations, Inquiries, etc.)
 */

import { http, HttpResponse } from 'msw';
import { API_PREFIX, API_BASE_URL } from '@shared/utils/constants';
import { delay, loadMockData, shouldSimulateError, getErrorStatus } from '../config.js';

// Base URL for support API (use absolute paths - MSW best practice)
const MEMBER_BASE_URL = `${API_BASE_URL}${API_PREFIX}/member/consultations`;

// In-memory storage for consultations (simulates database)
let consultationsData = null;

// Initialize data on first load
async function initializeData() {
  if (!consultationsData) {
    const data = await loadMockData('support');
    consultationsData = [...(data.inquiries || [])];
  }
}

// Get consultations for current member
async function getMemberConsultations(req) {
  await delay();
  
  if (shouldSimulateError(MEMBER_BASE_URL)) {
    return HttpResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  await initializeData();
  
  // Mock: assume current user is member ID 1
  const memberId = 1;
  
  // Filter consultations for current member
  const memberConsultations = consultationsData.filter(
    consultation => consultation.memberId === memberId
  );
  
  // Sort by createdAt descending (newest first)
  memberConsultations.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  return HttpResponse.json({
    records: memberConsultations
  });
}

// Get single consultation by ID
async function getConsultationById(req) {
  await delay();
  
  await initializeData();
  
  const { id } = req.params;
  const consultation = consultationsData.find(c => c.id === parseInt(id, 10));
  
  if (!consultation) {
    return HttpResponse.json(
      { message: 'Consultation not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  // Mock: check if consultation belongs to current member (member ID 1)
  const memberId = 1;
  if (consultation.memberId !== memberId) {
    return HttpResponse.json(
      { message: 'Forbidden', code: 'FORBIDDEN_ERROR' },
      { status: 403 }
    );
  }
  
  // Return in the format expected by the component
  return HttpResponse.json(consultation);
}

// Create new consultation
async function createConsultation(req) {
  await delay(400);
  
  if (shouldSimulateError(MEMBER_BASE_URL)) {
    return HttpResponse.json(
      { message: 'Failed to create consultation', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  await initializeData();
  
  const memberId = 1; // Mock: current user ID
  
  // Handle both JSON and FormData
  let body;
  const contentType = req.request.headers.get('content-type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    // Handle FormData
    const formData = await req.request.formData();
    body = {
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      subject: formData.get('subject') || '',
      content: formData.get('content') || '',
      category: formData.get('category') || 'general',
      attachments: []
    };
    
    // Process file attachments
    const attachmentFiles = formData.getAll('attachments');
    attachmentFiles.forEach((file, index) => {
      if (file instanceof File) {
        body.attachments.push({
          id: index + 1,
          fileName: file.name,
          fileUrl: `/uploads/consultations/temp/${file.name}`,
          name: file.name,
          url: `/uploads/consultations/temp/${file.name}`,
          size: file.size
        });
      }
    });
  } else {
    // Handle JSON
    body = await req.request.json();
  }
  
  // Generate new ID
  const newId = Math.max(...consultationsData.map(c => c.id), 0) + 1;
  const now = new Date().toISOString();
  
  // Create new consultation
  const newConsultation = {
    id: newId,
    memberId,
    category: body.category || 'general',
    subject: body.subject || '',
    title: body.subject || '', // Support both subject and title
    content: body.content || body.message || '',
    status: 'pending',
    name: body.name || '',
    email: body.email || '',
    phone: body.phone || '',
    attachments: body.attachments || [],
    answer: null,
    answeredBy: null,
    answeredAt: null,
    createdAt: now,
    updatedAt: now
  };
  
  consultationsData.push(newConsultation);
  
  return HttpResponse.json(
    newConsultation,
    { status: 201 }
  );
}

// Export handlers
// Use absolute paths (MSW best practice)
export const supportHandlers = [
  // Member: Get all consultations
  http.get(`${MEMBER_BASE_URL}`, getMemberConsultations),
  
  // Member: Get single consultation
  http.get(`${MEMBER_BASE_URL}/:id`, getConsultationById),
  
  // Member: Create consultation
  http.post(`${MEMBER_BASE_URL}`, createConsultation)
];

