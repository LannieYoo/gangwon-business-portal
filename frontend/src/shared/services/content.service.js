// Content Service - 内容管理服务（Admin）

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class ContentService {
  // ============================================================================
  // 公告管理（Admin）
  // ============================================================================

  // 获取公告列表
  async listNotices(params = {}) {
    return await apiService.get(`${API_PREFIX}/admin/content/notices`, { params });
  }

  // 获取公告详情
  async getNotice(noticeId) {
    return await apiService.get(`${API_PREFIX}/notices/${noticeId}`);
  }

  // 创建公告
  async createNotice(data) {
    return await apiService.post(`${API_PREFIX}/admin/content/notices`, data);
  }

  // 更新公告
  async updateNotice(noticeId, data) {
    return await apiService.put(`${API_PREFIX}/admin/content/notices/${noticeId}`, data);
  }

  // 删除公告
  async deleteNotice(noticeId) {
    return await apiService.delete(`${API_PREFIX}/admin/content/notices/${noticeId}`);
  }

  // ============================================================================
  // 项目管理（Admin）
  // ============================================================================

  // 创建项目
  async createProject(data) {
    return await apiService.post(`${API_PREFIX}/admin/content/project`, data);
  }

  // 更新项目
  async updateProject(projectId, data) {
    return await apiService.put(`${API_PREFIX}/admin/content/project/${projectId}`, data);
  }

  // 删除项目
  async deleteProject(projectId) {
    return await apiService.delete(`${API_PREFIX}/admin/content/project/${projectId}`);
  }

  // ============================================================================
  // 横幅管理（Admin）
  // ============================================================================

  // 获取所有横幅
  async getAllBanners() {
    return await apiService.get(`${API_PREFIX}/admin/content/banners`);
  }

  // 创建横幅
  async createBanner(data) {
    return await apiService.post(`${API_PREFIX}/admin/content/banners`, data);
  }

  // 更新横幅
  async updateBanner(bannerId, data) {
    return await apiService.put(`${API_PREFIX}/admin/content/banners/${bannerId}`, data);
  }

  // 删除横幅
  async deleteBanner(bannerId) {
    return await apiService.delete(`${API_PREFIX}/admin/content/banners/${bannerId}`);
  }

  // ============================================================================
  // 系统信息管理（Admin）
  // ============================================================================

  // 获取系统信息
  async getSystemInfo() {
    return await apiService.get(`${API_PREFIX}/admin/content/system-info`);
  }

  // 更新系统信息
  async updateSystemInfo(data) {
    return await apiService.put(`${API_PREFIX}/admin/content/system-info`, data);
  }

  // ============================================================================
  // 弹窗管理（Admin）
  // ============================================================================

  // 获取所有弹窗
  async getAllPopups() {
    return await apiService.get(`${API_PREFIX}/admin/content/popups`);
  }

  // 获取弹窗详情
  async getPopup(popupId) {
    return await apiService.get(`${API_PREFIX}/admin/content/popups/${popupId}`);
  }

  // 创建弹窗
  async createPopup(data) {
    return await apiService.post(`${API_PREFIX}/admin/content/popups`, data);
  }

  // 更新弹窗
  async updatePopup(popupId, data) {
    return await apiService.put(`${API_PREFIX}/admin/content/popups/${popupId}`, data);
  }

  // 删除弹窗
  async deletePopup(popupId) {
    return await apiService.delete(`${API_PREFIX}/admin/content/popups/${popupId}`);
  }

  // ============================================================================
  // 法律内容管理（Admin）
  // ============================================================================

  // 更新法律内容
  async updateLegalContent(contentType, data) {
    return await apiService.put(`${API_PREFIX}/admin/content/legal/${contentType}`, data);
  }
}

export default createService(ContentService);
