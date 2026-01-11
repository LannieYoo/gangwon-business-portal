// Member Service - 会员服务

import apiService from "./api.service";
import { API_PREFIX } from "@shared/utils/constants";
import { createService } from "@shared/utils/helpers";

class MemberService {
  // 获取当前会员资料
  async getProfile() {
    const response = await apiService.get(`${API_PREFIX}/member/profile`);

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
        address: response.address,
        website: response.website,
        websiteUrl: response.website,
        logo: response.logo_url,
        logoUrl: response.logo_url,
        phone: response.phone,
        representative: response.representative,
        corporationNumber: response.legal_number,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        contactPersonName: response.contact_person_name,
        contactPersonDepartment: response.contact_person_department,
        contactPersonPosition: response.contact_person_position,
        mainBusiness: response.main_business,
        description: response.description,
        cooperationFields: response.cooperation_fields ? JSON.parse(response.cooperation_fields) : [],
      };
    }

    return null;
  }

  // 验证公司信息
  async verifyCompany(data) {
    const requestData = {
      business_number: data.businessNumber?.replace(/-/g, ""),
      company_name: data.companyName ?? null,
    };

    return await apiService.post(`${API_PREFIX}/members/verify-company`, requestData);
  }

  // 更新当前会员资料
  async updateProfile(data) {
    const requestData = {};

    if (data.companyName !== undefined) requestData.company_name = data.companyName;
    if (data.email !== undefined) requestData.email = data.email;
    if (data.industry !== undefined) requestData.industry = data.industry;
    if (data.revenue !== undefined) requestData.revenue = data.revenue;
    if (data.employeeCount !== undefined) requestData.employee_count = data.employeeCount;
    if (data.foundingDate !== undefined) requestData.founding_date = data.foundingDate;
    if (data.region !== undefined) requestData.region = data.region;
    if (data.address !== undefined) requestData.address = data.address;
    if (data.website !== undefined) requestData.website = data.website;
    if (data.phone !== undefined) requestData.phone = data.phone;
    if (data.logoUrl !== undefined) requestData.logo_url = data.logoUrl;
    if (data.representative !== undefined) requestData.representative = data.representative;
    if (data.corporationNumber !== undefined) requestData.corporation_number = data.corporationNumber;
    if (data.contactPersonName !== undefined) requestData.contact_person_name = data.contactPersonName;
    if (data.contactPersonDepartment !== undefined) requestData.contact_person_department = data.contactPersonDepartment;
    if (data.contactPersonPosition !== undefined) requestData.contact_person_position = data.contactPersonPosition;
    if (data.mainBusiness !== undefined) requestData.main_business = data.mainBusiness;
    if (data.description !== undefined) requestData.description = data.description;
    if (data.cooperationFields !== undefined) requestData.cooperation_fields = JSON.stringify(data.cooperationFields);

    const response = await apiService.put(`${API_PREFIX}/member/profile`, requestData);

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
        address: response.address,
        website: response.website,
        websiteUrl: response.website,
        logo: response.logo_url,
        logoUrl: response.logo_url,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    }

    return null;
  }
}

export default createService(MemberService);
