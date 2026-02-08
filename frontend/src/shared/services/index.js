/**
 * Services Export
 * 
 * 只导出真正共享的服务
 * 业务特定的服务已迁移到各自的模块中
 */

// 核心服务（所有模块共享）
export { default as apiService, apiClient } from "./api.service";
export { default as contentService } from "./content.service";
export { default as uploadService } from "./upload.service";

// DEPRECATED: 已迁移到模块内部
// export { default as logsService } from "./logs.service"; // → 只在废弃的 system-logs 模块中使用
// export { default as adminService } from "./admin.service"; // → 已拆分到各个管理员模块
// export { default as memberService } from "./member.service"; // → member/modules/profile/services/
// export { default as performanceService } from "./performance.service"; // → member/modules/performance/services/
// export { default as projectService } from "./project.service"; // → member/modules/projects/services/
// export { default as supportService } from "./support.service"; // → member/modules/support/services/
// export { default as messagesService } from "./messages.service"; // → admin/modules/messages/services/
// export { default as homeService } from "./home.service"; // → contentService
// export { default as portalService } from "./portal.service"; // → member/modules/about/services/




