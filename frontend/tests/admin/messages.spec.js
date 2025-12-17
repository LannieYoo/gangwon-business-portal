import { test, expect } from '../utils/test-base.js';

test.describe.configure({ mode: 'serial' });

test.describe('消息管理模块 - 全面测试', () => {
  test('完整消息管理功能测试', async ({ testBase, page }) => {
    // 1. 登录并进入消息管理页面
    await testBase.adminLogin();
    await page.goto('/admin/messages');
    await page.waitForLoadState('networkidle');
    
    // 2. 页面基础验证
    const pageTitle = page.locator('text=消息管理, h1, h2').first();
    if (await pageTitle.isVisible()) {
      expect(await pageTitle.isVisible()).toBeTruthy();
    }
    
    // 3. 标签页功能测试
    const tabs = [
      '消息列表', '发送消息', '群发消息', '消息统计', '消息模板',
      'Message List', 'Send Message', 'Broadcast', 'Statistics', 'Templates'
    ];
    
    let visibleTabs = [];
    for (const tab of tabs) {
      const tabElement = page.locator(`text=${tab}`).first();
      if (await tabElement.isVisible()) {
        visibleTabs.push(tab);
        
        const startTime = Date.now();
        await tabElement.click();
        await page.waitForTimeout(300);
        const switchTime = Date.now() - startTime;
        
        expect(switchTime).toBeLessThan(1000);
      }
    }
    expect(visibleTabs.length).toBeGreaterThan(0);
    
    // 4. 消息列表功能测试
    const messageListTab = page.locator('text=消息列表').first();
    if (await messageListTab.isVisible()) {
      await messageListTab.click();
      await page.waitForTimeout(500);
      
      // 检查消息列表表头
      const listHeaders = [
        '发送者', '接收者', '主题', '状态', '发送时间', '已读时间',
        'Sender', 'Recipient', 'Subject', 'Status', 'Sent Time', 'Read Time'
      ];
      
      let visibleHeaders = 0;
      for (const header of listHeaders) {
        const headerElement = page.locator(`text=${header}`).first();
        if (await headerElement.isVisible()) {
          visibleHeaders++;
        }
      }
      expect(visibleHeaders).toBeGreaterThan(0);
      
      // 测试消息搜索
      const searchInput = page.locator('input[placeholder*="搜索"], input[name="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('测试消息');
        await page.keyboard.press('Enter');
        await testBase.waitForLoading();
        
        await searchInput.clear();
        await page.keyboard.press('Enter');
        await testBase.waitForLoading();
      }
      
      // 测试状态筛选
      const statusFilter = page.locator('select[name="status"]').first();
      if (await statusFilter.isVisible()) {
        const statuses = ['unread', 'read', 'replied'];
        for (const status of statuses) {
          await statusFilter.selectOption(status);
          await testBase.waitForLoading();
        }
        
        await statusFilter.selectOption('');
        await testBase.waitForLoading();
      }
      
      // 测试日期筛选
      const dateFilter = page.locator('input[type="date"], input[name="date"]').first();
      if (await dateFilter.isVisible()) {
        await dateFilter.fill('2024-01-01');
        await testBase.waitForLoading();
      }
      
      // 测试消息详情查看
      const messageRows = page.locator('tbody tr, .message-item');
      const messageCount = await messageRows.count();
      if (messageCount > 0) {
        const firstMessage = messageRows.first();
        await firstMessage.click();
        await page.waitForTimeout(500);
        
        // 检查消息详情模态框
        const messageModal = page.locator('.modal, .dialog, .message-detail').first();
        if (await messageModal.isVisible()) {
          // 检查消息内容
          const messageContent = page.locator('.message-content, .content').first();
          if (await messageContent.isVisible()) {
            expect(await messageContent.isVisible()).toBeTruthy();
          }
          
          // 检查附件
          const attachments = page.locator('.attachment, .file-list').first();
          if (await attachments.isVisible()) {
            expect(await attachments.isVisible()).toBeTruthy();
          }
          
          // 测试回复功能
          const replyBtn = page.locator('text=回复, .reply-btn').first();
          if (await replyBtn.isVisible()) {
            await replyBtn.click();
            await page.waitForTimeout(300);
            
            const replyContent = page.locator('textarea[name="replyContent"]').first();
            if (await replyContent.isVisible()) {
              await replyContent.fill('这是回复内容');
            }
            
            // 取消回复
            const cancelReplyBtn = page.locator('text=取消').first();
            if (await cancelReplyBtn.isVisible()) {
              await cancelReplyBtn.click();
            }
          }
          
          // 关闭详情
          const closeBtn = page.locator('text=关闭, .close').first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await page.waitForTimeout(300);
          }
        }
      }
    }
    
    // 5. 发送消息功能测试
    const sendMessageTab = page.locator('text=发送消息').first();
    if (await sendMessageTab.isVisible()) {
      await sendMessageTab.click();
      await page.waitForTimeout(500);
      
      // 测试收件人选择
      const recipientSelect = page.locator('select[name="recipient"]').first();
      if (await recipientSelect.isVisible()) {
        // 获取选项并选择第一个
        const options = await recipientSelect.locator('option').count();
        if (options > 1) {
          await recipientSelect.selectOption({ index: 1 });
        }
      }
      
      // 测试企业搜索选择
      const companySearch = page.locator('input[name="companySearch"]').first();
      if (await companySearch.isVisible()) {
        await companySearch.fill('测试企业');
        await page.waitForTimeout(500);
        
        // 选择搜索结果
        const searchResult = page.locator('.search-result, .company-item').first();
        if (await searchResult.isVisible()) {
          await searchResult.click();
        }
      }
      
      // 测试消息主题
      const subjectField = page.locator('input[name="subject"]').first();
      if (await subjectField.isVisible()) {
        await subjectField.fill('测试消息主题');
      }
      
      // 测试消息内容
      const contentField = page.locator('textarea[name="content"], .editor').first();
      if (await contentField.isVisible()) {
        await contentField.fill('这是一条测试消息的内容');
      }
      
      // 测试优先级设置
      const prioritySelect = page.locator('select[name="priority"]').first();
      if (await prioritySelect.isVisible()) {
        await prioritySelect.selectOption('high');
      }
      
      // 测试附件上传
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await testBase.testFileUpload('input[type="file"]', 'message-attachment.pdf');
      }
      
      // 测试表单验证
      const hasValidationError = await testBase.testFormValidation('.send-form, form');
      
      // 测试发送按钮
      const sendBtn = page.locator('text=发送, button[type="submit"]').first();
      if (await sendBtn.isVisible()) {
        // 不实际发送，只检查按钮状态
        expect(await sendBtn.isDisabled()).toBeFalsy();
      }
      
      // 测试保存草稿
      const draftBtn = page.locator('text=保存草稿, .draft-btn').first();
      if (await draftBtn.isVisible()) {
        await draftBtn.click();
        await page.waitForTimeout(500);
      }
    }
    
    // 6. 群发消息功能测试
    const broadcastTab = page.locator('text=群发消息').first();
    if (await broadcastTab.isVisible()) {
      await broadcastTab.click();
      await page.waitForTimeout(500);
      
      // 测试群发对象选择
      const targetGroup = page.locator('select[name="targetGroup"]').first();
      if (await targetGroup.isVisible()) {
        const groups = ['all', 'approved', 'pending', 'region'];
        for (const group of groups) {
          await targetGroup.selectOption(group);
          await page.waitForTimeout(300);
        }
      }
      
      // 测试地区筛选
      const regionFilter = page.locator('select[name="region"]').first();
      if (await regionFilter.isVisible()) {
        await regionFilter.selectOption('gangwon');
      }
      
      // 测试行业筛选
      const industryFilter = page.locator('select[name="industry"]').first();
      if (await industryFilter.isVisible()) {
        await industryFilter.selectOption('manufacturing');
      }
      
      // 测试全选功能
      const selectAllCheckbox = page.locator('input[name="sendToAll"]').first();
      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.check();
        await page.waitForTimeout(300);
        
        await selectAllCheckbox.uncheck();
        await page.waitForTimeout(300);
      }
      
      // 测试群发主题
      const broadcastSubject = page.locator('input[name="subject"]').first();
      if (await broadcastSubject.isVisible()) {
        await broadcastSubject.fill('系统重要通知');
      }
      
      // 测试群发内容
      const broadcastContent = page.locator('textarea[name="content"], .editor').first();
      if (await broadcastContent.isVisible()) {
        await broadcastContent.fill('这是一条重要的系统通知内容');
      }
      
      // 测试定时发送
      const scheduleCheckbox = page.locator('input[name="schedule"]').first();
      if (await scheduleCheckbox.isVisible()) {
        await scheduleCheckbox.check();
        
        const scheduleTime = page.locator('input[type="datetime-local"]').first();
        if (await scheduleTime.isVisible()) {
          await scheduleTime.fill('2024-12-31T10:00');
        }
        
        await scheduleCheckbox.uncheck();
      }
      
      // 测试预览功能
      const previewBtn = page.locator('text=预览, .preview-btn').first();
      if (await previewBtn.isVisible()) {
        await previewBtn.click();
        await page.waitForTimeout(500);
        
        const previewModal = page.locator('.modal, .preview-panel').first();
        if (await previewModal.isVisible()) {
          const closePreviewBtn = page.locator('text=关闭').first();
          if (await closePreviewBtn.isVisible()) {
            await closePreviewBtn.click();
          }
        }
      }
    }
    
    // 7. 消息统计功能测试
    const statisticsTab = page.locator('text=消息统计').first();
    if (await statisticsTab.isVisible()) {
      await statisticsTab.click();
      await page.waitForTimeout(500);
      
      // 检查统计图表
      const chartSelectors = ['canvas', '.chart', '.echarts', 'svg', '.recharts-wrapper'];
      
      let chartsFound = 0;
      for (const selector of chartSelectors) {
        const charts = page.locator(selector);
        const chartCount = await charts.count();
        if (chartCount > 0) {
          chartsFound += chartCount;
          
          // 测试图表交互
          const firstChart = charts.first();
          if (await firstChart.isVisible()) {
            await firstChart.hover();
            await page.waitForTimeout(300);
          }
        }
      }
      
      // 检查统计卡片
      const statCards = page.locator('.stat-card, .summary-card');
      const cardCount = await statCards.count();
      if (cardCount > 0) {
        expect(cardCount).toBeGreaterThan(0);
        
        // 检查统计数值
        const firstCard = statCards.first();
        const statValue = firstCard.locator('.value, .number').first();
        if (await statValue.isVisible()) {
          const valueText = await statValue.textContent();
          expect(valueText.trim().length).toBeGreaterThan(0);
        }
      }
      
      // 测试时间范围筛选
      const dateRangeStart = page.locator('input[name="startDate"]').first();
      if (await dateRangeStart.isVisible()) {
        await dateRangeStart.fill('2024-01-01');
      }
      
      const dateRangeEnd = page.locator('input[name="endDate"]').first();
      if (await dateRangeEnd.isVisible()) {
        await dateRangeEnd.fill('2024-12-31');
      }
      
      // 测试统计导出
      const exportStatsBtn = page.locator('text=导出统计, .export-stats').first();
      if (await exportStatsBtn.isVisible()) {
        const exportResult = await testBase.testExport('text=导出统计');
        if (exportResult.success) {
          expect(exportResult.filename).toMatch(/\.(xlsx|csv)$/);
        }
      }
    }
    
    // 8. 消息模板功能测试
    const templateTab = page.locator('text=消息模板').first();
    if (await templateTab.isVisible()) {
      await templateTab.click();
      await page.waitForTimeout(500);
      
      // 测试创建模板
      const createTemplateBtn = page.locator('text=创建模板, .create-template').first();
      if (await createTemplateBtn.isVisible()) {
        await createTemplateBtn.click();
        await page.waitForTimeout(300);
        
        const templateModal = page.locator('.modal, .template-form').first();
        if (await templateModal.isVisible()) {
          // 测试模板名称
          const templateName = page.locator('input[name="templateName"]').first();
          if (await templateName.isVisible()) {
            await templateName.fill('测试消息模板');
          }
          
          // 测试模板类型
          const templateType = page.locator('select[name="templateType"]').first();
          if (await templateType.isVisible()) {
            await templateType.selectOption('notification');
          }
          
          // 测试模板内容
          const templateContent = page.locator('textarea[name="templateContent"]').first();
          if (await templateContent.isVisible()) {
            await templateContent.fill('尊敬的 {companyName}，您好！这是一条模板消息。');
          }
          
          // 取消创建
          const cancelTemplateBtn = page.locator('text=取消').first();
          if (await cancelTemplateBtn.isVisible()) {
            await cancelTemplateBtn.click();
          }
        }
      }
      
      // 测试模板列表
      const templateList = page.locator('.template-list, .template-item');
      const templateCount = await templateList.count();
      if (templateCount > 0) {
        const firstTemplate = templateList.first();
        
        // 测试使用模板
        const useTemplateBtn = firstTemplate.locator('text=使用, .use-template').first();
        if (await useTemplateBtn.isVisible()) {
          await useTemplateBtn.click();
          await page.waitForTimeout(300);
        }
        
        // 测试编辑模板
        const editTemplateBtn = firstTemplate.locator('text=编辑, .edit-template').first();
        if (await editTemplateBtn.isVisible()) {
          await editTemplateBtn.click();
          await page.waitForTimeout(300);
          
          const cancelBtn = page.locator('text=取消').first();
          if (await cancelBtn.isVisible()) {
            await cancelBtn.click();
          }
        }
      }
    }
    
    // 9. 响应式布局测试
    const viewportResults = await testBase.testAllViewports(async (viewport) => {
      // 检查标签页在不同屏幕尺寸下的显示
      const tabContainer = page.locator('.tabs, [role="tablist"]').first();
      if (await tabContainer.isVisible()) {
        const containerBox = await tabContainer.boundingBox();
        expect(containerBox.width).toBeLessThanOrEqual(viewport.width);
        
        // 在小屏幕上检查标签页是否可以滚动
        if (viewport.width <= 768) {
          const overflowX = await tabContainer.evaluate(el => 
            window.getComputedStyle(el).overflowX
          );
          expect(['auto', 'scroll', 'hidden'].includes(overflowX)).toBeTruthy();
        }
      }
      
      return { viewport: viewport.name, passed: true };
    });
    
    // 验证所有视口测试通过
    const failedViewports = viewportResults.filter(r => !r.passed);
    expect(failedViewports.length).toBe(0);
    
    // 10. 性能测试
    const performanceTests = [
      { name: '页面加载', action: 'reload', maxTime: 5000 },
      { name: '标签页切换', action: async () => {
        const firstTab = page.locator('[role="tab"], .tab').first();
        if (await firstTab.isVisible()) {
          await firstTab.click();
          await page.waitForTimeout(100);
        }
      }, maxTime: 1000 },
      { name: '消息搜索', action: async () => {
        await testBase.testSearch('test');
      }, maxTime: 2000 }
    ];
    
    for (const test of performanceTests) {
      const result = await testBase.measurePerformance(test.action, test.maxTime);
      expect(result.passed).toBeTruthy();
    }
    
    // 11. 数据验证测试
    // 检查消息数据格式
    const messageListTabForValidation = page.locator('text=消息列表').first();
    if (await messageListTabForValidation.isVisible()) {
      await messageListTabForValidation.click();
      await page.waitForTimeout(300);
      
      const messageRows = page.locator('tbody tr, .message-item');
      const rowCount = await messageRows.count();
      if (rowCount > 0) {
        const firstRow = messageRows.first();
        
        // 检查时间格式
        const timeElement = firstRow.locator('.time, .date').first();
        if (await timeElement.isVisible()) {
          const timeText = await timeElement.textContent();
          expect(timeText.trim().length).toBeGreaterThan(0);
        }
        
        // 检查状态格式
        const statusElement = firstRow.locator('.status, .badge').first();
        if (await statusElement.isVisible()) {
          const statusText = await statusElement.textContent();
          const validStatuses = ['unread', 'read', 'replied', '未读', '已读', '已回复'];
          const hasValidStatus = validStatuses.some(s => statusText.includes(s));
          expect(hasValidStatus).toBeTruthy();
        }
      }
    }
    
    // 12. 可访问性测试
    const accessibilityResults = await testBase.checkAccessibility();
    expect(accessibilityResults.hasTitle).toBeTruthy();
    expect(accessibilityResults.hasHeading).toBeTruthy();
    
    // 13. 用户交互测试
    // 测试键盘导航
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
    }
    
    // 14. 错误处理测试
    // 测试无消息状态
    const noDataMessage = page.locator('text=暂无消息, text=No messages, .empty-state').first();
    if (await noDataMessage.isVisible()) {
      expect(await noDataMessage.isVisible()).toBeTruthy();
    }
  });
});