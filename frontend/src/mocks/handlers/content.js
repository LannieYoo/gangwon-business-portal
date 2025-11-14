/**
 * MSW Handlers for Content API (Banners, Notices, News, etc.)
 */

import { http, HttpResponse } from 'msw';
import { API_PREFIX, API_BASE_URL } from '@shared/utils/constants';
import { delay, loadMockData, shouldSimulateError, getErrorStatus } from '../config.js';

// Base URL for content API (use absolute paths - MSW best practice)
const BASE_URL = `${API_BASE_URL}${API_PREFIX}/content`;
const ADMIN_BASE_URL = `${API_BASE_URL}${API_PREFIX}/admin/content`;

// In-memory storage for content (simulates database)
let contentData = null;

// Initialize data on first load
async function initializeData() {
  if (!contentData) {
    const data = await loadMockData('content');
    contentData = {
      banners: [...(data.banners || [])],
      popups: [...(data.popups || [])],
      news: [...(data.news || [])],
      faqs: [...(data.faqs || [])],
      about: data.about || null
    };
  }
}

// Get active banners (member)
async function getActiveBanners(req) {
  await delay();
  
  if (shouldSimulateError(BASE_URL)) {
    return HttpResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: getErrorStatus() }
    );
  }
  
  await initializeData();
  
  const now = new Date();
  const activeBanners = contentData.banners.filter(banner => {
    if (!banner.isActive) return false;
    
    const startDate = new Date(banner.startDate);
    const endDate = new Date(banner.endDate);
    
    return now >= startDate && now <= endDate;
  });
  
  // Sort by order
  activeBanners.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return HttpResponse.json({ banners: activeBanners });
}

// Get latest notices/news (member)
async function getLatestNotices(req) {
  await delay();
  
  await initializeData();
  
  const url = new URL(req.request.url);
  const limit = parseInt(url.searchParams.get('limit') || '5', 10);
  
  // Get published news/notices
  const publishedNews = contentData.news
    .filter(n => n.isPublished)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit);
  
  return HttpResponse.json({ notices: publishedNews });
}

// Get all banners (admin)
async function getAllBanners(req) {
  await delay();
  
  await initializeData();
  
  return HttpResponse.json({ banners: contentData.banners });
}

// Get all news/notices (admin)
async function getAllNews(req) {
  await delay();
  
  await initializeData();
  
  return HttpResponse.json({ news: contentData.news });
}

// Get single news/notice
async function getNewsById(req) {
  await delay();
  
  await initializeData();
  
  const { id } = req.params;
  const news = contentData.news.find(n => n.id === parseInt(id, 10));
  
  if (!news) {
    return HttpResponse.json(
      { message: 'News not found', code: 'NOT_FOUND_ERROR' },
      { status: 404 }
    );
  }
  
  return HttpResponse.json({ news });
}

// Get about page content
async function getAboutContent(req) {
  await delay();
  
  await initializeData();
  
  return HttpResponse.json({ about: contentData.about });
}

// Get FAQs
async function getFAQs(req) {
  await delay();
  
  await initializeData();
  
  const url = new URL(req.request.url);
  const category = url.searchParams.get('category');
  
  let faqs = contentData.faqs.filter(f => f.isPublished);
  
  if (category) {
    faqs = faqs.filter(f => f.category === category);
  }
  
  // Sort by order
  faqs.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return HttpResponse.json({ faqs });
}

// Export handlers
// Use absolute paths (MSW best practice)
export const contentHandlers = [
  // Member: Get active banners
  http.get(`${BASE_URL}/banners`, getActiveBanners),
  http.get(`${API_BASE_URL}${API_PREFIX}/member/banners`, getActiveBanners),
  http.get(`${API_BASE_URL}${API_PREFIX}/content/banners`, getActiveBanners),
  
  // Member: Get latest notices
  http.get(`${BASE_URL}/notices`, getLatestNotices),
  http.get(`${API_BASE_URL}${API_PREFIX}/member/notices`, getLatestNotices),
  http.get(`${API_BASE_URL}${API_PREFIX}/content/notices`, getLatestNotices),
  
  // Member: Get single news/notice
  http.get(`${BASE_URL}/news/:id`, getNewsById),
  http.get(`${API_BASE_URL}${API_PREFIX}/member/news/:id`, getNewsById),
  
  // Member: Get about content
  http.get(`${BASE_URL}/about`, getAboutContent),
  http.get(`${API_BASE_URL}${API_PREFIX}/member/about`, getAboutContent),
  
  // Member: Get FAQs
  http.get(`${BASE_URL}/faqs`, getFAQs),
  http.get(`${API_BASE_URL}${API_PREFIX}/member/faqs`, getFAQs),
  
  // Admin: Get all banners
  http.get(`${ADMIN_BASE_URL}/banners`, getAllBanners),
  
  // Admin: Get all news
  http.get(`${ADMIN_BASE_URL}/news`, getAllNews)
];

