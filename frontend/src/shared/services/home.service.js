// Home Service - 首页相关服务（公告、项目）

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class HomeService {
  // ============================================================================
  // 公告相关
  // ============================================================================

  // 获取公告列表
  async listNotices(params) {
    return await apiService.get(`${API_PREFIX}/notices`, params);
  }

  // 获取最新5条公告
  async getLatestNotices() {
    return await apiService.get(`${API_PREFIX}/notices/latest5`);
  }

  // 获取公告详情
  async getNotice(noticeId) {
    return await apiService.get(`${API_PREFIX}/notices/${noticeId}`);
  }

  // ============================================================================
  // 项目相关
  // ============================================================================

  // 获取项目列表
  async listProjects(params) {
    return await apiService.get(`${API_PREFIX}/projects`, params);
  }

  // 获取最新1条项目
  async getLatestProject() {
    return await apiService.get(`${API_PREFIX}/projects/latest1`);
  }

  // 获取项目详情
  async getProject(projectId) {
    return await apiService.get(`${API_PREFIX}/projects/${projectId}`);
  }

  // ============================================================================
  // 横幅相关
  // ============================================================================

  // 获取活跃横幅
  async getBanners(params) {
    return await apiService.get(`${API_PREFIX}/banners`, params);
  }

  // ============================================================================
  // 系统信息相关
  // ============================================================================

  // 获取系统信息
  async getSystemInfo() {
    return await apiService.get(`${API_PREFIX}/system-info`);
  }

  // ============================================================================
  // 弹窗相关
  // ============================================================================

  // 获取活跃弹窗
  async getActivePopup() {
    return await apiService.get(`${API_PREFIX}/popup`);
  }

  // ============================================================================
  // 法律内容相关
  // ============================================================================

  // 获取法律内容
  async getLegalContent(contentType) {
    return await apiService.get(`${API_PREFIX}/legal-content/${contentType}`);
  }
}

export default createService(HomeService);
