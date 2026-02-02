# Service 拆分计划

## 概述

`admin.service.js` 和 `member.service.js` 是两个大而全的 service，违反了单一职责原则。应该按照功能模块拆分到对应的模块中。

---

## 1. AdminService 拆分计划

### 当前问题
- 一个 service 包含了多个模块的功能（会员、绩效、项目、审计日志、导出）
- 违反单一职责原则
- 难以维护和测试

### 拆分方案

#### 1.1 会员管理 Service
**新位置**: `frontend/src/admin/modules/members/services/members.service.js`

**功能**:
```javascript
class MembersService {
  // 会员列表和详情
  async listMembers(params)
  async getMemberDetail(memberId)
  
  // 会员审批
  async approveMember(memberId)
  async rejectMember(memberId, reason)
  async resetMemberToPending(memberId)
  
  // Nice D&B 企业信息查询
  async searchNiceDnb(businessNumber)
  
  // 导出
  async exportMembers(params)
}
```

#### 1.2 绩效管理 Service
**新位置**: `frontend/src/admin/modules/performance/services/performance.service.js`

**功能**:
```javascript
class PerformanceService {
  // 绩效记录管理
  async listPerformanceRecords(params)
  async getPerformanceRecord(recordId)
  
  // 绩效审核
  async approvePerformance(recordId, comments)
  async requestPerformanceRevision(recordId, comments)
  async rejectPerformance(recordId, comments)
  
  // 导出
  async exportPerformance(params)
}
```

#### 1.3 项目管理 Service
**新位置**: `frontend/src/admin/modules/projects/services/projects.service.js`

**功能**:
```javascript
class ProjectsService {
  // 项目 CRUD
  async getProject(projectId)
  async createProject(projectData)
  async updateProject(projectId, projectData)
  async deleteProject(projectId)
  
  // 项目申请
  async getProjectApplications(projectId, params)
  
  // 导出
  async exportProjects(params)
  async exportApplications(params)
}
```

#### 1.4 审计日志 Service
**新位置**: `frontend/src/admin/modules/audit/services/audit.service.js`

**功能**:
```javascript
class AuditService {
  // 审计日志管理
  async listAuditLogs(params)
  async getAuditLog(logId)
  async deleteAuditLog(logId)
  async deleteAuditLogsByAction(action)
}
```

#### 1.5 仪表盘 Service
**新位置**: `frontend/src/admin/modules/dashboard/services/dashboard.service.js`

**功能**:
```javascript
class DashboardService {
  // 仪表盘数据导出
  async exportDashboard(params)
}
```

---

## 2. MemberService 拆分计划

### 当前问题
- 功能较少，但应该放在更合适的位置
- 应该属于会员的个人资料模块

### 拆分方案

#### 2.1 会员资料 Service
**新位置**: `frontend/src/member/modules/profile/services/profile.service.js`

**功能**:
```javascript
class ProfileService {
  // 会员资料管理
  async getProfile()
  async updateProfile(data)
  
  // 公司信息验证
  async verifyCompany(data)
}
```

---

## 3. 实施步骤

### Phase 1: 创建新的模块目录结构

```bash
# 管理员端
frontend/src/admin/modules/
├── members/
│   └── services/
│       └── members.service.js
├── performance/
│   └── services/
│       └── performance.service.js
├── projects/
│   └── services/
│       └── projects.service.js
├── audit/
│   └── services/
│       └── audit.service.js
└── dashboard/
    └── services/
        └── dashboard.service.js

# 会员端
frontend/src/member/modules/
└── profile/
    └── services/
        └── profile.service.js
```

### Phase 2: 创建新的 Service 文件

按照上面的拆分方案，创建各个模块的 service 文件。

### Phase 3: 更新所有引用

1. 搜索所有使用 `adminService` 的地方
2. 根据使用的方法，替换为对应的新 service
3. 更新 import 路径

### Phase 4: 软删除旧文件

1. 重命名 `admin.service.js` → `admin.service.js_deprecated`
2. 重命名 `member.service.js` → `member.service.js_deprecated`
3. 从 `index.js` 移除导出

### Phase 5: 测试验证

1. 运行所有测试
2. 手动测试各个功能
3. 确认没有遗漏的引用

---

## 4. 引用分析

### 需要搜索的模式

```bash
# 搜索 adminService 的使用
adminService.listMembers
adminService.getMemberDetail
adminService.approveMember
adminService.rejectMember
adminService.resetMemberToPending
adminService.listPerformanceRecords
adminService.getPerformanceRecord
adminService.approvePerformance
adminService.requestPerformanceRevision
adminService.rejectPerformance
adminService.listAuditLogs
adminService.getAuditLog
adminService.deleteAuditLog
adminService.deleteAuditLogsByAction
adminService.exportMembers
adminService.getProject
adminService.createProject
adminService.updateProject
adminService.deleteProject
adminService.getProjectApplications
adminService.searchNiceDnb
adminService.exportPerformance
adminService.exportProjects
adminService.exportApplications
adminService.exportDashboard

# 搜索 memberService 的使用
memberService.getProfile
memberService.verifyCompany
memberService.updateProfile
```

---

## 5. 优先级

### 高优先级
- ✅ 已完成的模块拆分（projects, performance, support）
- 🔄 会员资料模块（member.service.js）- 功能少，容易拆分

### 中优先级
- 🔄 管理员会员管理模块
- 🔄 管理员绩效管理模块
- 🔄 管理员项目管理模块

### 低优先级
- 🔄 审计日志模块
- 🔄 仪表盘模块

---

## 6. 注意事项

1. **向后兼容**: 在迁移过程中，可以暂时保留旧的 service，确保不影响现有功能
2. **渐进式迁移**: 一次迁移一个模块，降低风险
3. **测试覆盖**: 每次迁移后都要进行充分测试
4. **文档更新**: 更新相关文档和注释
5. **团队沟通**: 确保团队成员了解新的目录结构

---

## 7. 预期收益

1. **更好的代码组织**: 每个模块的 service 都在自己的目录中
2. **单一职责**: 每个 service 只负责一个模块的功能
3. **更容易维护**: 修改某个模块时，只需要关注该模块的代码
4. **更好的可测试性**: 每个 service 都可以独立测试
5. **更清晰的依赖关系**: 模块之间的依赖关系更加明确

---

## 8. 风险评估

### 高风险
- 大量文件需要修改
- 可能遗漏某些引用

### 缓解措施
- 使用全局搜索确保找到所有引用
- 渐进式迁移，一次一个模块
- 充分测试
- 保留旧文件作为备份（软删除）

---

## 9. 时间估算

- **会员资料模块**: 1-2 小时
- **管理员会员管理模块**: 2-3 小时
- **管理员绩效管理模块**: 2-3 小时
- **管理员项目管理模块**: 2-3 小时
- **审计日志模块**: 1-2 小时
- **仪表盘模块**: 1 小时

**总计**: 约 10-15 小时

---

## 10. 建议

**建议先从 MemberService 开始**，因为：
1. 功能少，风险低
2. 可以作为拆分的模板
3. 快速验证拆分方案的可行性

**然后按照优先级逐步拆分 AdminService**。
