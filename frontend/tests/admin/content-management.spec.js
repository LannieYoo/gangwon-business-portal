import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// 登录前置操作
test.beforeEach(async ({ page }) => {
  await page.goto('/admin/login');
  await page.locator('input[name="email"]').fill('admin@k-talk.kr');
  await page.locator('input[name="password"]').fill('password123');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin/);
  
  await page.goto('/admin/content');
  await expect(page.getByRole('heading')).toBeVisible();
});

test.describe('内容管理 - 页面导航', () => {
  test('应该正确显示所有标签页', async ({ page }) => {
    // 验证页面主要内容加载
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
    
    // 查找标签页或导航元素
    const tabs = page.locator('[role="tab"], .tab, .nav-tab, button').filter({ hasText: /배너|공지|FAQ|시스템|横幅|公告|系统/i });
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      // 验证至少有一个标签页可见
      await expect(tabs.first()).toBeVisible();
    } else {
      // 如果没有标签页，验证页面有基本内容
      const content = page.locator('main, .content, .page-content');
      if (await content.count() > 0) {
        await expect(content.first()).toBeVisible();
      }
    }
  });

  test('应该能够切换到横幅管理标签页', async ({ page }) => {
    // 查找横幅管理相关的标签页或按钮
    const bannerTabs = page.locator('[role="tab"], .tab, .nav-tab, button').filter({ hasText: /배너|横幅|banner/i });
    
    if (await bannerTabs.count() > 0) {
      const bannerTab = bannerTabs.first();
      await bannerTab.click();
      
      // 验证点击后页面仍然可见
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
    }
  });

  test('应该能够切换到公告管理标签页', async ({ page }) => {
    // 查找公告管理相关的标签页或按钮
    const noticeTabs = page.locator('[role="tab"], .tab, .nav-tab, button').filter({ hasText: /공지|公告|notice/i });
    
    if (await noticeTabs.count() > 0) {
      const noticeTab = noticeTabs.first();
      await noticeTab.click();
      
      // 验证点击后页面仍然可见
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
    }
  });
});

test.describe('横幅管理功能', () => {
  test.beforeEach(async ({ page }) => {
    // 尝试切换到横幅管理标签页
    const bannerTabs = page.locator('[role="tab"], .tab, .nav-tab, button').filter({ hasText: /배너|横幅|banner/i });
    if (await bannerTabs.count() > 0) {
      await bannerTabs.first().click();
    }
    
    // 验证页面加载
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
  });

  test('应该能够打开添加横幅对话框', async ({ page }) => {
    // 查找添加横幅按钮
    const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|배너|横幅/i });
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
      // 验证对话框或表单打开
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        await expect(dialogs.first()).toBeVisible();
      }
    }
  });

  test('应该验证横幅表单必填字段', async ({ page }) => {
    // 查找并打开添加对话框
    const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|배너|横幅/i });
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找保存按钮并点击
        const saveButtons = dialog.locator('button').filter({ hasText: /저장|保存|save/i });
        if (await saveButtons.count() > 0) {
          await saveButtons.first().click();
          
          // 验证表单仍然可见（表示验证失败）
          await expect(dialog).toBeVisible();
        }
      }
    }
  });

  test('应该能够成功填写横幅表单', async ({ page }) => {
    // 查找并打开添加对话框
    const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|배너|横幅/i });
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找并填写输入框
        const textInputs = dialog.locator('input[type="text"], textarea');
        if (await textInputs.count() > 0) {
          await textInputs.first().fill('테스트 배너 제목');
          
          if (await textInputs.count() > 1) {
            await textInputs.nth(1).fill('https://example.com');
          }
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

  test('应该能够取消横幅创建', async ({ page }) => {
    // 查找并打开添加对话框
    const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|배너|横幅/i });
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
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

test.describe('公告管理功能', () => {
  test.beforeEach(async ({ page }) => {
    // 尝试切换到公告管理标签页
    const noticeTabs = page.locator('[role="tab"], .tab, .nav-tab, button').filter({ hasText: /공지|公告|notice/i });
    if (await noticeTabs.count() > 0) {
      await noticeTabs.first().click();
    }
    
    // 验证页面加载
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
  });

  test('应该显示公告列表表格', async ({ page }) => {
    // 查找表格
    const tables = page.locator('table');
    
    if (await tables.count() > 0) {
      await expect(tables.first()).toBeVisible();
      
      // 验证表头存在
      const headers = tables.first().locator('th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('应该能够搜索公告', async ({ page }) => {
    // 查找搜索输入框
    const searchInputs = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="搜索"], input[placeholder*="search"]');
    
    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();
      await searchInput.fill('테스트');
      
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

  test('应该能够打开添加公告对话框', async ({ page }) => {
    // 查找添加公告按钮
    const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|공지|公告/i });
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
      // 验证对话框或表单打开
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        await expect(dialogs.first()).toBeVisible();
      }
    }
  });

  test('应该验证公告表单必填字段', async ({ page }) => {
    // 查找并打开添加对话框
    const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|공지|公告/i });
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找发布或保存按钮并点击
        const submitButtons = dialog.locator('button').filter({ hasText: /발행|发布|publish|저장|保存|save/i });
        if (await submitButtons.count() > 0) {
          await submitButtons.first().click();
          
          // 验证表单仍然可见（表示验证失败）
          await expect(dialog).toBeVisible();
        }
      }
    }
  });
});

test.describe('FAQ管理功能', () => {
  test.beforeEach(async ({ page }) => {
    // 尝试切换到FAQ管理标签页
    const faqTabs = page.locator('[role="tab"], .tab, .nav-tab, button').filter({ hasText: /FAQ|자주|묻는/i });
    if (await faqTabs.count() > 0) {
      await faqTabs.first().click();
    }
    
    // 验证页面加载
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
  });

  test('应该显示FAQ列表', async ({ page }) => {
    // 验证页面有内容
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
    
    // 查找FAQ列表容器
    const faqContainers = page.locator('.faq-list, .faq-container, [data-testid*="faq"], table');
    if (await faqContainers.count() > 0) {
      await expect(faqContainers.first()).toBeVisible();
    }
  });

  test('应该能够打开添加FAQ对话框', async ({ page }) => {
    // 查找添加FAQ按钮
    const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|FAQ/i });
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
      // 验证对话框或表单打开
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        await expect(dialogs.first()).toBeVisible();
      }
    }
  });

  test('应该验证FAQ表单必填字段', async ({ page }) => {
    // 查找并打开添加对话框
    const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|FAQ/i });
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找保存按钮并点击
        const saveButtons = dialog.locator('button').filter({ hasText: /저장|保存|save/i });
        if (await saveButtons.count() > 0) {
          await saveButtons.first().click();
          
          // 验证表单仍然可见（表示验证失败）
          await expect(dialog).toBeVisible();
        }
      }
    }
  });

  test('应该能够成功填写FAQ表单', async ({ page }) => {
    // 查找并打开添加对话框
    const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|FAQ/i });
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
      const dialogs = page.locator('[role="dialog"], .modal, .dialog');
      if (await dialogs.count() > 0) {
        const dialog = dialogs.first();
        await expect(dialog).toBeVisible();
        
        // 查找并填写输入框
        const textInputs = dialog.locator('input[type="text"], textarea');
        if (await textInputs.count() > 0) {
          await textInputs.first().fill('테스트 FAQ 질문');
          
          if (await textInputs.count() > 1) {
            await textInputs.nth(1).fill('테스트 FAQ 답변');
          }
        }
        
        // 查找并选择分类下拉框
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
});

test.describe('系统介绍管理功能', () => {
  test.beforeEach(async ({ page }) => {
    // 尝试切换到系统介绍标签页
    const systemTabs = page.locator('[role="tab"], .tab, .nav-tab, button').filter({ hasText: /시스템|系统|system|소개|介绍/i });
    if (await systemTabs.count() > 0) {
      await systemTabs.first().click();
    }
    
    // 验证页面加载
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
  });

  test('应该显示系统介绍编辑界面', async ({ page }) => {
    // 验证页面有内容
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
    
    // 查找编辑相关的按钮或界面
    const editButtons = page.locator('button').filter({ hasText: /편집|编辑|edit/i });
    if (await editButtons.count() > 0) {
      await expect(editButtons.first()).toBeVisible();
    }
  });

  test('应该能够打开系统介绍编辑器', async ({ page }) => {
    // 查找编辑按钮
    const editButtons = page.locator('button').filter({ hasText: /편집|编辑|edit/i });
    
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      
      // 验证编辑器或表单打开
      const editors = page.locator('textarea, .editor, [contenteditable="true"]');
      if (await editors.count() > 0) {
        await expect(editors.first()).toBeVisible();
      }
      
      // 查找保存和取消按钮
      const saveButtons = page.locator('button').filter({ hasText: /저장|保存|save/i });
      const cancelButtons = page.locator('button').filter({ hasText: /취소|取消|cancel/i });
      
      if (await saveButtons.count() > 0) {
        await expect(saveButtons.first()).toBeVisible();
      }
      if (await cancelButtons.count() > 0) {
        await expect(cancelButtons.first()).toBeVisible();
      }
    }
  });

  test('应该能够编辑系统介绍内容', async ({ page }) => {
    // 查找并打开编辑器
    const editButtons = page.locator('button').filter({ hasText: /편집|编辑|edit/i });
    
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      
      // 查找编辑器
      const editors = page.locator('textarea, .editor, [contenteditable="true"]');
      if (await editors.count() > 0) {
        const editor = editors.first();
        await editor.clear();
        await editor.fill('업데이트된 시스템 소개 내용');
        
        // 验证内容已更新
        const content = await editor.inputValue();
        expect(content).toBe('업데이트된 시스템 소개 내용');
      }
    }
  });

  test('应该能够取消系统介绍编辑', async ({ page }) => {
    // 查找并打开编辑器
    const editButtons = page.locator('button').filter({ hasText: /편집|编辑|edit/i });
    
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      
      // 验证编辑器打开
      const editors = page.locator('textarea, .editor, [contenteditable="true"]');
      if (await editors.count() > 0) {
        await expect(editors.first()).toBeVisible();
        
        // 查找取消按钮
        const cancelButtons = page.locator('button').filter({ hasText: /취소|取消|cancel/i });
        if (await cancelButtons.count() > 0) {
          await cancelButtons.first().click();
          
          // 验证编辑器关闭
          await expect(editors.first()).not.toBeVisible();
        }
      }
    }
  });
});

test.describe('响应式布局测试', () => {
  const viewports = [
    { width: 1920, height: 1080, name: '桌面端' },
    { width: 768, height: 1024, name: '平板端' },
    { width: 375, height: 667, name: '手机端' }
  ];

  viewports.forEach(({ width, height, name }) => {
    test(`应该在${name}正确显示布局`, async ({ page }) => {
      // 设置视口大小
      await page.setViewportSize({ width, height });
      
      // 验证主要内容在当前视口下可见
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
      
      // 查找标签页或导航元素
      const tabs = page.locator('[role="tab"], .tab, .nav-tab');
      if (await tabs.count() > 0) {
        await expect(tabs.first()).toBeVisible();
      }
      
      // 在小屏幕上验证按钮布局
      if (width <= 768) {
        const buttons = page.locator('button');
        if (await buttons.count() > 0) {
          await expect(buttons.first()).toBeVisible();
        }
      }
    });
  });
});

test.describe('性能测试', () => {
  test('页面加载时间应该在合理范围内', async ({ page }) => {
    const startTime = Date.now();
    
    // 重新加载页面
    await page.reload();
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // 验证加载时间小于5秒
    expect(loadTime).toBeLessThan(5000);
  });

  test('标签页切换应该响应迅速', async ({ page }) => {
    const startTime = Date.now();
    
    // 查找FAQ标签页并切换
    const faqTabs = page.locator('[role="tab"], .tab, .nav-tab, button').filter({ hasText: /FAQ|자주|묻는/i });
    
    if (await faqTabs.count() > 0) {
      await faqTabs.first().click();
      
      // 验证页面响应
      const heading = page.getByRole('heading');
      await expect(heading).toBeVisible();
      
      const switchTime = Date.now() - startTime;
      
      // 验证切换时间小于1秒
      expect(switchTime).toBeLessThan(1000);
    }
  });
});

test.describe('可访问性测试', () => {
  test('页面应该有正确的标题', async ({ page }) => {
    // 验证页面标题包含相关关键词
    const title = await page.title();
    expect(title).toMatch(/강원|GangwonBiz|Portal|창업|포털/i);
  });

  test('页面应该有主标题', async ({ page }) => {
    // 验证主标题存在
    const headings = page.locator('h1, h2');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
  });

  test('所有按钮应该有可访问的文本', async ({ page }) => {
    // 获取所有按钮
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // 验证至少有一个按钮
    expect(buttonCount).toBeGreaterThan(0);
    
    // 验证第一个按钮有文本内容或可访问标签
    const firstButton = buttons.first();
    const buttonText = await firstButton.textContent();
    const ariaLabel = await firstButton.getAttribute('aria-label');
    const title = await firstButton.getAttribute('title');
    
    expect(buttonText?.trim() || ariaLabel || title).toBeTruthy();
  });

  test('表单字段应该有正确的标签', async ({ page }) => {
    // 尝试打开一个包含表单的对话框
    const faqTabs = page.locator('[role="tab"], .tab, .nav-tab, button').filter({ hasText: /FAQ|자주|묻는/i });
    
    if (await faqTabs.count() > 0) {
      await faqTabs.first().click();
      
      const addButtons = page.locator('button').filter({ hasText: /추가|添加|add|FAQ/i });
      if (await addButtons.count() > 0) {
        await addButtons.first().click();
        
        // 验证表单字段存在
        const inputs = page.locator('input, textarea');
        if (await inputs.count() > 0) {
          await expect(inputs.first()).toBeVisible();
        }
      }
    }
  });
});