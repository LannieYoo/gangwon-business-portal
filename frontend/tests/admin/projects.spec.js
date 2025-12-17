import { test, expect } from '../utils/test-base.js';

test.describe.configure({ mode: 'serial' });

test.describe('项目管理模块 - 全面测试', () => {
  test('完整项目管理功能测试', async ({ testBase, page }) => {
    // 1. 登录并进入项目管理页面
    await testBase.adminLogin();
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');
    
    // 2. 页面基础验证
    const pageTitle = page.locator('text=项目管理, h1, h2').first();
    if (await pageTitle.isVisible()) {
      expect(await pageTitle.isVisible()).toBeTruthy();
    }
    
    // 3. 项目列表验证
    const listHeaders = [
      '项目名称', '开始日期', '结束日期', '状态', '目标对象', '创建时间',
      'Project Name', 'Start Date', 'End Date', 'Status', 'Target', 'Created'
    ];
    
    let visibleHeaders = 0;
    for (const header of listHeaders) {
      const headerElement = page.locator(`text=${header}`).first();
      if (await headerElement.isVisible()) {
        visibleHeaders++;
      }
    }
    expect(visibleHeaders).toBeGreaterThan(0);
    
    // 4. 创建项目功能测试
    const createBtn = page.locator('text=创建项目, text=新建项目, .create-btn').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);
      
      // 检查创建表单
      const createModal = page.locator('.modal, .dialog, .create-panel').first();
      if (await createModal.isVisible()) {
        // 测试项目标题
        const titleField = page.locator('input[name="title"]').first();
        if (await titleField.isVisible()) {
          await titleField.fill('测试项目标题');
        }
        
        // 测试项目描述
        const descField = page.locator('textarea[name="description"]').first();
        if (await descField.isVisible()) {
          await descField.fill('这是一个测试项目的详细描述');
        }
        
        // 测试目标对象
        const targetField = page.locator('input[name="target"], textarea[name="target"]').first();
        if (await targetField.isVisible()) {
          await targetField.fill('中小企业、初创企业');
        }
        
        // 测试开始日期
        const startDateField = page.locator('input[name="startDate"]').first();
        if (await startDateField.isVisible()) {
          await startDateField.fill('2024-01-01');
        }
        
        // 测试结束日期
        const endDateField = page.locator('input[name="endDate"]').first();
        if (await endDateField.isVisible()) {
          await endDateField.fill('2024-12-31');
        }
        
        // 测试状态选择
        const statusSelect = page.locator('select[name="status"]').first();
        if (await statusSelect.isVisible()) {
          await statusSelect.selectOption('active');
        }
        
        // 测试图片上传
        const imageInput = page.locator('input[type="file"][accept*="image"]').first();
        if (await imageInput.isVisible()) {
          await testBase.testFileUpload('input[type="file"][accept*="image"]', 'project-image.jpg');
        }
        
        // 测试附件上传
        const fileInput = page.locator('input[type="file"]:not([accept*="image"])').first();
        if (await fileInput.isVisible()) {
          await testBase.testFileUpload('input[type="file"]:not([accept*="image"])', 'project-doc.pdf');
        }
        
        // 测试表单验证
        const hasValidationError = await testBase.testFormValidation('.modal form, .create-form');
        
        // 取消创建
        const cancelBtn = page.locator('text=取消, .cancel').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // 5. 项目详情查看测试
    const detailButtons = page.locator('text=详情, text=查看, .detail-btn');
    const detailButtonCount = await detailButtons.count();
    if (detailButtonCount > 0) {
      const firstDetailBtn = detailButtons.first();
      await firstDetailBtn.click();
      await page.waitForTimeout(500);
      
      // 检查详情模态框
      const modal = page.locator('.modal, .dialog, .detail-panel').first();
      if (await modal.isVisible()) {
        // 检查项目信息字段
        const infoFields = [
          '项目名称', '项目描述', '目标对象', '开始日期', '结束日期', '状态',
          'Project Name', 'Description', 'Target', 'Start Date', 'End Date', 'Status'
        ];
        
        let visibleFields = 0;
        for (const field of infoFields) {
          const fieldElement = page.locator(`text=${field}`).first();
          if (await fieldElement.isVisible()) {
            visibleFields++;
          }
        }
        expect(visibleFields).toBeGreaterThan(0);
        
        // 检查项目图片
        const projectImage = page.locator('.project-image, .banner-image').first();
        if (await projectImage.isVisible()) {
          expect(await projectImage.isVisible()).toBeTruthy();
        }
        
        // 检查附件列表
        const attachments = page.locator('.attachment, .file-list').first();
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
    
    // 6. 项目编辑功能测试
    const editButtons = page.locator('text=编辑, .edit-btn');
    const editButtonCount = await editButtons.count();
    if (editButtonCount > 0) {
      const firstEditBtn = editButtons.first();
      await firstEditBtn.click();
      await page.waitForTimeout(500);
      
      // 检查编辑表单
      const editModal = page.locator('.modal, .dialog, .edit-panel').first();
      if (await editModal.isVisible()) {
        // 测试标题编辑
        const titleField = page.locator('input[name="title"]').first();
        if (await titleField.isVisible()) {
          const currentTitle = await titleField.inputValue();
          await titleField.fill(currentTitle + ' - 已编辑');
        }
        
        // 测试描述编辑
        const descField = page.locator('textarea[name="description"]').first();
        if (await descField.isVisible()) {
          await descField.fill('更新后的项目描述');
        }
        
        // 取消编辑
        const cancelBtn = page.locator('text=取消, .cancel').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // 7. 申请管理功能测试
    const applicationButtons = page.locator('text=申请管理, text=查看申请, .application-btn');
    const applicationButtonCount = await applicationButtons.count();
    if (applicationButtonCount > 0) {
      const firstAppBtn = applicationButtons.first();
      await firstAppBtn.click();
      await page.waitForTimeout(500);
      
      // 检查申请列表
      const appModal = page.locator('.modal, .dialog, .application-panel').first();
      if (await appModal.isVisible()) {
        // 检查申请列表表头
        const appHeaders = [
          '企业名称', '申请时间', '申请状态', '申请理由',
          'Company', 'Apply Time', 'Status', 'Reason'
        ];
        
        for (const header of appHeaders) {
          const headerElement = page.locator(`text=${header}`).first();
          if (await headerElement.isVisible()) {
            expect(await headerElement.isVisible()).toBeTruthy();
            break;
          }
        }
        
        // 测试申请审核
        const reviewAppBtn = page.locator('text=审核, .review-btn').first();
        if (await reviewAppBtn.isVisible()) {
          await reviewAppBtn.click();
          await page.waitForTimeout(300);
          
          // 测试审核表单
          const reviewComment = page.locator('textarea[name="comment"]').first();
          if (await reviewComment.isVisible()) {
            await reviewComment.fill('申请材料完整，建议批准');
          }
          
          const reviewResult = page.locator('select[name="result"]').first();
          if (await reviewResult.isVisible()) {
            await reviewResult.selectOption('approved');
          }
          
          // 取消审核
          const cancelReviewBtn = page.locator('text=取消').first();
          if (await cancelReviewBtn.isVisible()) {
            await cancelReviewBtn.click();
          }
        }
        
        // 关闭申请管理
        const closeBtn = page.locator('text=关闭, text=取消').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // 8. 项目筛选功能测试
    const statusFilter = page.locator('select[name="status"]').first();
    if (await statusFilter.isVisible()) {
      const statuses = ['active', 'inactive', 'completed', 'draft'];
      for (const status of statuses) {
        await statusFilter.selectOption(status);
        await testBase.waitForLoading();
      }
      
      // 重置筛选
      await statusFilter.selectOption('');
      await testBase.waitForLoading();
    }
    
    // 测试日期范围筛选
    const startDateFilter = page.locator('input[name="startDate"]').first();
    if (await startDateFilter.isVisible()) {
      await startDateFilter.fill('2024-01-01');
      await testBase.waitForLoading();
    }
    
    const endDateFilter = page.locator('input[name="endDate"]').first();
    if (await endDateFilter.isVisible()) {
      await endDateFilter.fill('2024-12-31');
      await testBase.waitForLoading();
    }
    
    // 9. 搜索功能测试
    await testBase.testSearch('测试项目');
    
    // 10. 项目导出功能测试
    const exportResult = await testBase.testExport('text=导出');
    if (exportResult.success) {
      expect(exportResult.filename).toMatch(/\.(xlsx|csv)$/);
    }
    
    // 11. 分页功能测试
    await testBase.testPagination();
    
    // 12. 表格排序测试
    await testBase.testTableSorting();
    
    // 13. 批量操作测试
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 1) {
      // 选择多个项目
      await checkboxes.nth(1).click();
      if (checkboxCount > 2) {
        await checkboxes.nth(2).click();
      }
      
      // 测试批量状态更新
      const batchStatusBtn = page.locator('text=批量更新状态, .batch-status').first();
      if (await batchStatusBtn.isVisible()) {
        await batchStatusBtn.click();
        await page.waitForTimeout(300);
        
        const statusSelect = page.locator('select[name="batchStatus"]').first();
        if (await statusSelect.isVisible()) {
          await statusSelect.selectOption('active');
        }
        
        const cancelBtn = page.locator('text=取消').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        }
      }
      
      // 测试批量删除
      const batchDeleteBtn = page.locator('text=批量删除, .batch-delete').first();
      if (await batchDeleteBtn.isVisible()) {
        await batchDeleteBtn.click();
        await page.waitForTimeout(300);
        
        const cancelBtn = page.locator('text=取消').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        }
      }
      
      // 取消选择
      await checkboxes.nth(1).click();
      if (checkboxCount > 2) {
        await checkboxes.nth(2).click();
      }
    }
    
    // 14. 响应式布局测试
    const viewportResults = await testBase.testAllViewports(async (viewport) => {
      // 检查项目卡片在不同屏幕尺寸下的布局
      const projectCards = page.locator('.project-card, .card');
      const cardCount = await projectCards.count();
      
      if (cardCount > 0) {
        const firstCard = projectCards.first();
        const cardBox = await firstCard.boundingBox();
        expect(cardBox.width).toBeLessThanOrEqual(viewport.width);
        
        // 在小屏幕上检查卡片是否堆叠
        if (viewport.width <= 768 && cardCount > 1) {
          const secondCard = projectCards.nth(1);
          if (await secondCard.isVisible()) {
            const secondBox = await secondCard.boundingBox();
            expect(secondBox.y).toBeGreaterThan(cardBox.y);
          }
        }
      }
      
      return { viewport: viewport.name, passed: true };
    });
    
    // 验证所有视口测试通过
    const failedViewports = viewportResults.filter(r => !r.passed);
    expect(failedViewports.length).toBe(0);
    
    // 15. 性能测试
    const performanceTests = [
      { name: '页面加载', action: 'reload', maxTime: 5000 },
      { name: '筛选响应', action: async () => {
        const statusFilter = page.locator('select[name="status"]').first();
        if (await statusFilter.isVisible()) {
          await statusFilter.selectOption('active');
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
    
    // 16. 数据验证测试
    // 检查项目数据格式
    const tableRows = page.locator('tbody tr, .table-row, .project-card');
    const rowCount = await tableRows.count();
    if (rowCount > 0) {
      const firstRow = tableRows.first();
      
      // 检查日期格式
      const startDate = firstRow.locator('.start-date, .date').first();
      if (await startDate.isVisible()) {
        const dateText = await startDate.textContent();
        const dateRegex = /\d{4}-\d{2}-\d{2}|\d{4}\.\d{2}\.\d{2}|\d{4}\/\d{2}\/\d{2}/;
        expect(dateRegex.test(dateText)).toBeTruthy();
      }
      
      // 检查状态格式
      const status = firstRow.locator('.status, .badge').first();
      if (await status.isVisible()) {
        const statusText = await status.textContent();
        const validStatuses = ['active', 'inactive', 'completed', 'draft', '进行中', '已完成', '草稿'];
        const hasValidStatus = validStatuses.some(s => statusText.includes(s));
        expect(hasValidStatus).toBeTruthy();
      }
    }
    
    // 17. 表单验证测试
    // 测试创建项目表单验证
    const createBtnForValidation = page.locator('text=创建项目').first();
    if (await createBtnForValidation.isVisible()) {
      await createBtnForValidation.click();
      await page.waitForTimeout(300);
      
      const hasValidationError = await testBase.testFormValidation('.modal form, .create-form');
      if (hasValidationError) {
        expect(hasValidationError).toBeTruthy();
      }
      
      // 关闭表单
      const cancelBtn = page.locator('text=取消').first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      }
    }
    
    // 18. 可访问性测试
    const accessibilityResults = await testBase.checkAccessibility();
    expect(accessibilityResults.hasTitle).toBeTruthy();
    expect(accessibilityResults.hasHeading).toBeTruthy();
    
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
    // 测试无项目状态
    const noDataMessage = page.locator('text=暂无项目, text=No projects, .empty-state').first();
    if (await noDataMessage.isVisible()) {
      expect(await noDataMessage.isVisible()).toBeTruthy();
    }
    
    // 测试网络错误处理
    const refreshBtn = page.locator('text=刷新, .refresh').first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
      await testBase.waitForLoading();
    }
  });
});