import { test, expect } from '../utils/test-base.js';

test.describe('报表管理模块', () => {
  test.beforeEach(async ({ testBase }) => {
    await testBase.adminLogin();
    await testBase.page.goto('/admin/reports');
  });

  test('页面加载', async ({ page }) => {
    await expect(page.locator('text=报表管理')).toBeVisible();
  });

  test('统计报表', async ({ testBase, page }) => {
    const chartSelectors = ['canvas', '.chart', '.echarts', 'svg'];
    
    let chartFound = false;
    for (const selector of chartSelectors) {
      const chart = page.locator(selector).first();
      if (await chart.isVisible()) {
        chartFound = true;
        break;
      }
    }
    
    expect(chartFound).toBeTruthy();
  });

  test('数据筛选', async ({ testBase }) => {
    await testBase.selectOption('year', '2024');
    await testBase.selectOption('quarter', 'Q1');
    await testBase.selectOption('region', 'gangwon');
  });

  test('Excel导出', async ({ testBase }) => {
    await testBase.clickByText('Excel导出');
  });

  test('CSV导出', async ({ testBase }) => {
    await testBase.clickByText('CSV导出');
  });

  test('打印报表', async ({ testBase }) => {
    await testBase.clickByText('打印');
  });

  test('自定义日期范围', async ({ testBase }) => {
    await testBase.fillField('startDate', '2024-01-01');
    await testBase.fillField('endDate', '2024-12-31');
    await testBase.clickByText('查询');
  });
});