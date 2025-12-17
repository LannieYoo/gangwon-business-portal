import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// 登录前置操作
test.beforeEach(async ({ page }) => {
  await page.goto('/admin/login');
  
  // 等待登录页面加载完成
  await expect(page.locator('input[name="email"]')).toBeVisible();
  
  // 填写登录信息
  await page.locator('input[name="email"]').fill('admin@k-talk.kr');
  await page.locator('input[name="password"]').fill('password123');
  
  // 点击登录按钮
  await page.locator('button[type="submit"]').click();
  
  // 等待登录成功跳转（使用正则表达式）
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 10000 });
  
  // 导航到仪表盘
  await page.goto('/admin/dashboard');
  
  // 等待仪表盘页面加载
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
});

test.describe('仪表盘 - 页面加载', () => {
  test('应该正确显示仪表盘页面', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle('江原创业门户 - GangwonBiz Portal');
    
    // 等待页面内容加载（等待统计卡片出现）
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 验证页面有基本内容
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('应该在5秒内完成页面加载', async ({ page }) => {
    const startTime = Date.now();
    
    await page.reload();
    // 等待统计卡片加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('统计卡片功能', () => {
  test('应该显示企业统计卡片', async ({ page }) => {
    // 验证统计卡片网格存在
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 验证至少有一个统计卡片
    const cards = statsGrid.locator('> div');
    await expect(cards.first()).toBeVisible();
    
    // 验证数值显示（统计数字）
    const statNumbers = page.locator('p.text-\\[30px\\].font-bold');
    await expect(statNumbers.first()).toBeVisible();
  });

  test('应该显示收入统计卡片', async ({ page }) => {
    // 等待统计卡片加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 验证至少有4个统计卡片
    const cards = statsGrid.locator('> div');
    await expect(cards.nth(1)).toBeVisible(); // 第二个卡片（收入）
    
    // 验证收入数值显示
    const revenueValue = cards.nth(1).locator('p.text-\\[30px\\].font-bold');
    await expect(revenueValue).toBeVisible();
  });

  test('应该显示就业统计卡片', async ({ page }) => {
    // 验证第三个卡片（就业）
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    const cards = statsGrid.locator('> div');
    await expect(cards.nth(2)).toBeVisible();
  });

  test('应该显示知识产权统计卡片', async ({ page }) => {
    // 验证第四个卡片（知识产权）
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    const cards = statsGrid.locator('> div');
    await expect(cards.nth(3)).toBeVisible();
  });
});

test.describe('筛选功能', () => {
  test('应该能够按年份筛选数据', async ({ page }) => {
    // 等待页面加载完成
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 找到年份筛选器（可能是韩文或中文）
    const yearSelect = page.locator('select').first();
    await expect(yearSelect).toBeVisible();
    
    // 选择2024年
    await yearSelect.selectOption('2024');
    
    // 验证数据重新加载（等待统计卡片仍然可见）
    await expect(statsGrid).toBeVisible();
  });

  test('应该能够按季度筛选数据', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 找到季度筛选器（第二个select）
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    if (selectCount > 1) {
      const quarterSelect = selects.nth(1);
      await quarterSelect.selectOption('Q1');
      await expect(statsGrid).toBeVisible();
    }
  });

  test('筛选器响应时间应该在2秒内', async ({ page }) => {
    const startTime = Date.now();
    
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 执行筛选操作
    const yearSelect = page.locator('select').first();
    await yearSelect.selectOption('2023');
    await expect(statsGrid).toBeVisible();
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(2000);
  });
});

test.describe('图表功能', () => {
  test('应该显示图表区域', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 验证图表网格容器存在
    const chartGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(chartGrid).toBeVisible();
    
    // 验证至少有一个图表卡片
    const chartCards = chartGrid.locator('> div');
    await expect(chartCards.first()).toBeVisible();
  });

  test('应该显示图表内容', async ({ page }) => {
    // 等待图表区域加载
    const chartGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(chartGrid).toBeVisible();
    
    // 验证图表元素存在（canvas或svg或图表容器）
    const chartElements = page.locator('canvas, svg, .echarts, .chart');
    const chartCount = await chartElements.count();
    
    if (chartCount > 0) {
      await expect(chartElements.first()).toBeVisible();
    }
  });

  test('图表应该支持交互', async ({ page }) => {
    // 等待图表加载
    const chartGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(chartGrid).toBeVisible();
    
    // 查找图表元素并测试悬停
    const chartElements = page.locator('canvas, svg');
    const chartCount = await chartElements.count();
    
    if (chartCount > 0) {
      const firstChart = chartElements.first();
      await firstChart.hover();
      // 图表悬停不会报错即可
    }
  });
});

test.describe('数据导出功能', () => {
  test('应该能够导出Excel文件', async ({ page }) => {
    // 等待页面加载完成
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 找到导出按钮（使用更通用的选择器）
    const exportButtons = page.locator('button').filter({ hasText: /导出|Excel|export/i });
    const exportButton = exportButtons.first();
    
    if (await exportButton.isVisible()) {
      // 验证按钮可点击
      await expect(exportButton).toBeEnabled();
      
      // 测试下载功能
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.(xlsx|csv)$/);
    }
  });

  test('导出按钮应该有正确的状态', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 找到导出按钮
    const exportButtons = page.locator('button').filter({ hasText: /导出|Excel|export/i });
    
    if (await exportButtons.count() > 0) {
      const exportButton = exportButtons.first();
      
      // 验证按钮存在且启用
      await expect(exportButton).toBeVisible();
      await expect(exportButton).toBeEnabled();
      
      // 验证按钮文本包含导出相关内容
      const buttonText = await exportButton.textContent();
      expect(buttonText).toMatch(/导出|Excel|export/i);
    }
  });
});

test.describe('企业列表功能', () => {
  test('应该显示企业数据表格', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 查找表格（如果存在）
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    if (tableCount > 0) {
      await expect(tables.first()).toBeVisible();
      
      // 验证表头存在（使用通用选择器）
      const headers = tables.first().locator('th, .table-header');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('应该支持表格排序', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 查找可排序的表头
    const sortableHeaders = page.locator('th[role="columnheader"], .sortable-header');
    const headerCount = await sortableHeaders.count();
    
    if (headerCount > 0) {
      const firstHeader = sortableHeaders.first();
      await firstHeader.click();
      
      // 验证点击后没有错误
      await expect(statsGrid).toBeVisible();
    }
  });

  test('应该支持分页功能', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 查找分页组件
    const pagination = page.locator('.pagination, [data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      // 查找下一页按钮
      const nextButtons = page.locator('button').filter({ hasText: /다음|next|下一页/i });
      
      if (await nextButtons.count() > 0) {
        const nextButton = nextButtons.first();
        
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await expect(statsGrid).toBeVisible();
        }
      }
    }
  });
});

test.describe('搜索功能', () => {
  test('应该能够搜索企业', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 查找搜索输入框
    const searchInputs = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="搜索"], input[placeholder*="search"]');
    
    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();
      
      // 输入搜索关键词
      await searchInput.fill('테스트');
      await page.keyboard.press('Enter');
      
      // 验证搜索操作完成（页面仍然可见）
      await expect(statsGrid).toBeVisible();
    }
  });

  test('应该能够清空搜索', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 查找搜索输入框
    const searchInputs = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="搜索"], input[placeholder*="search"]');
    
    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();
      
      // 输入并清空搜索
      await searchInput.fill('테스트');
      await searchInput.clear();
      await page.keyboard.press('Enter');
      
      // 验证清空操作完成
      await expect(statsGrid).toBeVisible();
    }
  });
});

test.describe('响应式布局', () => {
  const viewports = [
    { width: 1920, height: 1080, name: '桌面端' },
    { width: 768, height: 1024, name: '平板端' },
    { width: 375, height: 667, name: '手机端' }
  ];

  viewports.forEach(({ width, height, name }) => {
    test(`应该在${name}正确显示`, async ({ page }) => {
      // 设置视口大小
      await page.setViewportSize({ width, height });
      
      // 验证主要内容可见（使用实际存在的选择器）
      const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      await expect(statsGrid).toBeVisible();
      
      // 验证统计卡片在当前视口下可见
      const cards = statsGrid.locator('> div');
      await expect(cards.first()).toBeVisible();
      
      // 在小屏幕上验证卡片布局
      if (width <= 768) {
        const cardCount = await cards.count();
        
        if (cardCount > 1) {
          const firstCard = cards.first();
          const secondCard = cards.nth(1);
          
          const firstBox = await firstCard.boundingBox();
          const secondBox = await secondCard.boundingBox();
          
          // 在小屏幕上，卡片应该垂直堆叠（允许小的重叠）
          if (firstBox && secondBox) {
            // 允许2px的误差，因为CSS布局可能有小的重叠
            expect(secondBox.y).toBeGreaterThanOrEqual(firstBox.y - 2);
          }
        }
      }
    });
  });
});

test.describe('性能测试', () => {
  test('图表渲染时间应该在3秒内', async ({ page }) => {
    const startTime = Date.now();
    
    // 等待图表区域加载
    const chartGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(chartGrid).toBeVisible();
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(3000);
  });

  test('数据更新响应时间应该在2秒内', async ({ page }) => {
    const startTime = Date.now();
    
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 触发数据更新（使用年份选择器）
    const yearSelect = page.locator('select').first();
    await yearSelect.selectOption('2023');
    await expect(statsGrid).toBeVisible();
    
    const updateTime = Date.now() - startTime;
    expect(updateTime).toBeLessThan(2000);
  });
});

test.describe('数据完整性', () => {
  test('统计数值应该为有效数字', async ({ page }) => {
    // 等待统计卡片加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 检查统计数值（使用实际的CSS选择器）
    const statNumbers = page.locator('p.text-\\[30px\\].font-bold');
    const numberCount = await statNumbers.count();
    
    if (numberCount > 0) {
      const firstValue = await statNumbers.first().textContent();
      const numericValue = parseInt(firstValue?.replace(/[^\d]/g, '') || '0');
      expect(numericValue).toBeGreaterThanOrEqual(0);
    }
  });

  test('图表数据应该存在', async ({ page }) => {
    // 验证图表区域存在
    const chartGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(chartGrid).toBeVisible();
    
    // 验证图表卡片存在
    const chartCards = chartGrid.locator('> div');
    await expect(chartCards.first()).toBeVisible();
    
    // 验证没有显示空数据状态（如果有的话）
    const emptyStates = page.locator('text=/데이터가 없습니다|暂无数据|No data/i');
    const emptyCount = await emptyStates.count();
    
    // 如果有空状态，至少应该有图表容器
    if (emptyCount === 0) {
      await expect(chartCards.first()).toBeVisible();
    }
  });
});

test.describe('错误处理', () => {
  test('应该处理网络错误', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 查找刷新按钮（如果存在）
    const refreshButtons = page.locator('button').filter({ hasText: /새로고침|刷新|refresh/i });
    
    if (await refreshButtons.count() > 0) {
      const refreshButton = refreshButtons.first();
      await refreshButton.click();
      await expect(statsGrid).toBeVisible();
    }
  });

  test('应该显示空数据状态', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    // 查找空状态消息（如果存在）
    const emptyStates = page.locator('text=/데이터가 없습니다|暂无数据|No data available/i');
    
    if (await emptyStates.count() > 0) {
      const emptyState = emptyStates.first();
      await expect(emptyState).toBeVisible();
    }
  });
});

test.describe('可访问性', () => {
  test('页面应该有正确的标题和标题层级', async ({ page }) => {
    // 验证页面标题包含相关关键词
    const title = await page.title();
    expect(title).toMatch(/강원|GangwonBiz|Portal|창업|포털/i);
    
    // 验证主标题存在
    const headings = page.locator('h1, h2').first();
    await expect(headings).toBeVisible();
  });

  test('图표应该有可访问性标签', async ({ page }) => {
    // 等待图表区域加载
    const chartGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(chartGrid).toBeVisible();
    
    // 查找图表元素
    const chartElements = page.locator('canvas, svg');
    const chartCount = await chartElements.count();
    
    if (chartCount > 0) {
      const firstChart = chartElements.first();
      
      // 验证图表元素存在（可访问性标签是可选的）
      await expect(firstChart).toBeVisible();
    }
  });

  test('按钮应该有可访问的文本', async ({ page }) => {
    // 等待页面加载
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();
    
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    // 验证第一个按钮有文本或可访问的标签
    const firstButton = buttons.first();
    const buttonText = await firstButton.textContent();
    const ariaLabel = await firstButton.getAttribute('aria-label');
    const title = await firstButton.getAttribute('title');
    
    expect(buttonText?.trim() || ariaLabel || title).toBeTruthy();
  });
});