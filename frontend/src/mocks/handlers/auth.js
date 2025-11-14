/**
 * MSW Handlers for Auth API
 */

import { http, HttpResponse } from 'msw';
import { API_PREFIX, API_BASE_URL } from '@shared/utils/constants';
import { delay, shouldSimulateError, getErrorStatus } from '../config.js';

const BASE_URL = `${API_PREFIX}/auth`;
const FULL_BASE_URL = `${API_BASE_URL}${API_PREFIX}/auth`;

// Mock users database
const mockUsers = [
  {
    id: 1,
    email: 'admin@gwstartup.kr',
    password: 'admin123',
    role: 'admin',
    name: '系统管理员',
    companyName: null,
    memberId: null
  },
  {
    id: 2,
    email: 'company1@gwstartup.kr',
    password: 'password123',
    role: 'member',
    name: '金哲洙',
    companyName: '江原技术株式会社',
    memberId: 1
  },
  {
    id: 3,
    email: 'company2@gwstartup.kr',
    password: 'password123',
    role: 'member',
    name: '李英姬',
    companyName: '江原生物株式会社',
    memberId: 2
  },
  {
    id: 4,
    email: 'company3@gwstartup.kr',
    password: 'password123',
    role: 'member',
    name: '朴民洙',
    companyName: '江原绿色能源',
    memberId: 3
  }
];

// Generate JWT-like token (simplified)
function generateToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };
  return btoa(JSON.stringify(payload));
}

// Login handler
async function login(req) {
  await delay();
  
  if (shouldSimulateError(BASE_URL)) {
    return HttpResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  const body = await req.request.json();
  const { email, password } = body;
  
  // Find user
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return HttpResponse.json(
      { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
      { status: 401 }
    );
  }
  
  // Generate tokens
  const accessToken = generateToken(user);
  const refreshToken = generateToken({ ...user, exp: Math.floor(Date.now() / 1000) + 86400 * 7 }); // 7 days
  
  const userInfo = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    companyName: user.companyName,
    memberId: user.memberId
  };
  
  return HttpResponse.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    user: userInfo
  });
}

// Register handler
async function register(req) {
  await delay();
  
  if (shouldSimulateError(BASE_URL)) {
    return HttpResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  const body = await req.request.json();
  const { email, password, companyName, businessLicense } = body;
  
  // Check if email already exists
  if (mockUsers.find(u => u.email === email)) {
    return HttpResponse.json(
      { message: 'Email already registered', code: 'EMAIL_EXISTS' },
      { status: 400 }
    );
  }
  
  // Create new user
  const newUser = {
    id: mockUsers.length + 1,
    email,
    password,
    role: 'member',
    name: body.representativeName || '新用户',
    companyName,
    memberId: mockUsers.length
  };
  
  mockUsers.push(newUser);
  
  // Generate tokens
  const accessToken = generateToken(newUser);
  const refreshToken = generateToken({ ...newUser, exp: Math.floor(Date.now() / 1000) + 86400 * 7 });
  
  const userInfo = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
    companyName: newUser.companyName,
    memberId: newUser.memberId
  };
  
  return HttpResponse.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    user: userInfo
  }, { status: 201 });
}

// Get current user handler
async function getCurrentUser(req) {
  await delay();
  
  // Extract token from Authorization header
  const authHeader = req.request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = JSON.parse(atob(token));
    const user = mockUsers.find(u => u.id === payload.sub);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      companyName: user.companyName,
      memberId: user.memberId
    });
  } catch (error) {
    return HttpResponse.json(
      { message: 'Invalid token', code: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }
}

// Logout handler
async function logout(req) {
  await delay();
  return HttpResponse.json({ message: 'Logged out successfully' });
}

// Refresh token handler
async function refreshToken(req) {
  await delay();
  
  const body = await req.request.json();
  const { refresh_token } = body;
  
  try {
    const payload = JSON.parse(atob(refresh_token));
    const user = mockUsers.find(u => u.id === payload.sub);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' },
        { status: 401 }
      );
    }
    
    const accessToken = generateToken(user);
    
    return HttpResponse.json({
      access_token: accessToken,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });
  } catch (error) {
    return HttpResponse.json(
      { message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' },
      { status: 401 }
    );
  }
}

// Export handlers
// Use absolute paths (MSW best practice)
export const authHandlers = [
  http.post(`${FULL_BASE_URL}/login`, login),
  http.post(`${FULL_BASE_URL}/register`, register),
  http.get(`${FULL_BASE_URL}/me`, getCurrentUser),
  http.post(`${FULL_BASE_URL}/logout`, logout),
  http.post(`${FULL_BASE_URL}/refresh`, refreshToken)
];

