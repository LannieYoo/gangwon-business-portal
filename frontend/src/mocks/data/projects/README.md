# Projects Mock Data

## 说明

这个目录包含项目（Projects）模块的 mock 数据，用于前端开发阶段通过 MSW 模拟后端 API 响应。

## 数据结构

### 项目列表 (projects)

每个项目对象包含以下字段：

#### 基础字段（管理员和会员端共享）
- `id`: 项目ID
- `title`: 项目标题
- `type`: 项目类型 (`startup`, `rd`, `export`, `investment`)
- `status`: 项目状态 (`recruiting`, `ongoing`, `closed`, `draft`)
- `startDate`: 项目开始日期
- `endDate`: 项目结束日期
- `recruitmentStartDate`: 招募开始日期
- `recruitmentEndDate`: 招募结束日期
- `budget`: 预算金额
- `description`: 项目描述
- `objectives`: 项目目标（数组）
- `scope`: 适用范围
- `manager`: 负责人姓名
- `managerPhone`: 负责人电话
- `managerEmail`: 负责人邮箱
- `attachments`: 附件列表
- `views`: 浏览次数
- `applicationsCount`: 申请数量
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

#### 管理员专用字段
- `isPublished`: 是否已发布 (`true`/`false`)
- `publishedAt`: 发布时间（如果已发布）
- `createdBy`: 创建人ID

### 项目申请列表 (projectApplications)

每个申请对象包含以下字段：
- `id`: 申请ID
- `projectId`: 项目ID
- `memberId`: 会员ID
- `status`: 申请状态 (`submitted`, `approved`, `rejected`)
- `applicationDate`: 申请日期
- `businessPlan`: 事业计划
- `expectedBudget`: 预期预算
- `expectedResults`: 预期成果
- `attachments`: 附件列表
- `reviewer`: 审核人ID
- `reviewedAt`: 审核时间
- `reviewComment`: 审核意见
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

## 使用场景

### 管理员端 (`/admin/projects`)
- **API 路径**: `/api/v1/admin/projects`
- **返回数据**: 所有项目（包括草稿状态 `draft`）
- **用途**: 
  - 项目创建、编辑、删除
  - 查看所有项目状态
  - 项目发布管理
  - 查看申请列表

### 会员端 (`/member/projects`)
- **API 路径**: `/api/v1/projects` 或 `/api/v1/member/projects`
- **返回数据**: 仅已发布的项目（`isPublished: true` 且 `status` 为 `recruiting` 或 `ongoing`）
- **用途**:
  - 查看可申请的项目列表
  - 查看项目详情
  - 提交项目申请

## MSW Handler 实现建议

在 `frontend/src/mocks/handlers/projects.js` 中，应该这样处理：

```javascript
// 管理员端：返回所有项目
rest.get('/api/v1/admin/projects', (req, res, ctx) => {
  const data = require('./data/projects/ko.json');
  return res(ctx.json({ projects: data.projects }));
});

// 会员端：只返回已发布的项目
rest.get('/api/v1/projects', (req, res, ctx) => {
  const data = require('./data/projects/ko.json');
  const publishedProjects = data.projects.filter(
    project => project.isPublished === true && 
    (project.status === 'recruiting' || project.status === 'ongoing')
  );
  return res(ctx.json({ projects: publishedProjects }));
});
```

## 数据状态说明

- **recruiting**: 招募中 - 会员可见，可以申请
- **ongoing**: 进行中 - 会员可见，但可能已过申请期
- **closed**: 已关闭 - 会员可见，但不能申请
- **draft**: 草稿 - 仅管理员可见，未发布

## 文件组织

- `ko.json`: 韩文版本 mock 数据
- `zh.json`: 中文版本 mock 数据

注意：Mock 数据应该与实际后端 API 返回的数据格式保持一致。

