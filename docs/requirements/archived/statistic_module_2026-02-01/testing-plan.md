# Phase 8: 测试计划与执行

**项目**: 江原创业门户 - 统计报告模块  
**阶段**: Phase 8 - Testing  
**测试日期**: 2026-02-01  
**使用 Skill**: `dev-senior_qa`

---

## 测试策略

根据 QA skill 的测试金字塔原则，我们将采用以下测试分布：

| 测试类型 | 占比 | 工具 | 覆盖范围 |
|---------|------|------|----------|
| 单元测试 | 60% | pytest (后端), Vitest (前端) | 纯函数、工具类、独立组件 |
| 集成测试 | 30% | pytest + httpx (后端), RTL + MSW (前端) | API 端点、组件交互 |
| E2E 测试 | 10% | Playwright | 关键用户流程 |

---

## 测试覆盖率目标

根据项目配置 (`dev-state.yaml`):
- **目标覆盖率**: 80%
- **关键路径覆盖率**: 95%

### 按模块的覆盖率要求

| 模块 | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| 后端 - 统计服务 | 85% | 80% | 85% | 85% |
| 后端 - 统计路由 | 90% | 85% | 90% | 90% |
| 前端 - 筛选组件 | 75% | 70% | 75% | 75% |
| 前端 - 表格组件 | 80% | 75% | 80% | 80% |
| 前端 - Hooks | 85% | 80% | 85% | 85% |

---

## 后端测试计划

### 1. 单元测试

#### 1.1 统计服务测试 (`backend/tests/unit/test_statistics_service.py`)

**测试范围**:
- ✅ 查询参数验证
- ✅ 筛选逻辑（时间、产业、政策、投资、专利）
- ✅ 分页逻辑
- ✅ 排序逻辑
- ✅ 数据聚合

**测试用例**:
```python
class TestStatisticsService:
    # 基础查询
    - test_query_companies_basic()
    - test_query_companies_with_pagination()
    - test_query_companies_with_sorting()
    
    # 时间筛选
    - test_filter_by_year()
    - test_filter_by_quarter()
    - test_filter_by_month()
    - test_filter_by_year_and_quarter()
    
    # 产业筛选
    - test_filter_by_ksic_major()
    - test_filter_by_ksic_minor()
    - test_filter_by_leading_industry()
    
    # 政策筛选
    - test_filter_by_startup_center()
    - test_filter_by_global_project()
    - test_filter_by_rise_project()
    - test_filter_by_multiple_programs()
    
    # 投资筛选
    - test_filter_by_investment_status()
    - test_filter_by_investment_amount_range()
    - test_filter_by_investment_preset_ranges()
    
    # 专利筛选
    - test_filter_by_patent_count_range()
    - test_filter_by_patent_preset_ranges()
    
    # 关键词搜索
    - test_search_by_company_name()
    - test_search_by_business_number()
    
    # 边界情况
    - test_empty_result_set()
    - test_invalid_parameters()
    - test_large_result_set()
```

#### 1.2 Excel 导出测试 (`backend/tests/unit/test_statistics_export.py`)

**测试范围**:
- ✅ Excel 文件生成
- ✅ 数据格式化
- ✅ PII 脱敏
- ✅ 文件名生成
- ✅ 导出限制（10,000 条）

**测试用例**:
```python
class TestStatisticsExport:
    - test_export_to_excel_basic()
    - test_export_with_filter_summary()
    - test_export_pii_masking()
    - test_export_filename_format()
    - test_export_record_limit()
    - test_export_empty_result()
    - test_export_metadata()
```

### 2. 集成测试

#### 2.1 API 端点测试 (`backend/tests/integration/test_statistics_api.py`)

**测试范围**:
- ✅ GET /api/statistics/companies - 查询企业
- ✅ GET /api/statistics/export - 导出 Excel
- ✅ 认证和授权
- ✅ 错误处理
- ✅ 响应格式

**测试用例**:
```python
class TestStatisticsAPI:
    # 查询端点
    - test_query_companies_success()
    - test_query_companies_with_filters()
    - test_query_companies_pagination()
    - test_query_companies_sorting()
    - test_query_companies_unauthorized()
    - test_query_companies_invalid_params()
    
    # 导出端点
    - test_export_excel_success()
    - test_export_excel_with_filters()
    - test_export_excel_unauthorized()
    - test_export_excel_too_many_records()
    
    # 错误处理
    - test_400_bad_request()
    - test_401_unauthorized()
    - test_500_internal_error()
```

---

## 前端测试计划

### 1. 单元测试

#### 1.1 Hooks 测试 (`frontend/src/admin/modules/statistics/hooks/*.test.js`)

**测试范围**:
- ✅ `useStatistics` - 数据查询逻辑
- ✅ `useStatisticsFilters` - 筛选状态管理

**测试用例**:
```javascript
// useStatistics.test.js
describe('useStatistics', () => {
  - test('initializes with default params')
  - test('fetches data on mount')
  - test('applies filters correctly')
  - test('handles pagination')
  - test('handles sorting')
  - test('handles loading state')
  - test('handles error state')
  - test('exports data')
});

// useStatisticsFilters.test.js
describe('useStatisticsFilters', () => {
  - test('initializes with default filters')
  - test('updates time filters')
  - test('updates industry filters')
  - test('updates program filters')
  - test('updates investment filters')
  - test('updates patent filters')
  - test('resets filters')
  - test('validates filter combinations')
});
```

#### 1.2 工具函数测试 (`frontend/src/admin/modules/statistics/utils/*.test.js`)

**测试范围**:
- ✅ 数字格式化
- ✅ 日期格式化
- ✅ 参数验证

**测试用例**:
```javascript
describe('formatters', () => {
  - test('formats currency with thousands separator')
  - test('formats large numbers')
  - test('handles zero and negative numbers')
  - test('formats dates correctly')
});
```

### 2. 组件测试

#### 2.1 筛选组件测试 (`frontend/src/admin/modules/statistics/components/Filter/*.test.jsx`)

**测试范围**:
- ✅ TimeFilters - 时间筛选
- ✅ IndustryFilters - 产业筛选
- ✅ ProgramFilters - 政策筛选
- ✅ InvestmentFilters - 投资筛选
- ✅ PatentFilters - 专利筛选

**测试用例**:
```javascript
describe('TimeFilters', () => {
  - test('renders year selector')
  - test('renders quarter selector when year selected')
  - test('renders month selector when quarter selected')
  - test('calls onChange with correct values')
  - test('disables quarter when year not selected')
});

describe('IndustryFilters', () => {
  - test('renders KSIC major categories')
  - test('loads minor categories on major selection')
  - test('renders leading industry options')
  - test('supports multiple selection')
});

// Similar for other filter components...
```

#### 2.2 表格组件测试 (`frontend/src/admin/modules/statistics/components/Report/*.test.jsx`)

**测试范围**:
- ✅ StatisticsTable - 数据表格
- ✅ 分页控件
- ✅ 排序功能
- ✅ 加载状态
- ✅ 空状态
- ✅ 错误状态

**测试用例**:
```javascript
describe('StatisticsTable', () => {
  - test('renders table with data')
  - test('displays loading skeleton')
  - test('displays empty state')
  - test('displays error state')
  - test('handles column sorting')
  - test('handles pagination')
  - test('formats numbers correctly')
  - test('displays program tags')
});
```

### 3. 集成测试

#### 3.1 完整流程测试 (`frontend/src/admin/modules/statistics/__tests__/integration.test.jsx`)

**测试范围**:
- ✅ 筛选 → 查询 → 显示结果
- ✅ 分页和排序
- ✅ 导出功能
- ✅ 错误处理

**测试用例**:
```javascript
describe('Statistics Report Integration', () => {
  - test('complete filter and query flow')
  - test('pagination updates results')
  - test('sorting updates results')
  - test('export triggers download')
  - test('handles API errors gracefully')
  - test('resets filters correctly')
});
```

### 4. E2E 测试

#### 4.1 关键用户流程 (`frontend/tests/e2e/statistics.spec.js`)

**测试范围**:
- ✅ 登录 → 导航到统计报告
- ✅ 应用筛选条件
- ✅ 查看结果
- ✅ 导出 Excel

**测试用例**:
```javascript
test.describe('Statistics Report E2E', () => {
  test('user can filter and view statistics', async ({ page }) => {
    // 1. Login
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // 2. Navigate to statistics
    await page.goto('/admin/statistics');
    
    // 3. Apply filters
    await page.selectOption('[data-testid="year-select"]', '2024');
    await page.selectOption('[data-testid="quarter-select"]', 'Q1');
    await page.click('[data-testid="apply-filters"]');
    
    // 4. Verify results
    await expect(page.locator('[data-testid="results-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-count"]')).toContainText(/\d+/);
  });
  
  test('user can export data to Excel', async ({ page }) => {
    // ... setup ...
    
    // Trigger export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');
    const download = await downloadPromise;
    
    // Verify filename
    expect(download.suggestedFilename()).toMatch(/강원기업통계리포트_\d{8}\.xlsx/);
  });
});
```

---

## 测试数据准备

### 后端测试数据

创建测试 fixtures (`backend/tests/fixtures/`):

```python
# fixtures/companies.py
@pytest.fixture
def sample_companies():
    return [
        {
            "business_number": "123-45-67890",
            "company_name": "테스트기업 A",
            "ksic_code": "C10",
            "startup_stage": "성장기",
            "programs": ["startup_center", "global_project"],
            "investment_amount": 50000000,
            "patent_count": 5,
            "revenue": 100000000,
            "export_amount": 10000000,
        },
        # ... more test data
    ]

# fixtures/database.py
@pytest.fixture
async def test_db():
    # Setup test database
    async with AsyncSession(test_engine) as session:
        yield session
    # Teardown
```

### 前端测试数据

创建 MSW handlers (`frontend/src/admin/modules/statistics/__tests__/mocks/handlers.js`):

```javascript
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/statistics/companies', (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            businessNumber: '123-45-67890',
            companyName: '테스트기업 A',
            ksicCode: 'C10',
            startupStage: '성장기',
            programs: ['startup_center'],
            investmentAmount: 50000000,
            patentCount: 5,
            revenue: 100000000,
          },
          // ... more test data
        ],
        total: 100,
        page: 1,
        pageSize: 10,
      })
    );
  }),
  
  rest.get('/api/statistics/export', (req, res, ctx) => {
    return res(
      ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      ctx.set('Content-Disposition', 'attachment; filename="test.xlsx"'),
      ctx.body(new ArrayBuffer(8))
    );
  }),
];
```

---

## 测试执行计划

### 阶段 1: 后端单元测试 (2 小时)
1. 创建测试目录结构
2. 编写统计服务测试
3. 编写导出功能测试
4. 运行测试并检查覆盖率

### 阶段 2: 后端集成测试 (1.5 小时)
1. 编写 API 端点测试
2. 测试认证和授权
3. 测试错误处理
4. 运行测试并检查覆盖率

### 阶段 3: 前端单元测试 (2 小时)
1. 编写 Hooks 测试
2. 编写工具函数测试
3. 编写筛选组件测试
4. 运行测试并检查覆盖率

### 阶段 4: 前端集成测试 (1.5 小时)
1. 设置 MSW
2. 编写完整流程测试
3. 测试错误场景
4. 运行测试并检查覆盖率

### 阶段 5: E2E 测试 (1 小时)
1. 编写关键用户流程测试
2. 运行 E2E 测试
3. 生成测试报告

### 阶段 6: 覆盖率分析和优化 (1 小时)
1. 分析覆盖率报告
2. 识别未覆盖的关键路径
3. 补充测试用例
4. 最终验证

---

## 测试工具配置

### 后端 pytest 配置

创建 `backend/pytest.ini`:
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --verbose
    --cov=src
    --cov-report=html
    --cov-report=term
    --cov-report=json
    --cov-fail-under=80
asyncio_mode = auto
```

### 前端 Vitest 配置

更新 `frontend/vite.config.js`:
```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

---

## 成功标准

### 必须满足的条件

- [ ] 后端测试覆盖率 ≥ 80%
- [ ] 前端测试覆盖率 ≥ 80%
- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] 所有 E2E 测试通过
- [ ] 关键路径覆盖率 ≥ 95%
- [ ] 无严重 Bug

### 质量指标

- [ ] 测试执行时间 < 5 分钟（单元 + 集成）
- [ ] E2E 测试执行时间 < 3 分钟
- [ ] 测试通过率 = 100%
- [ ] 无 flaky 测试

---

## 下一步行动

1. ✅ 创建测试计划文档（当前文档）
2. ⏳ 创建后端测试目录结构
3. ⏳ 编写后端单元测试
4. ⏳ 编写后端集成测试
5. ⏳ 编写前端单元测试
6. ⏳ 编写前端集成测试
7. ⏳ 编写 E2E 测试
8. ⏳ 运行所有测试并生成报告
9. ⏳ 分析覆盖率并优化
10. ⏳ 更新 dev-state.yaml

---

**文档状态**: Phase 8 开始  
**预计完成时间**: 8-10 小时  
**下一步**: 创建测试目录结构并开始编写测试

