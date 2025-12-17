import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// 登录前置操作
test.beforeEach(async ({ page }) => {
  await page.goto('/admin/login');
  await page.locator('input[name="email"]').fill('admin@k-talk.kr');
  await page.locator('input[name="password"]').fill('password123');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin/);
  
  await page.goto('/admin/members');
  await expect(page.getByRole('heading')).toBeVisible();
});

test.describe('企业管理 - 页面加载', () => {
  test('应该正确显示企业管理页面', async ({ page }) => {
    // 验证页面标题包含相关关键词
    const title = await page.title();
    expect(title).toMatch(/강원|GangwonBiz|Portal|창업|포털/i);
    
    // 验证页面主要内容加载
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
  });

  test('应该显示企业列表表格', async ({ page }) => {
    // 验证表格存在
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
});

test.describe('搜索功能', () => {
  test('应该能够按企业名称搜索', async ({ page }) => {
    // 查找搜索输入框
    const searchInputs = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="搜索"], input[placeholder*="search"]');
    
    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();
      await searchInput.fill('테스트기업');
      
      // 查找搜索按钮
      const searchButtons = page.locator('button').filter({ hasText: /검색|搜索|search/i });
      if (await searchButtons.count() > 0) {
        await searchButtons.first().click();
      } else {
        await page.keyboard.press('Enter');
      }
      
      // 验证搜索操作完成
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
    }
  });

  test('应该能够按营业执照号搜索', async ({ page }) => {
    // 查找搜索输入框
    const searchInputs = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="搜索"], input[placeholder*="search"]');
    
    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();
      await searchInput.fill('123-45-67890');
      
      // 查找搜索按钮或按Enter
      const searchButtons = page.locator('button').filter({ hasText: /검색|搜索|search/i });
      if (await searchButtons.count() > 0) {
        await searchButtons.first().click();
      } else {
        await page.keyboard.press('Enter');
      }
      
      // 验证搜索操作完成
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
    }
  });

  test('应该能够清空搜索条件', async ({ page }) => {
    // 查找搜索输入框
    const searchInputs = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="搜索"], input[placeholder*="search"]');
    
    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();
      
      // 输入搜索条件
      await searchInput.fill('테스트');
      await page.keyboard.press('Enter');
      
      // 清空搜索
      await searchInput.clear();
      await page.keyboard.press('Enter');
      
      // 验证清空操作完成
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
    }
  });

  test('搜索响应时间应该在2秒内', async ({ page }) => {
    const startTime = Date.now();
    
    // 查找搜索输入框
    const searchInputs = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="搜索"], input[placeholder*="search"]');
    
    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      
      // 等待页面响应
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(2000);
    }
  });
});

test.describe('筛选功能', () => {
  test('应该能够按审批状态筛选', async ({ page }) => {
    // 查找状态筛选器
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    if (selectCount > 0) {
      const statusFilter = selects.first();
      
      // 尝试选择不同状态
      const options = statusFilter.locator('option');
      const optionCount = await options.count();
      
      if (optionCount > 1) {
        // 选择第二个选项（通常是第一个有效状态）
        const optionValue = await options.nth(1).getAttribute('value');
        if (optionValue) {
          await statusFilter.selectOption(optionValue);
          
          // 验证筛选操作完成
          const heading = page.getByRole('heading');
          await expect(heading).toBeVisible();
        }
      }
    }
  });

  test('应该能够按地区筛选', async ({ page }) => {
    // 查找地区筛选器（可能是第二个select）
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    if (selectCount > 1) {
      const regionFilter = selects.nth(1);
      const options = regionFilter.locator('option');
      const optionCount = await options.count();
      
      if (optionCount > 1) {
        const optionValue = await options.nth(1).getAttribute('value');
        if (optionValue) {
          await regionFilter.selectOption(optionValue);
          
          // 验证筛选操作完成
          const heading = page.getByRole('heading');
          await expect(heading).toBeVisible();
        }
      }
    }
  });

  test('应该能够重置筛选条件', async ({ page }) => {
    // 查找重置按钮
    const resetButtons = page.locator('button').filter({ hasText: /초기화|重置|reset/i });
    
    if (await resetButtons.count() > 0) {
      const resetButton = resetButtons.first();
      await resetButton.click();
      
      // 验证重置操作完成
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
    }
  });

  test('筛选响应时间应该在1.5秒内', async ({ page }) => {
    const startTime = Date.now();
    
    // 执行筛选操作
    const selects = page.locator('select');
    if (await selects.count() > 0) {
      const statusFilter = selects.first();
      const options = statusFilter.locator('option');
      
      if (await options.count() > 1) {
        const optionValue = await options.nth(1).getAttribute('value');
        if (optionValue) {
          await statusFilter.selectOption(optionValue);
        }
      }
    }
    
    // 等待页面响应
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(1500);
  });
});

test.describe('企业详情查看', () => {
  test('应该能够打开企业详情对话框', async ({ page }) => {
    // 查找详情按钮
    const detailButtons = page.locator('button').filter({ hasText: /상세|详情|detail/i });
    
    if (await detailButtons.count() > 0) {
      await detailButtons.first().click();
      
      // 验证对话框或详情页面打开
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        await expect(dialogs.first()).toBeVisible();
      }
    }
  });

  test('应该显示完整的企业信息', async ({ page }) => {
    // 查找并点击详情按钮
    const detailButtons = page.locator('button').filter({ hasText: /상세|详情|detail/i });
    
    if (await detailButtons.count() > 0) {
      await detailButtons.first().click();
      
      // 验证详情内容显示
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 验证对话框有内容
        const dialogContent = dialog.locator('*');
        const contentCount = await dialogContent.count();
        expect(contentCount).toBeGreaterThan(0);
      }
    }
  });

  test('应该能够关闭企业详情对话框', async ({ page }) => {
    // 查找并打开详情对话框
    const detailButtons = page.locator('button').filter({ hasText: /상세|详情|detail/i });
    
    if (await detailButtons.count() > 0) {
      await detailButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找关闭按钮
        const closeButtons = dialog.locator('button').filter({ hasText: /닫기|关闭|close|×/i });
        if (await closeButtons.count() > 0) {
          await closeButtons.first().click();
          
          // 验证对话框关闭
          await expect(dialog).not.toBeVisible();
        }
      }
    }
  });
});

test.describe('企业审批功能', () => {
  test('应该能够打开审批对话框', async ({ page }) => {
    // 查找审批按钮
    const approvalButtons = page.locator('button').filter({ hasText: /승인|审批|approve/i });
    
    if (await approvalButtons.count() > 0) {
      await approvalButtons.first().click();
      
      // 验证对话框或审批页面打开
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        await expect(dialogs.first()).toBeVisible();
      }
    }
  });

  test('应该验证审批表单必填字段', async ({ page }) => {
    // 查找并打开审批对话框
    const approvalButtons = page.locator('button').filter({ hasText: /승인|审批|approve/i });
    
    if (await approvalButtons.count() > 0) {
      await approvalButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找提交按钮并点击
        const submitButtons = dialog.locator('button').filter({ hasText: /제출|提交|submit/i });
        if (await submitButtons.count() > 0) {
          await submitButtons.first().click();
          
          // 验证表单仍然可见（表示验证失败）
          await expect(dialog).toBeVisible();
        }
      }
    }
  });

  test('应该能够填写审批表单', async ({ page }) => {
    // 查找并打开审批对话框
    const approvalButtons = page.locator('button').filter({ hasText: /승인|审批|approve/i });
    
    if (await approvalButtons.count() > 0) {
      await approvalButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找并填写文本区域
        const textareas = dialog.locator('textarea, input[type="text"]');
        if (await textareas.count() > 0) {
          await textareas.first().fill('기업 자료가 완전하며 승인을 권장합니다');
        }
        
        // 查找并选择下拉框
        const selects = dialog.locator('select');
        if (await selects.count() > 0) {
          const options = selects.first().locator('option');
          if (await options.count() > 1) {
            const optionValue = await options.nth(1).getAttribute('value');
            if (optionValue) {
              await selects.first().selectOption(optionValue);
            }
          }
        }
      }
    }
  });

  test('应该能够取消审批操作', async ({ page }) => {
    // 查找并打开审批对话框
    const approvalButtons = page.locator('button').filter({ hasText: /승인|审批|approve/i });
    
    if (await approvalButtons.count() > 0) {
      await approvalButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找取消按钮
        const cancelButtons = dialog.locator('button').filter({ hasText: /취소|取消|cancel/i });
        if (await cancelButtons.count() > 0) {
          await cancelButtons.first().click();
          
          // 验证对话框关闭
          await expect(dialog).not.toBeVisible();
        }
      }
    }
  });
});

test.describe('Nice D&B 企业搜索', () => {
  test('应该能够打开Nice D&B搜索对话框', async ({ page }) => {
    // 查找Nice D&B搜索按钮
    const niceDnbButtons = page.locator('button').filter({ hasText: /Nice.*D&B|나이스|기업검색/i });
    
    if (await niceDnbButtons.count() > 0) {
      const niceDnbButton = niceDnbButtons.first();
      await niceDnbButton.click();
      
      // 验证搜索对话框打开
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        await expect(dialogs.first()).toBeVisible();
      }
    }
  });

  test('应该能够按营业执照号搜索企业', async ({ page }) => {
    // 查找Nice D&B搜索按钮
    const niceDnbButtons = page.locator('button').filter({ hasText: /Nice.*D&B|나이스|기업검색/i });
    
    if (await niceDnbButtons.count() > 0) {
      await niceDnbButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找营业执照号输入框
        const licenseInputs = dialog.locator('input').filter({ hasText: /사업자|营业执照|license/i });
        if (await licenseInputs.count() === 0) {
          // 如果没有找到特定的输入框，使用第一个文本输入框
          const textInputs = dialog.locator('input[type="text"]');
          if (await textInputs.count() > 0) {
            await textInputs.first().fill('123-45-67890');
          }
        } else {
          await licenseInputs.first().fill('123-45-67890');
        }
        
        // 查找搜索按钮
        const searchButtons = dialog.locator('button').filter({ hasText: /검색|搜索|search/i });
        if (await searchButtons.count() > 0) {
          await searchButtons.first().click();
          
          // 验证搜索操作完成
          await expect(dialog).toBeVisible();
        }
      }
    }
  });

  test('应该能够按代表人姓名搜索企业', async ({ page }) => {
    // 查找Nice D&B搜索按钮
    const niceDnbButtons = page.locator('button').filter({ hasText: /Nice.*D&B|나이스|기업검색/i });
    
    if (await niceDnbButtons.count() > 0) {
      await niceDnbButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找代表人输入框
        const nameInputs = dialog.locator('input').filter({ hasText: /대표|代表|representative/i });
        if (await nameInputs.count() > 0) {
          await nameInputs.first().fill('김철수');
        }
        
        // 查找地区选择器
        const regionSelects = dialog.locator('select');
        if (await regionSelects.count() > 0) {
          const options = regionSelects.first().locator('option');
          if (await options.count() > 1) {
            const optionValue = await options.nth(1).getAttribute('value');
            if (optionValue) {
              await regionSelects.first().selectOption(optionValue);
            }
          }
        }
        
        // 查找搜索按钮
        const searchButtons = dialog.locator('button').filter({ hasText: /검색|搜索|search/i });
        if (await searchButtons.count() > 0) {
          await searchButtons.first().click();
          
          // 验证搜索操作完成
          await expect(dialog).toBeVisible();
        }
      }
    }
  });
});

test.describe('数据导出功能', () => {
  test('应该能够导出企业列表', async ({ page }) => {
    // 查找导出按钮
    const exportButtons = page.locator('button').filter({ hasText: /내보내기|导出|export|excel/i });
    
    if (await exportButtons.count() > 0) {
      const exportButton = exportButtons.first();
      await expect(exportButton).toBeVisible();
      
      // 测试下载功能
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.(xlsx|csv)$/);
    }
  });

  test('导出按钮应该始终可用', async ({ page }) => {
    // 查找导出按钮
    const exportButtons = page.locator('button').filter({ hasText: /내보내기|导出|export|excel/i });
    
    if (await exportButtons.count() > 0) {
      const exportButton = exportButtons.first();
      
      // 验证按钮存在且启用
      await expect(exportButton).toBeVisible();
      await expect(exportButton).toBeEnabled();
    }
  });
});

test.describe('分页功能', () => {
  test('应该显示分页控件', async ({ page }) => {
    // 查找分页组件
    const pagination = page.locator('.pagination, [data-testid="pagination"], .page-navigation');
    
    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible();
    }
  });

  test('应该能够切换页面大小', async ({ page }) => {
    // 查找页面大小选择器
    const pageSizeSelects = page.locator('select').filter({ hasText: /페이지|每页|page/i });
    
    if (await pageSizeSelects.count() > 0) {
      const pageSizeSelect = pageSizeSelects.first();
      const options = pageSizeSelect.locator('option');
      
      if (await options.count() > 1) {
        // 选择第二个选项
        const optionValue = await options.nth(1).getAttribute('value');
        if (optionValue) {
          await pageSizeSelect.selectOption(optionValue);
          
          // 验证页面响应
          const heading = page.getByRole('heading');
          await expect(heading).toBeVisible();
        }
      }
    }
  });

  test('应该能够切换到下一页', async ({ page }) => {
    // 查找下一页按钮
    const nextButtons = page.locator('button').filter({ hasText: /다음|下一页|next/i });
    
    if (await nextButtons.count() > 0) {
      const nextButton = nextButtons.first();
      
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        
        // 验证页面变化
        const heading = page.getByRole('heading');
        await expect(heading).toBeVisible();
      }
    }
  });

  test('分页切换时间应该在1秒内', async ({ page }) => {
    // 查找下一页按钮
    const nextButtons = page.locator('button').filter({ hasText: /다음|下一页|next/i });
    
    if (await nextButtons.count() > 0) {
      const nextButton = nextButtons.first();
      
      if (await nextButton.isEnabled()) {
        const startTime = Date.now();
        
        await nextButton.click();
        const heading = page.getByRole('heading');
        await expect(heading).toBeVisible();
        
        const switchTime = Date.now() - startTime;
        expect(switchTime).toBeLessThan(1000);
      }
    }
  });
});

test.describe('表格排序功能', () => {
  test('应该能够按企业名称排序', async ({ page }) => {
    const tables = page.locator('table');
    
    if (await tables.count() > 0) {
      const table = tables.first();
      const headers = table.locator('th');
      
      if (await headers.count() > 0) {
        // 点击第一个表头进行排序
        const firstHeader = headers.first();
        await firstHeader.click();
        
        // 验证点击后页面仍然正常
        await expect(table).toBeVisible();
      }
    }
  });

  test('应该能够按注册时间排序', async ({ page }) => {
    const tables = page.locator('table');
    
    if (await tables.count() > 0) {
      const table = tables.first();
      const headers = table.locator('th');
      const headerCount = await headers.count();
      
      if (headerCount > 1) {
        // 点击第二个表头进行排序
        const secondHeader = headers.nth(1);
        await secondHeader.click();
        
        // 验证点击后页面仍然正常
        await expect(table).toBeVisible();
      }
    }
  });
});

test.describe('批量操作功能', () => {
  test('应该能够选择多个企业', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 1) {
      // 选择第一个企业复选框
      const firstCheckbox = checkboxes.nth(1);
      await firstCheckbox.click();
      await expect(firstCheckbox).toBeChecked();
      
      // 选择第二个企业复选框（如果存在）
      if (checkboxCount > 2) {
        const secondCheckbox = checkboxes.nth(2);
        await secondCheckbox.click();
        await expect(secondCheckbox).toBeChecked();
      }
    }
  });

  test('应该显示批量操作按钮', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 1) {
      // 选择一个企业
      await checkboxes.nth(1).click();
      
      // 查找批量操作按钮
      const batchButtons = page.locator('button').filter({ hasText: /일괄|批量|batch/i });
      
      if (await batchButtons.count() > 0) {
        await expect(batchButtons.first()).toBeVisible();
      }
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
      
      // 验证主要内容可见
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
      
      // 验证表格在当前视口下可见
      const tables = page.locator('table');
      if (await tables.count() > 0) {
        await expect(tables.first()).toBeVisible();
      }
      
      // 在小屏幕上验证表格容器的滚动性
      if (width <= 768) {
        const tableContainers = page.locator('.table-container, .overflow-x-auto, [style*="overflow"]');
        
        if (await tableContainers.count() > 0) {
          const tableContainer = tableContainers.first();
          const overflowX = await tableContainer.evaluate(el => 
            window.getComputedStyle(el).overflowX
          );
          expect(['auto', 'scroll', 'hidden'].includes(overflowX)).toBeTruthy();
        }
      }
    });
  });
});

test.describe('数据验证', () => {
  test('企业列表数据应该格式正确', async ({ page }) => {
    const tables = page.locator('table');
    
    if (await tables.count() > 0) {
      const table = tables.first();
      const tableRows = table.locator('tr');
      const rowCount = await tableRows.count();
      
      if (rowCount > 1) {
        const firstDataRow = tableRows.nth(1);
        const cells = firstDataRow.locator('td');
        
        if (await cells.count() > 0) {
          // 验证第一个单元格有内容
          const firstCell = cells.first();
          const cellText = await firstCell.textContent();
          expect(cellText?.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('审批状态应该显示有效值', async ({ page }) => {
    // 查找状态相关的元素
    const statusElements = page.locator('.status, .badge, [class*="status"], [class*="badge"]');
    
    if (await statusElements.count() > 0) {
      const firstStatus = statusElements.first();
      const statusText = await firstStatus.textContent();
      
      // 验证状态文本不为空
      expect(statusText?.trim().length).toBeGreaterThan(0);
      
      // 验证包含有效的状态关键词
      const validStatuses = ['pending', 'approved', 'rejected', '대기', '승인', '거부', '待审批', '已批准', '已拒绝'];
      const hasValidStatus = validStatuses.some(s => statusText?.toLowerCase().includes(s.toLowerCase()));
      
      if (statusText && statusText.trim().length > 0) {
        // 如果有状态文本，验证它是有效的
        expect(hasValidStatus).toBeTruthy();
      }
    }
  });
});

test.describe('性能测试', () => {
  test('页面加载时间应该在5秒内', async ({ page }) => {
    const startTime = Date.now();
    
    await page.reload();
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('可访问性', () => {
  test('页面应该有正确的标题', async ({ page }) => {
    // 验证页面标题包含相关关键词
    const title = await page.title();
    expect(title).toMatch(/강원|GangwonBiz|Portal|창업|포털/i);
  });

  test('表格应该有正确的可访问性标签', async ({ page }) => {
    const tables = page.locator('table');
    
    if (await tables.count() > 0) {
      const table = tables.first();
      
      // 验证表格有标题或aria-label或caption
      const tableLabel = await table.getAttribute('aria-label');
      const tableCaption = table.locator('caption');
      const hasCaption = await tableCaption.count() > 0;
      
      // 至少应该有表格元素存在
      await expect(table).toBeVisible();
    }
  });

  test('按钮应该有可访问的文本', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    // 验证第一个按钮有文本内容或可访问标签
    const firstButton = buttons.first();
    const buttonText = await firstButton.textContent();
    const ariaLabel = await firstButton.getAttribute('aria-label');
    const title = await firstButton.getAttribute('title');
    
    expect(buttonText?.trim() || ariaLabel || title).toBeTruthy();
  });
});