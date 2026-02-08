/**
 * Projects Service - 项目管理服务 (管理员端)
 * 
 * 管理员端项目管理功能
 * 遵循 dev-frontend_patterns skill 规范
 */

import { apiService } from "@shared/services";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class ProjectsService {
  /**
   * 获取项目详情
   * @param {string} projectId - 项目ID
   * @returns {Promise<Object>} 项目详情
   */
  async getProject(projectId) {
    return await apiService.get(`${API_PREFIX}/admin/projects/${projectId}`);
  }

  /**
   * 创建新项目
   * @param {Object} projectData - 项目数据
   * @returns {Promise<Object>} 创建的项目
   */
  async createProject(projectData) {
    return await apiService.post(`${API_PREFIX}/admin/projects`, projectData);
  }

  /**
   * 更新项目
   * @param {string} projectId - 项目ID
   * @param {Object} projectData - 项目数据
   * @returns {Promise<Object>} 更新后的项目
   */
  async updateProject(projectId, projectData) {
    return await apiService.put(`${API_PREFIX}/admin/projects/${projectId}`, projectData);
  }

  /**
   * 删除项目
   * @param {string} projectId - 项目ID
   * @returns {Promise<Object>} 操作结果
   */
  async deleteProject(projectId) {
    return await apiService.delete(`${API_PREFIX}/admin/projects/${projectId}`);
  }

  /**
   * 获取项目申请列表
   * @param {string} projectId - 项目ID
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 申请列表
   */
  async getProjectApplications(projectId, params) {
    return await apiService.get(`${API_PREFIX}/admin/projects/${projectId}/applications`, { params });
  }

  /**
   * 导出项目数据
   * @param {Object} params - 导出参数
   * @returns {Promise<Blob>} 导出文件
   */
  async exportProjects(params) {
    return await apiService.download(`${API_PREFIX}/admin/projects/export`, params);
  }

  /**
   * 导出项目申请数据
   * @param {Object} params - 导出参数
   * @returns {Promise<Blob>} 导出文件
   */
  async exportApplications(params) {
    return await apiService.download(`${API_PREFIX}/admin/applications/export`, params);
  }
}

export default createService(ProjectsService);




