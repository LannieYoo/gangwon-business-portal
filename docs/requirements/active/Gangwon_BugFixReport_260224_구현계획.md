# Gangwon Bug Fix 实施计划 (260224)

**Source:** `Gangwon_BugFixReport_260224.pptx` (5 pages)
**Created:** 2026-03-01
**Updated:** 2026-03-01
**Status:** ✅ 구현 완료 (9/9 완료, FE 빌드 검증 통과)

---

## 수정사항 요약 (修改事项总结)

总计 **9 个** 修改事项（来自 5 页 PPTX）。前端 + 后端均涉及。

---

## ✅ Issue 1: 추가 자료 제출 모달 - 10MB → 20MB (Page 1)

**位置:** 사업공고 > 신청기록 > 추가 자료 제출 모달
**现象:** 容量限制提示仍显示 10MB，且上传超过 10MB 的文件会被拒绝
**优先级:** 🔴 高
**影响范围:**

- `frontend/src/member/modules/projects/locales/ko.json` (L244: `uploadHint` 仍为 10MB)
- `frontend/src/member/modules/projects/locales/zh.json` (对应中文)

### 修改方向

- 将 `applicationRecords.uploadHint` 中的硬编码 "10MB" 改为使用 `{{maxSize}}` 变量
- 在 `SupplementMaterialsModal.jsx` 中传入 `{ maxSize: 20 }` 给 `t()` 函数

---

## ✅ Issue 2a: 1:1 문의 첨부파일 업로드 후 이름 다름 (Page 2)

**位置:** 홈 > 원스톱지원 > 1:1 문의 > 새 문의
**现象:** 附件上传后文件名显示不正确（只显示文件大小）
**优先级:** 🔴 高
**影响范围:**

- `frontend/src/member/modules/support/components/InquiryPage/`
- 文件上传 hooks / services

### 修改方向

- 检查文件上传后返回的数据中是否包含 `originalName`
- 确保上传逻辑保存原始文件名
- 同 260210 Issue 3 修复方案

---

## ✅ Issue 2b: 파일 최대사이즈 표기 문제 - `{{maxSize}}` 미치환 (Page 2)

**位置:** 홈 > 원스톱지원 > 1:1 문의 > 새 문의
**现象:** 附件提示文字中 `{{maxSize}}` 变量未被替换，原样显示
**优先级:** 🟡 中
**影响范围:**

- `frontend/src/member/modules/support/components/InquiryPage/InquiryAttachmentList.jsx` (L77)

### 修改方向

- L77 将 `t("member.support.attachmentHint")` 改为 `t("member.support.attachmentHint", { maxSize: 20 })`

---

## 🔍 Issue 3a: 대표이미지 사이즈 - 800x400 표기 확인 (Page 3)

**位置:** 관리자 > 지원사업관리 > 지원사업 생성
**现象:** 代表이미지 권장 크기仍显示 800x400（截图所示），而非 850x1200
**优先级:** 🟡 中
**影响范围:**

- `frontend/src/admin/modules/projects/ProjectForm.jsx` (L377)
- `frontend/src/admin/modules/projects/locales/ko.json` (L78)

### 修改方向

- 代码中已改为 850x1200（上次 260210 修改），需确认 **是否部署到线上**
- 如代码正确但线上未更新 → 部署问题，非代码 Bug
- 如代码仍为 800x400 → 修改代码

---

## ✅ Issue 3b: 사업공고 상세 내용 띄어쓰기/줄바꿈 안됨 (Pages 3-4)

**位置:** 사업공고 > 상세 보기
**现象:** 公告详情内容所有文字挤在一起，没有换行和空格
**优先级:** 🔴 高
**影响范围:**

- `frontend/src/member/modules/projects/components/ProjectDetail/ProjectDetailContent.jsx` (L128)

### 修改方向

- 检查 `project.description` 是 HTML 还是纯文本
- 如果是纯文本，添加 CSS `white-space: pre-wrap` 或 `white-space: pre-line`
- 如果是 HTML 但缺少 `<br>` 标签，在渲染前将 `\n` 替换为 `<br/>`

---

## ✅ Issue 3c: 네비게이션 명칭 변경 - 경영성과 → 성과조회 (Pages 3-4)

**位置:** 사용자 메뉴 네비게이션
**现象:** 顶部导航中"경영성과"需要改为"성과조회"
**优先级:** 🟢 低
**影响范围:**

- `frontend/src/member/layouts/locales/ko.json` (L17: `"performance": "경영성과"` → `"성과조회"`)
- `frontend/src/member/layouts/locales/zh.json` (对应中文: "经营成果" → "成果查询")

### 修改方向

- 修改翻译文件中的导航标签文本

---

## ✅ Issue 4a: 보완 요청 후 추가 보완요청 안됨 - 상태전이 Bug (Page 5)

**位置:** 관리자 > 지원사업 > 신청 상세
**现象:** 第一次보완 요청后，用户提交补充资料后，管理员无法再次发送보완 요청
**优先级:** 🔴 高
**影响范围:**

- `backend/src/modules/project/service.py` (L540: 状态转换规则)
- `frontend/src/admin/modules/projects/ProjectDetail.jsx` (보완요청按钮显示条件)

### 修改方向

- 在状态机 `valid_transitions` 中给 `supplement_submitted` 添加 `needs_supplement`：
  ```python
  'supplement_submitted': ['under_review', 'approved', 'rejected', 'needs_supplement'],
  ```
- 确认前端按钮在 `supplement_submitted` 状态也显示"보완요청"按钮

### 状态转移图（修改后）

```
심사중 ──(보완요청)──→ 보완요청
보완요청 ──(사용자: 자료제출)──→ 서류보완완료
서류보완완료 ──(관리자: 재심사)──→ 심사중
서류보완완료 ──(관리자: 보완요청)──→ 보완요청     ← 新增
서류보완완료 ──(관리자: 승인)──→ 승인
서류보완완료 ──(관리자: 거절)──→ 거절
```

---

## ✅ Issue 4b: 보완요청/추가자료 제출 알림 - JSON 원문 표시 (Page 5)

**位置:** 사용자/관리자 알림 내역
**现象:** 通知内容显示原始 JSON 而非人类可读文本
**优先级:** 🔴 高
**影响范围:**

- `frontend/src/shared/utils/notificationParser.js` (通知类型解析)

### 修改方向

- 在 `notificationParser.js` 中添加 `project_supplement_submitted` 和 `project_supplement_request` 类型的翻译模板
- 解析 JSON 内容并渲染为："[프로젝트명]에 보완 자료가 제출되었습니다" 等

---

## ✅ Issue 4c: 관리자 페이지에서 추가 자료 확인 기능 (Page 5)

**位置:** 관리자 > 지원사업 > 신청 상세
**现象:** 用户提交的补充资料在管理员页面无法查看（客户确认需求）
**优先级:** 🟡 中
**影响范围:**

- `frontend/src/admin/modules/projects/ProjectDetail.jsx`
- `backend/src/modules/project/service.py` (submit_supplement 中的存储逻辑)

### 修改方向

- 检查 `submit_supplement` 后文件存储位置
- 在管理员신청 상세页面添加"보완 제출 자료"列表展示
- 支持文件名显示和下载链接

---

## 구현 우선순위 정리 (实施优先级)

### 🔴 高优先级 (Critical) — 5 个

| #   | Issue                           | 范围      |
| --- | ------------------------------- | --------- |
| 1   | 추가 자료 제출 용량 10MB → 20MB | FE (翻译) |
| 2a  | 첨부파일 이름 다름              | FE        |
| 3b  | 공고 상세 띄어쓰기 안됨         | FE        |
| 4a  | 재보완 요청 불가 (상태전이)     | BE + FE   |
| 4b  | 알림 JSON 표시                  | FE        |

### 🟡 中优先级 (Medium) — 3 个

| #   | Issue                  | 范围      |
| --- | ---------------------- | --------- |
| 2b  | maxSize 변수 미치환    | FE        |
| 3a  | 대표이미지 사이즈 확인 | 확인 필요 |
| 4c  | 관리자 추가 자료 열람  | FE + BE   |

### 🟢 低优先级 (Low) — 1 个

| #   | Issue                    | 范围      |
| --- | ------------------------ | --------- |
| 3c  | 경영성과 → 성과조회 명칭 | FE (翻译) |

---

## 구현 순서 (实施顺序)

### Phase 1: Quick Fixes — ✅ 完成

- **Issue 3c**: 경영성과 → 성과조회 ✅
- **Issue 1**: 추가 자료 제출 용량 표기 10MB → 20MB ✅
- **Issue 2b**: `{{maxSize}}` 변수 전달 ✅

### Phase 2: 텍스트/UI 수정 — ✅ 완료

- **Issue 3b**: 공고 상세 띄어쓰기 수정 ✅
- **Issue 2a**: 첨부파일 이름 유지 ✅
- **Issue 3a**: 대표이미지 사이즈 확인 ✅ (코드 확인 완료, 배포 문제)

### Phase 3: 핵심 기능 수정 — ✅ 완료

- **Issue 4a**: 재보완 요청 상태전이 수정 ✅
- **Issue 4b**: 알림 내용 해석 ✅
- **Issue 4c**: 관리자 추가 자료 열람 기능 ✅

### 총 예상 소요: 3 천

### 진행 상황: 9/9 완료 (100%)

### FE 빌드 검증: ✅ 통과 (vite build 11.29s)
