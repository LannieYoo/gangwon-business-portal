# Design Document

## Overview

本设计文档描述江原门户系统 UI 修改的技术实现方案。涵盖前端组件修改、国际化文本更新、表单字段添加、导出功能修复等多个方面。

项目采用 React + Vite 前端架构，使用 Tailwind CSS 进行样式管理，i18n 进行多语言支持。

## Architecture

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Member    │  │    Admin    │  │       Shared        │  │
│  │   Portal    │  │    Panel    │  │     Components      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    i18n     │  │   Stores    │  │      Services       │  │
│  │   Locales   │  │  (Zustand)  │  │    (API Client)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Routers   │  │  Services   │  │      Export         │  │
│  │             │  │             │  │      Module         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 修改范围

| 模块 | 修改类型 | 影响文件 |
|------|---------|---------|
| 主页 | 样式/i18n | Header, Home 组件, CSS 变量 |
| 企业信息 | 表单字段 | CompanyInfo 组件, Schema |
| 业绩录入 | 表单字段 | PerformanceEdit 组件 |
| 业务信息 | 下拉数据 | BusinessInfo 组件, 常量文件 |
| 业务管理 | 新页面/搜索 | Programs 模块, 路由 |
| 管理员页面 | i18n | Admin 模块多个组件 |
| 导出功能 | 后端修复 | Export 服务 |
| 横幅管理 | 字段/响应式 | Banner 组件, 数据模型 |

## Components and Interfaces

### 1. 主页品牌更新

#### 样式变量更新

```css
/* frontend/src/shared/styles/index.css */
:root {
  --color-primary: #002244;
  --color-menu-bg: #002244;
  --color-menu-text: #ffffff;
  --font-family-base: "pretendard", sans-serif;
}
```

#### Logo 组件

```jsx
// Logo URL 常量
const LOGO_URL = "https://k-talk.kr/static/images/user/logo.png";
```

### 2. 企业信息表单扩展

#### 新增字段接口

```typescript
interface RepresentativeInfo {
  name: string;
  birthDate: string;      // YYYY/MM/DD 格式
  gender: 'M' | 'F';      // 男/女
}

interface LocationInfo {
  region: string;         // 所在地代码
}
```

#### 所在地选项常量

```typescript
const GANGWON_REGIONS = [
  { value: 'chuncheon', label: '춘천시' },
  { value: 'wonju', label: '원주시' },
  { value: 'gangneung', label: '강릉시' },
  { value: 'donghae', label: '동해시' },
  { value: 'taebaek', label: '태백시' },
  { value: 'sokcho', label: '속초시' },
  { value: 'samcheok', label: '삼척시' },
  { value: 'hongcheon', label: '홍천군' },
  { value: 'hoengseong', label: '횡성군' },
  { value: 'yeongwol', label: '영월군' },
  { value: 'pyeongchang', label: '평창군' },
  { value: 'jeongseon', label: '정선군' },
  { value: 'cheorwon', label: '철원군' },
  { value: 'hwacheon', label: '화천군' },
  { value: 'yanggu', label: '양구군' },
  { value: 'inje', label: '인제군' },
  { value: 'yangyang', label: '양양군' },
  { value: 'other', label: '기타 지역' },
];
```

### 3. 业绩录入 HSK 代码

#### HSK 代码验证

```typescript
interface HSKCodeInput {
  code: string;           // 10位数字
  country1: string;       // 出口国家1
  country2: string;       // 出口国家2
}

// 验证函数
function validateHSKCode(code: string): boolean {
  return /^\d{10}$/.test(code);
}
```

### 4. 产业分类代码

#### 大分类数据结构

```typescript
interface IndustryCategory {
  code: string;           // A-U
  name: string;           // 分类名称
  subCategories: SubCategory[];
}

interface SubCategory {
  code: string;           // 2位数字代码
  name: string;           // 中分类名称
}
```

### 5. 申请记录查询

#### 申请记录接口

```typescript
interface ApplicationRecord {
  id: string;
  programName: string;
  applicationDate: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  processedDate?: string;
}

interface ApplicationListResponse {
  items: ApplicationRecord[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 6. 横幅图片管理

#### 横幅数据模型

```typescript
interface BannerImage {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;  // 可选
  linkUrl?: string;
  position: string;
}
```

#### 响应式图片组件

```jsx
function ResponsiveBanner({ desktop, mobile, alt }) {
  return (
    <picture>
      {mobile && (
        <source media="(max-width: 1024px)" srcSet={mobile} />
      )}
      <img 
        src={desktop} 
        alt={alt}
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
    </picture>
  );
}
```

## Data Models

### 数据库字段扩展

#### member_profiles 表扩展

```sql
-- 法人代表信息
ALTER TABLE member_profiles ADD COLUMN representative_birth_date DATE;
ALTER TABLE member_profiles ADD COLUMN representative_gender VARCHAR(1);

-- 所在地
ALTER TABLE member_profiles ADD COLUMN location_region VARCHAR(50);

-- 产业合作
ALTER TABLE member_profiles ADD COLUMN cooperation_fields JSON;
ALTER TABLE member_profiles ADD COLUMN participation_programs JSON;
ALTER TABLE member_profiles ADD COLUMN investment_status JSON;
```

#### performance_records 表扩展

```sql
-- HSK 代码和出口国家
ALTER TABLE performance_records ADD COLUMN hsk_code VARCHAR(10);
ALTER TABLE performance_records ADD COLUMN export_country1 VARCHAR(100);
ALTER TABLE performance_records ADD COLUMN export_country2 VARCHAR(100);
```

#### banners 表扩展

```sql
-- 移动端图片
ALTER TABLE banners ADD COLUMN mobile_image_url VARCHAR(500);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 日期格式化一致性

*For any* 有效日期值，日期格式化函数 SHALL 输出 YYYY/MM/DD 格式的字符串

**Validates: Requirements 2.3**

### Property 2: HSK 代码仅允许数字

*For any* 输入字符串，HSK 代码输入字段 SHALL 过滤所有非数字字符，仅保留数字

**Validates: Requirements 4.2**

### Property 3: HSK 代码长度验证

*For any* HSK 代码输入，当长度不等于10位时，验证函数 SHALL 返回错误

**Validates: Requirements 4.3**

### Property 4: 产业分类级联筛选

*For any* 大分类选择，中分类下拉框 SHALL 仅显示属于该大分类的中分类选项

**Validates: Requirements 5.6**

### Property 5: 投资引进联动逻辑

*For any* 投资引进区块状态，当选择"无"时，投资额和投资机构输入字段 SHALL 被禁用或清空

**Validates: Requirements 6.7**

### Property 6: 搜索关键词筛选

*For any* 搜索关键词，搜索结果列表 SHALL 仅包含项目名称或描述中包含该关键词的记录

**Validates: Requirements 7.5**

### Property 7: 导出文件格式正确性

*For any* 导出请求，Excel 导出 SHALL 返回 Content-Type 为 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet 的响应，CSV 导出 SHALL 返回 Content-Type 为 text/csv 的响应

**Validates: Requirements 12.7**

### Property 8: 响应式横幅图片切换

*For any* 横幅配置，当屏幕宽度 ≤ 1024px 且存在移动端图片时，SHALL 显示移动端图片；否则 SHALL 显示桌面端图片

**Validates: Requirements 13.4**

## Error Handling

### 表单验证错误

| 错误类型 | 处理方式 |
|---------|---------|
| HSK 代码非数字 | 实时过滤非数字字符 |
| HSK 代码长度错误 | 显示错误提示，禁止提交 |
| 必填字段为空 | 显示必填提示 |
| 日期格式错误 | 使用日期选择器避免手动输入 |

### 导出错误

| 错误类型 | 处理方式 |
|---------|---------|
| 数据为空 | 提示"无数据可导出" |
| 导出失败 | 显示错误消息，允许重试 |
| 文件生成超时 | 显示加载状态，超时后提示 |

### 图片上传错误

| 错误类型 | 处理方式 |
|---------|---------|
| 文件过大 | 提示文件大小限制 |
| 格式不支持 | 提示支持的格式 |
| 上传失败 | 显示错误，允许重试 |

## Testing Strategy

### 单元测试

- 日期格式化函数测试
- HSK 代码验证函数测试
- 产业分类数据筛选函数测试
- 搜索筛选函数测试

### 属性测试

使用 fast-check 进行属性测试：

- 日期格式化属性测试（Property 1）
- HSK 代码输入过滤属性测试（Property 2, 3）
- 级联选择筛选属性测试（Property 4）
- 联动逻辑属性测试（Property 5）
- 搜索筛选属性测试（Property 6）
- 响应式图片切换属性测试（Property 8）

### 集成测试

- 表单提交完整流程测试
- 导出功能端到端测试
- 路由导航测试

### E2E 测试

- 主页品牌元素验证
- 多语言文本验证
- 响应式布局验证
