// Admin Service - 管理员服务

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class AdminService {
  // 获取会员列表
  async listMembers(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };

    if (params.search) queryParams.search = params.search;
    if (params.industry) queryParams.industry = params.industry;
    if (params.region) queryParams.region = params.region;
    if (params.approvalStatus) queryParams.approval_status = params.approvalStatus;
    if (params.status) queryParams.status = params.status;

    const response = await apiService.get(`${API_PREFIX}/admin/members`, queryParams);

    if (response && response.items && Array.isArray(response.items)) {
      return {
        members: response.items.map((item) => ({
          id: item.id,
          businessNumber: item.business_number,
          companyName: item.company_name,
          email: item.email,
          status: item.status,
          approvalStatus: item.approval_status,
          industry: item.industry,
          createdAt: item.created_at,
          representative: item.representative ?? null,
          address: item.address ?? null,
          phone: item.phone ?? null,
        })),
        pagination: {
          total: response.total,
          page: response.page,
          pageSize: response.page_size,
          totalPages: response.total_pages,
        },
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error('Invalid response format');
  }

  // 获取会员详情
  async getMemberDetail(memberId) {
    const response = await apiService.get(`${API_PREFIX}/admin/members/${memberId}`);

    if (response) {
      return {
        id: response.id,
        businessNumber: response.business_number,
        companyName: response.company_name,
        email: response.email,
        status: response.status,
        approvalStatus: response.approval_status,
        industry: response.industry,
        sales: response.revenue ? parseFloat(response.revenue) : null,
        revenue: response.revenue ? parseFloat(response.revenue) : null,
        employeeCount: response.employee_count,
        establishedDate: response.founding_date,
        foundingDate: response.founding_date,
        region: response.region,
        address: response.address ?? null,
        website: response.website,
        websiteUrl: response.website,
        logo: response.logo_url,
        logoUrl: response.logo_url,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        contactPersonName: response.contact_person_name ?? null,
        contactPersonDepartment: response.contact_person_department ?? null,
        contactPersonPosition: response.contact_person_position ?? null,
        representative: response.representative ?? null,
        legalNumber: response.legal_number ?? null,
        phone: response.phone ?? null,
      };
    }

    return null;
  }

  // 批准会员注册
  async approveMember(memberId) {
    return await apiService.put(`${API_PREFIX}/admin/members/${memberId}/approve`);
  }

  // 拒绝会员注册
  async rejectMember(memberId, reason) {
    const queryParams = reason ? { reason } : {};
    return await apiService.put(`${API_PREFIX}/admin/members/${memberId}/reject`, {}, { params: queryParams });
  }

  // 重置会员审批状态为待审核
  async resetMemberToPending(memberId) {
    return await apiService.put(`${API_PREFIX}/admin/members/${memberId}/reset-pending`);
  }


  // 获取绩效记录列表
  async listPerformanceRecords(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };

    if (params.memberId) queryParams.member_id = params.memberId;
    if (params.year !== undefined && params.year !== null && params.year !== "") queryParams.year = parseInt(params.year);
    if (params.quarter !== undefined && params.quarter !== null && params.quarter !== "") queryParams.quarter = parseInt(params.quarter);
    if (params.status) queryParams.status = params.status;
    if (params.type) queryParams.type = params.type;
    if (params.searchKeyword && params.searchKeyword.trim()) queryParams.search_keyword = params.searchKeyword.trim();

    const response = await apiService.get(`${API_PREFIX}/admin/performance`, queryParams);

    if (response && response.items) {
      return {
        records: response.items.map((item) => ({
          id: item.id,
          memberId: item.member_id,
          memberCompanyName: item.member_company_name,
          memberBusinessNumber: item.member_business_number,
          year: item.year,
          quarter: item.quarter,
          type: item.type,
          status: item.status,
          submittedAt: item.submitted_at,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        pagination: {
          total: response.total,
          page: response.page,
          pageSize: response.page_size,
          totalPages: response.total_pages,
        },
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error('Invalid response format');
  }

  // 获取绩效记录详情
  async getPerformanceRecord(recordId) {
    const response = await apiService.get(`${API_PREFIX}/admin/performance/${recordId}`);

    if (response) {
      return {
        id: response.id,
        memberId: response.member_id,
        year: response.year,
        quarter: response.quarter,
        type: response.type,
        status: response.status,
        dataJson: response.data_json,
        submittedAt: response.submitted_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        attachments: response.attachments,
        reviews: response.reviews,
      };
    }

    return null;
  }

  // 批准绩效记录
  async approvePerformance(recordId, comments) {
    const response = await apiService.post(`${API_PREFIX}/admin/performance/${recordId}/approve`, { comments: comments ?? null });

    if (response) {
      return {
        id: response.id,
        year: response.year,
        quarter: response.quarter,
        type: response.type,
        status: response.status,
        dataJson: response.data_json,
        submittedAt: response.submitted_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    }

    return null;
  }

  // 要求修改绩效记录
  async requestPerformanceRevision(recordId, comments) {
    const response = await apiService.post(`${API_PREFIX}/admin/performance/${recordId}/request-fix`, { comments });

    if (response) {
      return {
        id: response.id,
        year: response.year,
        quarter: response.quarter,
        type: response.type,
        status: response.status,
        dataJson: response.data_json,
        submittedAt: response.submitted_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    }

    return null;
  }

  // 驳回绩效记录
  async rejectPerformance(recordId, comments) {
    const response = await apiService.post(`${API_PREFIX}/admin/performance/${recordId}/reject`, { comments: comments ?? null });

    if (response) {
      return {
        id: response.id,
        year: response.year,
        quarter: response.quarter,
        type: response.type,
        status: response.status,
        dataJson: response.data_json,
        submittedAt: response.submitted_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    }

    return null;
  }


  // 获取审计日志列表
  async listAuditLogs(params) {
    const queryParams = {
      page: params.page,
      page_size: params.pageSize,
    };

    if (params.userId) queryParams.user_id = params.userId;
    if (params.action) queryParams.action = params.action;
    if (params.resourceType) queryParams.resource_type = params.resourceType;
    if (params.resourceId) queryParams.resource_id = params.resourceId;
    if (params.startDate) queryParams.start_date = new Date(params.startDate).toISOString();
    if (params.endDate) queryParams.end_date = new Date(params.endDate).toISOString();

    const response = await apiService.get(`${API_PREFIX}/admin/audit-logs`, queryParams);

    if (response && response.items) {
      return {
        logs: response.items.map((item) => ({
          id: item.id,
          source: item.source ?? null,
          level: item.level ?? null,
          message: item.message ?? null,
          layer: item.layer ?? null,
          module: item.module ?? null,
          function: item.function ?? null,
          lineNumber: item.line_number ?? null,
          filePath: item.file_path ?? null,
          traceId: item.trace_id ?? null,
          requestId: item.request_id ?? null,
          userId: item.user_id,
          durationMs: item.duration_ms,
          extraData: item.extra_data,
          action: item.extra_data?.action ?? null,
          resourceType: item.extra_data?.resource_type ?? null,
          resourceId: item.extra_data?.resource_id ?? null,
          ipAddress: item.extra_data?.ip_address ?? null,
          userAgent: item.extra_data?.user_agent ?? null,
          createdAt: item.created_at,
          userEmail: item.user_email,
          userCompanyName: item.user_company_name,
        })),
        pagination: {
          total: response.total,
          page: response.page,
          pageSize: response.page_size,
          totalPages: response.total_pages,
        },
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
      };
    }

    throw new Error('Invalid response format');
  }

  // 获取审计日志详情
  async getAuditLog(logId) {
    const response = await apiService.get(`${API_PREFIX}/admin/audit-logs/${logId}`);

    if (response) {
      return {
        id: response.id,
        userId: response.user_id,
        action: response.action,
        resourceType: response.resource_type,
        resourceId: response.resource_id,
        ipAddress: response.ip_address,
        userAgent: response.user_agent,
        createdAt: response.created_at,
        userEmail: response.user_email,
        userCompanyName: response.user_company_name,
      };
    }

    return null;
  }

  // 删除单条审计日志
  async deleteAuditLog(logId) {
    return await apiService.delete(`${API_PREFIX}/admin/audit-logs/${logId}`);
  }

  // 删除指定操作类型的审计日志
  async deleteAuditLogsByAction(action) {
    const encodedAction = encodeURIComponent(action);
    return await apiService.delete(`${API_PREFIX}/admin/audit-logs/by-action?action=${encodedAction}`);
  }

  // 导出会员数据
  async exportMembers(params) {
    const queryParams = { format: params.format };

    if (params.search) queryParams.search = params.search;
    if (params.industry) queryParams.industry = params.industry;
    if (params.region) queryParams.region = params.region;
    if (params.approvalStatus) queryParams.approval_status = params.approvalStatus;
    if (params.status) queryParams.status = params.status;
    if (params.language) queryParams.language = params.language;

    return await apiService.download(`${API_PREFIX}/admin/members/export`, queryParams);
  }

  // 获取项目详情
  async getProject(projectId) {
    return await apiService.get(`${API_PREFIX}/admin/projects/${projectId}`);
  }

  // 创建新项目
  async createProject(projectData) {
    return await apiService.post(`${API_PREFIX}/admin/projects`, projectData);
  }

  // 更新项目
  async updateProject(projectId, projectData) {
    return await apiService.put(`${API_PREFIX}/admin/projects/${projectId}`, projectData);
  }

  // 删除项目
  async deleteProject(projectId) {
    return await apiService.delete(`${API_PREFIX}/admin/projects/${projectId}`);
  }

  // 获取项目申请列表
  async getProjectApplications(projectId, params) {
    return await apiService.get(`${API_PREFIX}/admin/projects/${projectId}/applications`, { params });
  }

  // 查询 Nice D&B 企业信息
  async searchNiceDnb(businessNumber) {
    const cleanBusinessNumber = businessNumber.replace(/-/g, "");
    return await apiService.get(`${API_PREFIX}/admin/members/nice-dnb`, { business_number: cleanBusinessNumber });
  }

  // 导出绩效数据
  async exportPerformance(params) {
    const queryParams = { format: params.format };

    if (params.year) queryParams.year = params.year;
    if (params.quarter) queryParams.quarter = params.quarter;
    if (params.status) queryParams.status = params.status;
    if (params.type) queryParams.type = params.type;
    if (params.memberId) queryParams.member_id = params.memberId;

    return await apiService.download(`${API_PREFIX}/admin/performance/export`, queryParams);
  }

  // 导出项目数据
  async exportProjects(params) {
    const queryParams = { format: params.format };

    if (params.status) queryParams.status = params.status;
    if (params.search) queryParams.search = params.search;

    return await apiService.download(`${API_PREFIX}/admin/projects/export`, queryParams);
  }

  // 导出项目申请数据
  async exportApplications(params) {
    const queryParams = { format: params.format };

    if (params.projectId) queryParams.project_id = params.projectId;
    if (params.status) queryParams.status = params.status;

    return await apiService.download(`${API_PREFIX}/admin/applications/export`, queryParams);
  }

  // 导出仪表盘数据
  async exportDashboard(params) {
    const queryParams = {
      format: params.format,
      year: params.year,
      quarter: params.quarter,
    };

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `dashboard_${queryParams.year}_${queryParams.quarter}_${timestamp}.${queryParams.format === "excel" ? "xlsx" : "csv"}`;
    return await apiService.download(`${API_PREFIX}/admin/dashboard/export`, queryParams, filename);
  }
}

export default createService(AdminService);
