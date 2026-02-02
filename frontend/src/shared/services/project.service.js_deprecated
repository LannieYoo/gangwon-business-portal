// Project Service - 项目管理服务

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class ProjectService {
  // 获取项目列表
  async listProjects(params) {
    const response = await apiService.get(`${API_PREFIX}/projects`, params);
    return response; // API interceptor已经转换为camelCase
  }

  // 获取项目详情
  async getProject(projectId) {
    return await apiService.get(`${API_PREFIX}/projects/${projectId}`);
  }

  // 申请项目
  async applyToProject(projectId, data) {
    return await apiService.post(`${API_PREFIX}/projects/${projectId}/apply`, data);
  }

  // 获取我的项目申请列表
  async getMyApplications(params) {
    return await apiService.get(`${API_PREFIX}/my-applications`, params);
  }

  // 取消项目申请
  async cancelApplication(applicationId) {
    return await apiService.post(`${API_PREFIX}/member/applications/${applicationId}/cancel`);
  }
}

export default createService(ProjectService);
