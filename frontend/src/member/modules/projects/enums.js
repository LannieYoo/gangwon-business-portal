/**
 * 项目相关枚举定义
 *
 * 定义项目状态和申请状态的常量。
 * 遵循 dev-frontend_patterns skill 规范。
 */

export const ProjectStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
  // Legacy statuses
  RECRUITING: "recruiting",
  ONGOING: "ongoing",
  CLOSED: "closed",
};

export const ApplicationStatus = {
  PENDING: "pending",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  REVIEWING: "reviewing",
  NEEDS_SUPPLEMENT: "needs_supplement",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

// 江原道 7大未来产业
export const GangwonFutureIndustries = {
  SEMICONDUCTOR: "semiconductor",
  BIO_HEALTH: "bio_health",
  FUTURE_ENERGY: "future_energy",
  FUTURE_MOBILITY: "future_mobility",
  FOOD_TECH: "food_tech",
  ADVANCED_DEFENSE: "advanced_defense",
  CLIMATE_TECH: "climate_tech",
};

// 未来有望新技术
export const FutureTechnologies = {
  IT: "it",
  BT: "bt",
  NT: "nt",
  ST: "st",
  ET: "et",
  CT: "ct",
};

// 其他分类
export const OtherCategories = {
  KNU_TENANT: "knu_tenant", // KNU 入驻企业
};
