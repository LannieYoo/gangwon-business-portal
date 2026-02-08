---
name: i18n_jsx_files_to_modify
description: 需要修改的 JSX/JS 组件文件清单
---

# i18n 重构 - JSX/JS 文件修改清单

**扫描时间**: 2026-02-07  
**项目文件类型**: `.jsx` / `.js`  
**总计 JSX 文件**: 81 个

---

## 📊 修改汇总

| 分类                     | 需修改文件数   | 影响的键                                                                                        |
| ------------------------ | -------------- | ----------------------------------------------------------------------------------------------- |
| Phase 2: 共享层键迁移    | **15**         | `profile.regions`, `industryClassification`, `fileAttachments`, `notifications`, `member.*`     |
| Phase 4: Member 模块前缀 | **45**         | `home.*`, `auth.*`, `projects.*`, `performance.*`, `support.*`, `about.*`, `menu.*`, `footer.*` |
| **总计**                 | **~60 个文件** | -                                                                                               |

---

## 🔧 Phase 2: 共享层键迁移

### 2.1 `profile.regions` → `enums.regions`

**影响文件: 3 个**

| 文件路径                                                                 | 匹配行数 |
| ------------------------------------------------------------------------ | -------- |
| `member/modules/performance_deprecated/PerformanceCompanyInfo.jsx`       | 19 行    |
| `member/modules/performance/components/CompanyInfo/CompanyBasicInfo.jsx` | 2 行     |
| `member/modules/auth_deprecated/Register.jsx`                            | 68+ 行   |

### 2.2 `industryClassification` → `enums.industry`

**影响文件: 1 个（核心数据文件）**

| 文件路径                                | 匹配行数 |
| --------------------------------------- | -------- |
| `shared/data/industryClassification.js` | 250+ 行  |

> ⚠️ **注意**: 这是核心数据配置文件，所有引用此数据的组件都会自动受益于此修改

### 2.3 `fileAttachments` → `components.fileUpload`

**影响文件: 7 个**

| 文件路径                                                                      | 匹配行数 |
| ----------------------------------------------------------------------------- | -------- |
| `shared/components/FileAttachments.jsx`                                       | 5 行     |
| `shared/components/HomePreview.jsx`                                           | 1 行     |
| `shared/components/HomeList.jsx`                                              | 1 行     |
| `shared/components/HomeCard.jsx`                                              | 3 行     |
| `member/modules/projects_deprecated/ApplicationModal.jsx`                     | 1 行     |
| `member/modules/support/components/NoticeDetailPage/NoticeAttachmentList.jsx` | 1 行     |
| `member/modules/projects/components/ProjectDetail/ProjectAttachments.jsx`     | 1 行     |
| `member/modules/projects/components/ApplicationModal/index.jsx`               | 1 行     |

### 2.4 `notifications` → `components.notification`

**影响文件: 4 个**

| 文件路径                                                                                 | 匹配行数 |
| ---------------------------------------------------------------------------------------- | -------- |
| `shared/components/NotificationBell.jsx`                                                 | 12 行    |
| `member/modules/support/components/NotificationHistoryPage/NotificationHistoryTable.jsx` | 1 行     |
| `member/modules/support/components/NotificationHistoryPage/NotificationHistoryPage.jsx`  | 4 行     |

### 2.5 共享层 `member.*` 键使用

**影响文件: 5 个（非 deprecated）**

| 文件路径                                                            | 匹配行数 |
| ------------------------------------------------------------------- | -------- |
| `admin/modules/statistics/hooks/useStatisticsFilters.js`            | 2 行     |
| `admin/modules/statistics/components/Filter/IndustryFilters.jsx`    | 2 行     |
| `admin/modules/statistics/components/Filter/CooperationFilters.jsx` | 3 行     |
| `member/modules/performance/hooks/useCompanyInfo.js`                | 50+ 行   |
| `member/modules/performance/components/CompanyInfo/*.jsx`           | 多行     |

---

## 🔧 Phase 4: Member 模块前缀添加

### 4.1 `menu.*` 键（Member布局）

**影响文件: 1 个**

| 文件路径                            |
| ----------------------------------- |
| `member/layouts/hooks/useHeader.js` |

### 4.2 `footer.*` 键

**影响文件: 1 个**

| 文件路径                                           |
| -------------------------------------------------- |
| `member/layouts/components/Footer/FooterLinks.jsx` |

### 4.3 `home.*` 键

**影响文件: 5 个**

| 文件路径                                                        |
| --------------------------------------------------------------- |
| `member/modules/support/hooks/useNotices.js`                    |
| `member/modules/support/components/SupportSubmenu.jsx`          |
| `member/modules/support/components/NoticesPage/NoticesPage.jsx` |
| `member/modules/home/components/ProjectPreview.jsx`             |
| `member/modules/home/hooks/useNoticesPreview.js`                |

### 4.4 `support.*` 键

**影响文件: 12 个**

| 文件路径                                                                                  |
| ----------------------------------------------------------------------------------------- |
| `member/modules/support/hooks/useInquiry.js`                                              |
| `member/modules/support/hooks/useFAQ.js`                                                  |
| `member/modules/support/components/SupportSubmenu.jsx`                                    |
| `member/modules/support/components/NotificationHistoryPage/NotificationHistoryTable.jsx`  |
| `member/modules/support/components/NotificationHistoryPage/NotificationHistoryPage.jsx`   |
| `member/modules/support/components/NotificationHistoryPage/NotificationHistoryFilter.jsx` |
| `member/modules/support/components/NotificationHistoryPage/NotificationDetailModal.jsx`   |
| `member/modules/support/components/InquiryPage/InquiryPage.jsx`                           |
| `member/modules/support/components/InquiryPage/InquiryAttachmentList.jsx`                 |
| `member/modules/support/components/InquiryHistoryPage/InquiryHistoryTable.jsx`            |
| `member/modules/support/components/InquiryHistoryPage/InquiryHistoryPage.jsx`             |
| `member/modules/support/components/FAQPage/FAQPage.jsx`                                   |

### 4.5 `about.*` 键

**影响文件: 1 个**

| 文件路径                                      |
| --------------------------------------------- |
| `member/modules/about/hooks/useSystemInfo.js` |

### 4.6 `performance.*` 键

**影响文件: 13 个**

| 文件路径                                                                             |
| ------------------------------------------------------------------------------------ |
| `member/modules/performance_deprecated/PerformanceCompanyInfo.jsx`                   |
| `member/modules/performance/components/PerformanceList/PerformanceList.jsx`          |
| `member/modules/performance/components/CompanyInfo/CompanyContactPersonInfo.jsx`     |
| `member/modules/performance/components/CompanyInfo/CompanyInfo.jsx`                  |
| `member/modules/performance/components/CompanyInfo/CompanyInvestmentStatus.jsx`      |
| `member/modules/performance/components/CompanyInfo/CompanyRepresentativeInfo.jsx`    |
| `member/modules/performance/components/CompanyInfo/CompanyBusinessInfo.jsx`          |
| `member/modules/performance/components/CompanyInfo/CompanyBasicInfo.jsx`             |
| `member/modules/performance/hooks/useCompanyInfo.js`                                 |
| `member/modules/performance/components/PerformanceForm/SalesEmploymentForm.jsx`      |
| `member/modules/performance/components/PerformanceForm/PerformanceForm.jsx`          |
| `member/modules/performance/components/PerformanceForm/IntellectualPropertyForm.jsx` |
| `member/modules/performance/components/PerformanceForm/GovernmentSupportForm.jsx`    |

### 4.7 `projects.*` 键

**影响文件: 12 个**

| 文件路径                                                                             |
| ------------------------------------------------------------------------------------ |
| `member/modules/projects/components/ProjectSubmenu.jsx`                              |
| `member/modules/projects/components/ApplicationRecords/ApplicationRecordsFilter.jsx` |
| `member/modules/projects/components/ApplicationRecords/RejectionReasonModal.jsx`     |
| `member/modules/projects/components/ApplicationRecords/CancelApplicationModal.jsx`   |
| `member/modules/projects/components/ApplicationRecords/SupplementMaterialsModal.jsx` |
| `member/modules/projects/components/ApplicationModal/ApplicationForm.jsx`            |
| `member/modules/projects/components/ApplicationModal/index.jsx`                      |
| `member/modules/projects/hooks/useApplicationRecords.js`                             |
| `member/modules/projects/hooks/useProjectList.js`                                    |
| `member/modules/projects/hooks/useProjectStatus.js`                                  |
| `member/modules/projects/hooks/useApplicationStatus.js`                              |
| `member/modules/home/hooks/useProjectPreview.js`                                     |

### 4.8 `auth.*` 键

**影响文件: 12 个**

| 文件路径                                                   |
| ---------------------------------------------------------- |
| `member/modules/auth_deprecated/Register.jsx`              |
| `member/modules/auth_deprecated/ForgotPassword.jsx`        |
| `member/modules/auth/views/RegisterView.jsx`               |
| `member/modules/auth/views/ForgotPasswordView.jsx`         |
| `member/modules/auth/hooks/useRegister.js`                 |
| `member/modules/auth/hooks/useForgotPassword.js`           |
| `member/modules/auth/components/RegisterStep1Basic.jsx`    |
| `member/modules/auth/components/RegisterStep2Info.jsx`     |
| `member/modules/auth/components/RegisterStep3Contact.jsx`  |
| `member/modules/auth/components/RegisterSuccessModal.jsx`  |
| `member/modules/auth/components/RegisterStep5Terms.jsx`    |
| `member/modules/auth/components/RegisterStep4Business.jsx` |

---

## ⚠️ Deprecated 文件处理

以下文件位于 `*_deprecated` 目录，需要确认是否仍在使用：

| 文件路径                                                           | 建议           |
| ------------------------------------------------------------------ | -------------- |
| `member/modules/performance_deprecated/PerformanceCompanyInfo.jsx` | 评估是否可删除 |
| `member/modules/auth_deprecated/Register.jsx`                      | 评估是否可删除 |
| `member/modules/auth_deprecated/ForgotPassword.jsx`                | 评估是否可删除 |
| `member/modules/projects_deprecated/ApplicationModal.jsx`          | 评估是否可删除 |
| `admin/modules/reports_deprecated/CustomReport.jsx`                | 评估是否可删除 |
| `admin/modules/reports_deprecated/ReportTemplates.jsx`             | 评估是否可删除 |
| `admin/modules/reports_deprecated/Reports.jsx`                     | 评估是否可删除 |

**建议**: 如果这些文件不再使用，在 Phase 1 之前先从代码库中删除它们，以减少重构工作量。

---

## 📋 修改示例

### 示例 1: `profile.regions` → `enums.regions`

```jsx
// 修改前
t("profile.regions.chuncheon", "춘천시");
t(`profile.regions.${region}`);

// 修改后
t("enums.regions.chuncheon", "춘천시");
t(`enums.regions.${region}`);
```

### 示例 2: `fileAttachments` → `components.fileUpload`

```jsx
// 修改前
t("fileAttachments.attachments", "첨부파일");
t("fileAttachments.uploading", "업로드 중...");

// 修改后
t("components.fileUpload.attachments", "첨부파일");
t("components.fileUpload.uploading", "업로드 중...");
```

### 示例 3: `notifications` → `components.notification`

```jsx
// 修改前
t("notifications.fromMember", { name: userName });
t("notifications.viewAll");

// 修改后
t("components.notification.fromMember", { name: userName });
t("components.notification.viewAll");
```

### 示例 4: Member 模块添加前缀

```jsx
// 修改前
t("support.inquiryTitle");
t("performance.companyInfo.title");
t("projects.applicationForm.title");

// 修改后
t("member.support.inquiryTitle");
t("member.performance.companyInfo.title");
t("member.projects.applicationForm.title");
```

---

## 🔄 替换命令参考

使用 VS Code 全局搜索替换 (Ctrl+Shift+H)：

```
# Phase 2.1: profile.regions → enums.regions
搜索: "profile\.regions
替换: "enums.regions

# Phase 2.2: industryClassification → enums.industry
搜索: 'industryClassification\.
替换: 'enums.industry.

# Phase 2.3: fileAttachments → components.fileUpload
搜索: "fileAttachments\.
替换: "components.fileUpload.

# Phase 2.4: notifications → components.notification
搜索: "notifications\.
替换: "components.notification.

# Phase 4.4: support → member.support (在 member 目录)
搜索: "support\.
替换: "member.support.
范围: frontend/src/member/

# Phase 4.6: performance → member.performance (在 member 目录)
搜索: "performance\.
替换: "member.performance.
范围: frontend/src/member/

# 以此类推...
```

---

## ✅ 完成条件

- [ ] 所有列出的文件已完成键迁移
- [ ] 没有遗留的旧键引用
- [ ] 应用程序正常运行，无 i18n key 缺失警告
- [ ] 中韩文切换正常工作

---

_本清单基于项目代码扫描结果生成，最后更新: 2026-02-07_
