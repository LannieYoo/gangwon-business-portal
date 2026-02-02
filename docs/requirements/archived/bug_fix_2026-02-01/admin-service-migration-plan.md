# AdminService 拆分迁移计划

## 需要更新的文件列表

### 1. Members 模块 (4个文件)

#### frontend/src/admin/modules/members/MemberList.jsx
- `adminService.listMembers` → `membersService.listMembers`
- `adminService.exportMembers` → `membersService.exportMembers`
- `adminService.approveMember` → `membersService.approveMember`
- `adminService.rejectMember` → `membersService.rejectMember`
- `adminService.resetMemberToPending` → `membersService.resetMemberToPending`

**导入更新**:
```javascript
// 旧的
import { adminService } from "@shared/services";

// 新的
import { membersService } from "../services";
```

#### frontend/src/admin/modules/members/MemberDetail.jsx
- `adminService.getMemberDetail` → `membersService.getMemberDetail`
- `adminService.approveMember` → `membersService.approveMember`
- `adminService.rejectMember` → `membersService.rejectMember`
- `adminService.searchNiceDnb` → `membersService.searchNiceDnb`

**导入更新**:
```javascript
import { membersService } from "../services";
```

---

### 2. Performance 模块 (2个文件)

#### frontend/src/admin/modules/performance/PerformanceList.jsx
- `adminService.listPerformanceRecords` → `performanceService.listPerformanceRecords`
- `adminService.approvePerformance` → `performanceService.approvePerformance`
- `adminService.requestPerformanceRevision` → `performanceService.requestPerformanceRevision`
- `adminService.rejectPerformance` → `performanceService.rejectPerformance`
- `adminService.exportPerformance` → `performanceService.exportPerformance`

**导入更新**:
```javascript
import { performanceService } from "../services";
import { membersService } from "../members/services";  // 如果需要会员信息
```

#### frontend/src/admin/modules/performance/PerformanceDetail.jsx
- `adminService.getPerformanceRecord` → `performanceService.getPerformanceRecord`
- `adminService.getMemberDetail` → `membersService.getMemberDetail`
- `adminService.approvePerformance` → `performanceService.approvePerformance`
- `adminService.requestPerformanceRevision` → `performanceService.requestPerformanceRevision`
- `adminService.rejectPerformance` → `performanceService.rejectPerformance`

**导入更新**:
```javascript
import { performanceService } from "../services";
import { membersService } from "../members/services";
```

---

### 3. Projects 模块 (3个文件)

#### frontend/src/admin/modules/projects/ProjectList.jsx
- `adminService.exportProjects` → `projectsService.exportProjects`

**导入更新**:
```javascript
import { projectsService } from "../services";
```

#### frontend/src/admin/modules/projects/ProjectDetail.jsx
- `adminService.getProject` → `projectsService.getProject`
- `adminService.getProjectApplications` → `projectsService.getProjectApplications`

**导入更新**:
```javascript
import { projectsService } from "../services";
```

#### frontend/src/admin/modules/projects/ProjectForm.jsx
- `adminService.getProject` → `projectsService.getProject`
- `adminService.updateProject` → `projectsService.updateProject`
- `adminService.createProject` → `projectsService.createProject`

**导入更新**:
```javascript
import { projectsService } from "../services";
```

---

### 4. Dashboard 模块 (1个文件)

#### frontend/src/admin/modules/dashboard/CompanyStatus.jsx
- `adminService.exportDashboard` → `dashboardService.exportDashboard`

**导入更新**:
```javascript
import { dashboardService } from "../services";
```

---

### 5. Audit 模块 (1个文件 - 已废弃)

#### frontend/src/admin/modules/system-logs_deprecated/AuditLogViewer.jsx
- 状态: 已废弃
- 操作: 无需更新

---

## 更新顺序

1. ✅ 创建所有新的 service 文件
2. 🔄 更新 Members 模块 (4个文件)
3. 🔄 更新 Performance 模块 (2个文件)
4. 🔄 更新 Projects 模块 (3个文件)
5. 🔄 更新 Dashboard 模块 (1个文件)
6. 🔄 更新 shared/services/index.js
7. 🔄 软删除 admin.service.js
8. 🔄 测试验证

---

## 注意事项

1. **跨模块引用**: Performance 模块需要引用 Members 模块的 service
   ```javascript
   import { membersService } from "../members/services";
   ```

2. **相对路径**: 使用相对路径导入同模块的 service
   ```javascript
   import { membersService } from "../services";
   ```

3. **API 兼容性**: 所有方法签名保持不变，只是换了 service 名称

4. **废弃文件**: 不更新 `*_deprecated` 文件

---

## 预期结果

- 每个模块都有自己的 service
- 代码组织更清晰
- 单一职责原则
- 更容易维护和测试
