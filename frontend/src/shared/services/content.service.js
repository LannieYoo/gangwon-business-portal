// Content Service - 内容管理服务

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { toCamelCase, toSnakeCase, createService } from "@shared/utils/helpers";

class ContentService {
  // 获取公告列表
  async listNotices(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };
    if (params.search) queryParams.search = params.search;

    const response = await apiService.get(`${API_PREFIX}/notices`, queryParams);

    if (response && response.items) {
      return {
        items: response.items.map(toCamelCase),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error("Invalid response format");
  }

  // 获取最新5条公告
  async getLatestNotices() {
    const response = await apiService.get(`${API_PREFIX}/notices/latest5`);
    return (response ?? []).map(toCamelCase);
  }

  // 获取公告详情
  async getNotice(noticeId) {
    const response = await apiService.get(`${API_PREFIX}/notices/${noticeId}`);
    return toCamelCase(response);
  }

  // 创建公告
  async createNotice(data) {
    const payload = toSnakeCase({
      title: data.title,
      contentHtml: data.contentHtml,
      boardType: data.boardType,
    });
    const response = await apiService.post(`${API_PREFIX}/admin/content/notices`, payload);
    return toCamelCase(response);
  }

  // 更新公告
  async updateNotice(noticeId, data) {
    const payload = toSnakeCase(data);
    const response = await apiService.put(`${API_PREFIX}/admin/content/notices/${noticeId}`, payload);
    return toCamelCase(response);
  }

  // 删除公告
  async deleteNotice(noticeId) {
    return await apiService.delete(`${API_PREFIX}/admin/content/notices/${noticeId}`);
  }

  // 获取新闻稿列表
  async listPressReleases(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };

    const response = await apiService.get(`${API_PREFIX}/press`, queryParams);

    if (response && response.items) {
      return {
        items: response.items.map(toCamelCase),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error("Invalid response format");
  }

  // 获取最新1条新闻稿
  async getLatestPressRelease() {
    const response = await apiService.get(`${API_PREFIX}/press/latest1`);
    return response ? toCamelCase(response) : null;
  }

  // 获取新闻稿详情
  async getPressRelease(pressId) {
    const response = await apiService.get(`${API_PREFIX}/press/${pressId}`);
    return toCamelCase(response);
  }


  // 创建新闻稿
  async createPressRelease(data) {
    const payload = toSnakeCase({ title: data.title, imageUrl: data.imageUrl });
    const response = await apiService.post(`${API_PREFIX}/admin/content/press`, payload);
    return toCamelCase(response);
  }

  // 更新新闻稿
  async updatePressRelease(pressId, data) {
    const payload = toSnakeCase(data);
    const response = await apiService.put(`${API_PREFIX}/admin/content/press/${pressId}`, payload);
    return toCamelCase(response);
  }

  // 删除新闻稿
  async deletePressRelease(pressId) {
    return await apiService.delete(`${API_PREFIX}/admin/content/press/${pressId}`);
  }

  // 获取活跃横幅
  async getBanners(params) {
    const queryParams = params?.bannerType ? { banner_type: params.bannerType } : {};
    const response = await apiService.get(`${API_PREFIX}/banners`, queryParams);
    return response.items.map(toCamelCase);
  }

  // 获取所有横幅
  async getAllBanners() {
    const response = await apiService.get(`${API_PREFIX}/admin/content/banners`);
    return response.items.map(toCamelCase);
  }

  // 创建横幅
  async createBanner(data) {
    const payload = toSnakeCase({
      bannerType: data.bannerType,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    });
    const response = await apiService.post(`${API_PREFIX}/admin/content/banners`, payload);
    return toCamelCase(response);
  }

  // 更新横幅
  async updateBanner(bannerId, data) {
    const payload = toSnakeCase(data);
    const response = await apiService.put(`${API_PREFIX}/admin/content/banners/${bannerId}`, payload);
    return toCamelCase(response);
  }

  // 删除横幅
  async deleteBanner(bannerId) {
    return await apiService.delete(`${API_PREFIX}/admin/content/banners/${bannerId}`);
  }

  // 获取系统信息
  async getSystemInfo() {
    const response = await apiService.get(`${API_PREFIX}/system-info`);
    return response ? toCamelCase(response) : null;
  }

  // 更新系统信息
  async updateSystemInfo(data) {
    const payload = toSnakeCase({ contentHtml: data.contentHtml, imageUrl: data.imageUrl });
    const response = await apiService.put(`${API_PREFIX}/admin/content/system-info`, payload);
    return toCamelCase(response);
  }

  // 获取活跃弹窗
  async getActivePopup() {
    const response = await apiService.get(`${API_PREFIX}/popup`);
    return response ? toCamelCase(response) : null;
  }

  // 获取所有弹窗
  async getAllPopups() {
    const response = await apiService.get(`${API_PREFIX}/admin/content/popups`);
    return response.popups.map(toCamelCase);
  }

  // 获取弹窗详情
  async getPopup(popupId) {
    const response = await apiService.get(`${API_PREFIX}/admin/content/popups/${popupId}`);
    return toCamelCase(response);
  }

  // 创建弹窗
  async createPopup(data) {
    const payload = toSnakeCase({
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      width: data.width,
      height: data.height,
      position: data.position,
      isActive: data.isActive,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
    });
    const response = await apiService.post(`${API_PREFIX}/admin/content/popups`, payload);
    return toCamelCase(response);
  }

  // 更新弹窗
  async updatePopup(popupId, data) {
    const payload = toSnakeCase(data);
    const response = await apiService.put(`${API_PREFIX}/admin/content/popups/${popupId}`, payload);
    return toCamelCase(response);
  }

  // 删除弹窗
  async deletePopup(popupId) {
    return await apiService.delete(`${API_PREFIX}/admin/content/popups/${popupId}`);
  }

  // 获取法律内容
  async getLegalContent(contentType) {
    const response = await apiService.get(`${API_PREFIX}/legal-content/${contentType}`);
    return response ? toCamelCase(response) : null;
  }

  // 更新法律内容
  async updateLegalContent(contentType, data) {
    const payload = toSnakeCase({ contentHtml: data.contentHtml });
    const response = await apiService.put(`${API_PREFIX}/admin/content/legal/${contentType}`, payload);
    return toCamelCase(response);
  }
}

export default createService(ContentService);
