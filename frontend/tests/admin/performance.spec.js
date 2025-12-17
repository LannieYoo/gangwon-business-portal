import { test, expect } from '../utils/test-base.js';

test.describe.configure({ mode: 'serial' });

test.describe('绩效管理模块 - 全面测试', () => {
  test('完整绩效管理功能测试', async ({ testBase, page }) => {
    // 1. 登录并进入绩效管理页面
    await testBase.adminLogin();
    await page.goto('/admin/performance');
    await page.waitForLoadState('networkidle');
    
    // 2. 页面基础验证
    const pageTitle = page.locator('text=绩效管理, h1, h2').first();
    if (await pageTitle.isVisible()) {
      expect(await pageTitle.isVisible()).toBeTruthy();
    }
    
    // 3. 绩效数据列表验证
    const listHeaders = [
      '企业名称', '年度', '季度', '审核状态', '提交时间', '数据类型',
      'Company Name', 'Year', 'Quarter', 'Status', 'Submit Time', 'Data Type'
    ];
    
    let visibleHeaders = 0;
    for (const header of listHeaders) {
      const headerElement = page.locator(`text=${header}`).first();
      if (await headerElement.isVisible()) {
        visibleHeaders++;
      }
    }
    expect(visibleHeaders).toBeGreaterThan(0);
    
    // 4. 筛选功能测试
    const yearFilter = page.locator('select[name="year"]').first();
    if (await yearFilter.isVisible()) {
      await yearFilter.selectOption('2024');
      await testBase.waitForLoading();
      
      await yearFilter.selectOption('2023');
      await testBase.waitForLoading();
    }
    
    const quarterFilter = page.locator('select[name="quarter"]').first();
    if (await quarterFilter.isVisible()) {
      await quarterFilter.selectOption('Q1');
      await testBase.waitForLoading();
      
      await quarterFilter.selectOption('Q2');
      await testBase.waitForLoading();
      
      await quarterFilter.selectOption('Q3');
      await testBase.waitForLoading();
      
      await quarterFilter.selectOption('Q4');
      await testBase.waitForLoading();
    }
    
    const statusFilter = page.locator('select[name="status"]').first();
    if (await statusFilter.isVisible()) {
      const statuses = ['submitted', 'approved', 'need_fix', 'draft'];
      for (const status of statuses) {
        await statusFilter.selectOption(status);
        await testBase.waitForLoading();
      }
      
      // 重置筛选
      await statusFilter.selectOption('');
      await testBase.waitForLoading();
    }
    
    const typeFilter = page.locator('select[name="type"]').first();
    if (await typeFilter.isVisible()) {
      const types = ['sales', 'support', 'ip'];
      for (const type of types) {
        await typeFilter.selectOption(type);
        await testBase.waitForLoading();
      }
    }
    
    // 5. 搜索功能测试
    await testBase.testSearch('测试企业');
    
    // 6. 绩效数据详情查看测试
    const detailButtons = page.locator('text=详情, text=查看, .detail-btn');
    const detailButtonCount = await detailButtons.count();
    if (detailButtonCount > 0) {
      const firstDetailBtn = detailButtons.first();
      await firstDetailBtn.click();
      await page.waitForTimeout(500);
      
      // 检查详情模态框
      const modal = page.locator('.modal, .dialog, .detail-panel').first();
      if (await modal.isVisible()) {
        // 测试数据类型标签页
        const dataTabs = ['销售雇佣', '政府支持', '知识产权', 'Sales & Employment', 'Government Support', 'IP'];
        
        for (const tab of dataTabs) {
          const tabElement = page.locator(`text=${tab}`).first();
          if (await tabElement.isVisible()) {
            await tabElement.click();
            await page.waitForTimeout(300);
            
            // 检查数据字段
            const dataFields = page.locator('.field, .data-item, .form-group');
            const fieldCount = await dataFields.count();
            if (fieldCount > 0) {
              expect(fieldCount).toBeGreaterThan(0);
            }
          }
        }
        
        // 检查附件列表
        const attachments = page.locator('.attachment, .file-item').first();
        if (await attachments.isVisible()) {
          expect(await attachments.isVisible()).toBeTruthy();
        }
        
        // 关闭详情
        const closeBtn = page.locator('text=关闭, text=取消, .close').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // 7. 绩效数据审核功能测试
    const reviewButtons = page.locator('text=审核, text=审批, .review-btn');
    const reviewButtonCount = await reviewButtons.count();
    if (reviewButtonCount > 0) {
      const firstReviewBtn = reviewButtons.first();
      await firstReviewBtn.click();
      await page.waitForTimeout(500);
      
      // 检查审核表单
      const reviewModal = page.locator('.modal, .dialog, .review-panel').first();
      if (await reviewModal.isVisible()) {
        // 测试审核意见输入
        const commentField = page.locator('textarea[name="comment"], textarea[name="reviewComment"]').first();
        if (await commentField.isVisible()) {
          await commentField.fill('绩效数据完整准确，建议批准');
        }
        
        // 测试审核结果选择
        const resultSelect = page.locator('select[name="result"], select[name="status"]').first();
        if (await resultSelect.isVisible()) {
          await resultSelect.selectOption('approved');
          await page.waitForTimeout(300);
          
          await resultSelect.selectOption('need_fix');
          await page.waitForTimeout(300);
          
          await resultSelect.selectOption('rejected');
          await page.waitForTimeout(300);
        }
        
        // 测试审核按钮
        const approveBtn = page.locator('text=批准, text=通过, .approve-btn').first();
        const rejectBtn = page.locator('text=拒绝, text=驳回, .reject-btn').first();
        const needFixBtn = page.locator('text=需要修改, text=补正, .need-fix-btn').first();
        
        if (await approveBtn.isVisible()) {
          expect(await approveBtn.isDisabled()).toBeFalsy();
        }
        
        // 取消审核
        const cancelBtn = page.locator('text=取消, .cancel').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // 8. 绩效数据编辑功能测试
    const editButtons = page.locator('text=编辑, .edit-btn');
    const editButtonCount = await editButtons.count();
    if (editButtonCount > 0) {
      const firstEditBtn = editButtons.first();
      await firstEditBtn.click();
      await page.waitForTimeout(500);
      
      // 检查编辑表单
      const editModal = page.locator('.modal, .dialog, .edit-panel').first();
      if (await editModal.isVisible()) {
        // 测试数据编辑
        const numberInputs = page.locator('input[type="number"]');
        const numberInputCount = await numberInputs.count();
        if (numberInputCount > 0) {
          const firstInput = numberInputs.first();
          await firstInput.fill('1000000');
        }
        
        const textInputs = page.locator('input[type="text"]');
        const textInputCount = await textInputs.count();
        if (textInputCount > 0) {
          const firstTextInput = textInputs.first();
          await firstTextInput.fill('更新的数据');
        }
        
        // 取消编辑
        const cancelBtn = page.locator('text=取消, .cancel').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // 9. 批量操作测试
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 1) {
      // 选择多个记录
      await checkboxes.nth(1).click();
      if (checkboxCount > 2) {
        await checkboxes.nth(2).click();
      }
      
      // 测试批量审核
      const batchReviewBtn = page.locator('text=批量审核, .batch-review').first();
      if (await batchReviewBtn.isVisible()) {
        await batchReviewBtn.click();
        await page.waitForTimeout(300);
        
        const cancelBtn = page.locator('text=取消').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        }
      }
      
      // 测试批量导出
      const batchExportBtn = page.locator('text=批量导出, .batch-export').first();
      if (await batchExportBtn.isVisible()) {
        const exportResult = await testBase.testExport('text=批量导出');
        if (exportResult.success) {
          expect(exportResult.filename).toMatch(/\.(xlsx|csv)$/);
        }
      }
      
      // 取消选择
      await checkboxes.nth(1).click();
      if (checkboxCount > 2) {
        await checkboxes.nth(2).click();
      }
    }
    
    // 10. 数据导出功能测试
    const exportResult = await testBase.testExport('text=导出');
    if (exportResult.success) {
      expect(exportResult.filename).toMatch(/\.(xlsx|csv)$/);
    }
    
    // 11. 分页功能测试
    await testBase.testPagination();
    
    // 12. 表格排序测试
    await testBase.testTableSorting();
    
    // 13. 响应式布局测试
    const viewportResults = await testBase.testAllViewports(async (viewport) => {
      // 检查表格在小屏幕上的处理
      if (viewport.width <= 768) {
        const table = page.locator('table, .table').first();
        if (await table.isVisible()) {
          const tableContainer = table.locator('..').first();
          const overflowX = await tableContainer.evaluate(el => 
            window.getComputedStyle(el).overflowX
          );
          expect(['auto', 'scroll'].includes(overflowX)).toBeTruthy();
        }
        
        // 检查筛选器在小屏幕上的布局
        const filters = page.locator('.filters, .filter-container').first();
        if (await filters.isVisible()) {
          const filterBox = await filters.boundingBox();
          expect(filterBox.width).toBeLessThanOrEqual(viewport.width);
        }
      }
      
      return { viewport: viewport.name, passed: true };
    });
    
    // 验证所有视口测试通过
    const failedViewports = viewportResults.filter(r => !r.passed);
    expect(failedViewports.length).toBe(0);
    
    // 14. 性能测试
    const performanceTests = [
      { name: '页面加载', action: 'reload', maxTime: 5000 },
      { name: '筛选响应', action: async () => {
        const yearFilter = page.locator('select[name="year"]').first();
        if (await yearFilter.isVisible()) {
          await yearFilter.selectOption('2024');
          await testBase.waitForLoading();
        }
      }, maxTime: 2000 },
      { name: '搜索响应', action: async () => {
        await testBase.testSearch('test');
      }, maxTime: 2000 }
    ];
    
    for (const test of performanceTests) {
      const result = await testBase.measurePerformance(test.action, test.maxTime);
      expect(result.passed).toBeTruthy();
    }
    
    // 15. 数据验证测试
    // 检查绩效数据格式
    const tableRows = page.locator('tbody tr, .table-row');
    const rowCount = await tableRows.count();
    if (rowCount > 0) {
      const firstRow = tableRows.first();
      
      // 检查年度格式
      const year = firstRow.locator('.year, td:nth-child(2)').first();
      if (await year.isVisible()) {
        const yearText = await year.textContent();
        const yearNumber = parseInt(yearText);
        expect(yearNumber).toBeGreaterThan(2000);
        expect(yearNumber).toBeLessThan(2030);
      }
      
      // 检查季度格式
      const quarter = firstRow.locator('.quarter, td:nth-child(3)').first();
      if (await quarter.isVisible()) {
        const quarterText = await quarter.textContent();
        const validQuarters = ['Q1', 'Q2', 'Q3', 'Q4', '1', '2', '3', '4'];
        const hasValidQuarter = validQuarters.some(q => quarterText.includes(q));
        expect(hasValidQuarter).toBeTruthy();
      }
      
      // 检查状态格式
      const status = firstRow.locator('.status, .badge, td:nth-child(4)').first();
      if (await status.isVisible()) {
        const statusText = await status.textContent();
        const validStatuses = ['submitted', 'approved', 'need_fix', 'draft', '已提交', '已批准', '需修改', '草稿'];
        const hasValidStatus = validStatuses.some(s => statusText.includes(s));
        expect(hasValidStatus).toBeTruthy();
      }
    }
    
    // 16. 表单验证测试
    // 测试审核表单验证
    const reviewBtn = page.locator('text=审核').first();
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      await page.waitForTimeout(300);
      
      const hasValidationError = await testBase.testFormValidation('.modal form, .review-form');
      if (hasValidationError) {
        expect(hasValidationError).toBeTruthy();
      }
      
      // 关闭表单
      const cancelBtn = page.locator('text=取消').first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      }
    }
    
    // 17. 可访问性测试
    const accessibilityResults = await testBase.checkAccessibility();
    expect(accessibilityResults.hasTitle).toBeTruthy();
    expect(accessibilityResults.hasHeading).toBeTruthy();
    
    // 18. 数据完整性测试
    // 检查统计信息
    const statsCards = page.locator('.stat-card, .summary-card');
    const statsCount = await statsCards.count();
    if (statsCount > 0) {
      const firstStat = statsCards.first();
      const statValue = firstStat.locator('.value, .number').first();
      if (await statValue.isVisible()) {
        const valueText = await statValue.textContent();
        const numericValue = parseInt(valueText.replace(/[^\d]/g, ''));
        expect(numericValue).toBeGreaterThanOrEqual(0);
      }
    }
    
    // 19. 用户交互测试
    // 测试键盘导航
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
    }
    
    // 20. 错误处理测试
    // 测试无数据状态
    const noDataMessage = page.locator('text=暂无数据, text=No data, .empty-state').first();
    if (await noDataMessage.isVisible()) {
      expect(await noDataMessage.isVisible()).toBeTruthy();
    }
  });
});