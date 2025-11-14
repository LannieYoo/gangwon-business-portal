/**
 * MSW Handlers for Members API
 */

import { http, HttpResponse } from 'msw';
import { API_PREFIX, API_BASE_URL } from '@shared/utils/constants';
import { delay, loadMockData, shouldSimulateError, getErrorStatus } from '../config.js';

// Base URL for members API (use absolute paths - MSW best practice)
const BASE_URL = `${API_BASE_URL}${API_PREFIX}/members`;
const ADMIN_BASE_URL = `${API_BASE_URL}${API_PREFIX}/admin/members`;

// In-memory storage for members (simulates database)
let membersData = null;
let memberProfilesData = null;

// Initialize data on first load
async function initializeData() {
  if (!membersData) {
    const data = await loadMockData('members');
    membersData = [...data.members];
    memberProfilesData = [...(data.memberProfiles || [])];
  }
}

// Get all members (admin)
async function getAllMembers(req) {
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
  const search = url.searchParams.get('search');
  const searchField = url.searchParams.get('search_field') || 'companyName';
  
  let filteredMembers = [...membersData];
  
  // Apply filters
  if (status && status !== 'all') {
    filteredMembers = filteredMembers.filter(m => m.approvalStatus === status);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredMembers = filteredMembers.filter(m => {
      const fieldValue = m[searchField] || '';
      return String(fieldValue).toLowerCase().includes(searchLower);
    });
  }
  
  // Sort by createdAt descending (newest first)
  filteredMembers.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Pagination
  const total = filteredMembers.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedMembers = filteredMembers.slice(start, end);
  
  return HttpResponse.json({
    members: paginatedMembers,
    pagination: {
      page,
      pageSize,
      total,
      totalPages
    }
  });
}

// Get member by ID
async function getMemberById(req) {
  await delay();
  
  await initializeData();
  
  const { id } = req.params;
  const member = membersData.find(m => m.id === parseInt(id, 10));
  
  if (!member) {
    return HttpResponse.json(
      { message: 'Member not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  // Get member profile if exists
  const profile = memberProfilesData.find(p => p.memberId === member.id);
  
  return HttpResponse.json({ 
    member: {
      ...member,
      profile
    }
  });
}

// Get current member profile (member)
async function getCurrentMemberProfile(req) {
  await delay();
  
  await initializeData();
  
  // Mock: assume current user is member ID 1
  const memberId = 1;
  const member = membersData.find(m => m.id === memberId);
  
  if (!member) {
    return HttpResponse.json(
      { message: 'Member not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  const profile = memberProfilesData.find(p => p.memberId === member.id);
  
  return HttpResponse.json({ 
    member: {
      ...member,
      profile
    }
  });
}

// Update member (admin - approve/reject)
async function updateMemberStatus(req) {
  await delay(400);
  
  if (shouldSimulateError(ADMIN_BASE_URL)) {
    return HttpResponse.json(
      { message: 'Failed to update member', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  await initializeData();
  
  const { id } = req.params;
  const body = await req.request.json();
  
  const index = membersData.findIndex(m => m.id === parseInt(id, 10));
  
  if (index === -1) {
    return HttpResponse.json(
      { message: 'Member not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  const now = new Date().toISOString();
  const updatedMember = {
    ...membersData[index],
    ...body,
    updatedAt: now
  };
  
  // If approving, set approval fields
  if (body.approvalStatus === 'approved' && membersData[index].approvalStatus !== 'approved') {
    updatedMember.approvedAt = now;
    updatedMember.approvedBy = 1; // Mock admin user ID
  }
  
  membersData[index] = updatedMember;
  
  return HttpResponse.json({ member: updatedMember });
}

// Update member profile (member)
async function updateMemberProfile(req) {
  await delay(400);
  
  if (shouldSimulateError(BASE_URL)) {
    return HttpResponse.json(
      { message: 'Failed to update profile', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  await initializeData();
  
  const body = await req.request.json();
  const memberId = 1; // Mock: current user ID
  
  const memberIndex = membersData.findIndex(m => m.id === memberId);
  
  if (memberIndex === -1) {
    return HttpResponse.json(
      { message: 'Member not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  const now = new Date().toISOString();
  
  // Update member basic info (excluding businessLicense which is not editable)
  const { businessLicense, ...updatableFields } = body;
  const updatedMember = {
    ...membersData[memberIndex],
    ...updatableFields,
    updatedAt: now
  };
  
  membersData[memberIndex] = updatedMember;
  
  // Update or create profile
  const profileIndex = memberProfilesData.findIndex(p => p.memberId === memberId);
  if (profileIndex !== -1) {
    memberProfilesData[profileIndex] = {
      ...memberProfilesData[profileIndex],
      ...body.profile,
      updatedAt: now
    };
  } else if (body.profile) {
    const newProfile = {
      id: Math.max(...memberProfilesData.map(p => p.id), 0) + 1,
      memberId,
      ...body.profile,
      updatedAt: now
    };
    memberProfilesData.push(newProfile);
  }
  
  return HttpResponse.json({ member: updatedMember });
}

// Search Nice D&B (admin)
async function searchNiceDnb(req) {
  await delay(500);
  
  const url = new URL(req.request.url);
  const businessNumber = url.searchParams.get('business_number');
  
  // Mock Nice D&B response
  return HttpResponse.json({
    success: true,
    data: {
      businessNumber,
      companyName: 'Mock Company Name',
      representative: 'Mock Representative',
      address: 'Mock Address',
      industry: 'Mock Industry',
      establishedDate: '2020-01-01'
    }
  });
}

// Export handlers
// Use absolute paths (MSW best practice)
export const membersHandlers = [
  // Admin: Get all members
  http.get(`${ADMIN_BASE_URL}`, getAllMembers),
  
  // Admin: Get single member
  http.get(`${ADMIN_BASE_URL}/:id`, getMemberById),
  
  // Admin: Update member status (approve/reject)
  http.patch(`${ADMIN_BASE_URL}/:id/status`, updateMemberStatus),
  http.put(`${ADMIN_BASE_URL}/:id`, updateMemberStatus),
  
  // Admin: Search Nice D&B
  http.get(`${ADMIN_BASE_URL}/nice-dnb`, searchNiceDnb),
  
  // Member: Get current profile
  http.get(`${BASE_URL}/profile`, getCurrentMemberProfile),
  http.get(`${API_BASE_URL}${API_PREFIX}/member/profile`, getCurrentMemberProfile),
  
  // Member: Update profile
  http.put(`${BASE_URL}/profile`, updateMemberProfile),
  http.patch(`${BASE_URL}/profile`, updateMemberProfile),
  http.put(`${API_BASE_URL}${API_PREFIX}/member/profile`, updateMemberProfile),
  http.patch(`${API_BASE_URL}${API_PREFIX}/member/profile`, updateMemberProfile)
];

