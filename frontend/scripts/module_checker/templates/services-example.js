// Example Service - 示例服务

import apiService from './api.service';
import { API_PREFIX } from '@shared/utils/constants';

class ExampleService {
  // 获取列表
  async getList(params = {}) {
    return await apiService.get(`${API_PREFIX}/examples`, params);
  }

  // 获取详情
  async getById(id) {
    return await apiService.get(`${API_PREFIX}/examples/${id}`);
  }

  // 创建
  async create(data) {
    return await apiService.post(`${API_PREFIX}/examples`, data);
  }

  // 更新
  async update(id, data) {
    return await apiService.put(`${API_PREFIX}/examples/${id}`, data);
  }

  // 删除
  async delete(id) {
    return await apiService.delete(`${API_PREFIX}/examples/${id}`);
  }

  // 批量删除
  async deleteMany(ids) {
    return await apiService.post(`${API_PREFIX}/examples/batch-delete`, { ids });
  }

  // 检查是否存在
  async checkExists(field, value) {
    return await apiService.get(`${API_PREFIX}/examples/check-${field}/${value}`);
  }

  // 上传文件
  async uploadFile(id, file, onProgress) {
    return await apiService.upload(`${API_PREFIX}/examples/${id}/upload`, file, onProgress);
  }

  // 下载文件
  async downloadFile(id, filename) {
    return await apiService.download(`${API_PREFIX}/examples/${id}/download`, {}, filename);
  }
}

export default new ExampleService();
