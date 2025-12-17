import { test as base, expect } from '@playwright/test';

/**
 * 简化的测试基础工具类 - 遵循新的测试规则
 * 
 * 规则：
 * 1. 禁止使用 waitForTimeout
 * 2. 必须使用事件驱动等待
 * 3. 优先使用 getByRole / getByTestId
 * 4. 所有操作后必须有明确断言
 */
export class TestBase {
  constructor(page) {
    this.page = page;
  }

  /**
   * 管理员登录 - 使用事件驱动等待
   */
  async adminLogin() {
    await this.page.goto('/admin/login');
    
    // 使用 getByRole 定位表单元素
    await this.page.getByRole('textbox', { name: 'email' }).fill('admin@k-talk.kr');
    await this.page.getByRole('textbox', { name: 'password' }).fill('password123');
    await this.page.getByRole('button', { name: 'submit' }).click();
    
    // 使用事件驱动等待，而不是 waitForTimeout
    await expect(this.page).toHaveURL(/\/admin/);
  }

  /**
   * 等待加载完成 - 使用事件驱动等待
   */
  async waitForContentLoad() {
    // 等待主要内容区域可见
    await expect(this.page.getByTestId('main-content')).toBeVisible();
  }

  /**
   * 测试表单验证 - 返回明确的断言结果
   */
  async expectFormValidationError(formTestId = 'form') {
    const form = this.page.getByTestId(formTestId);
    
    // 提交空表单
    await form.getByRole('button', { name: 'submit' }).click();
    
    // 明确断言验证错误存在
    await expect(this.page.getByTestId('validation-error')).toBeVisible();
  }

  /**
   * 测试搜索功能 - 使用明确的断言
   */
  async performSearch(searchTerm, expectedResult = true) {
    const searchInput = this.page.getByRole('searchbox');
    
    await searchInput.fill(searchTerm);
    await this.page.getByRole('button', { name: 'search' }).click();
    
    if (expectedResult) {
      // 断言搜索结果显示
      await expect(this.page.getByTestId('search-results')).toBeVisible();
    } else {
      // 断言无结果状态
      await expect(this.page.getByTestId('no-results')).toBeVisible();
    }
  }

  /**
   * 测试分页功能 - 使用明确的断言
   */
  async testPaginationNavigation() {
    const nextButton = this.page.getByRole('button', { name: 'next' });
    
    // 只有在按钮可用时才测试
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      
      // 断言页面内容更新
      await expect(this.page.getByTestId('content-area')).toBeVisible();
      
      // 测试返回上一页
      const prevButton = this.page.getByRole('button', { name: 'previous' });
      if (await prevButton.isEnabled()) {
        await prevButton.click();
        await expect(this.page.getByTestId('content-area')).toBeVisible();
      }
    }
  }

  /**
   * 测试模态框操作 - 使用明确的断言
   */
  async openAndCloseModal(triggerButtonName, modalTestId) {
    // 打开模态框
    await this.page.getByRole('button', { name: triggerButtonName }).click();
    await expect(this.page.getByTestId(modalTestId)).toBeVisible();
    
    // 关闭模态框
    await this.page.getByRole('button', { name: 'cancel' }).click();
    await expect(this.page.getByTestId(modalTestId)).not.toBeVisible();
  }

  /**
   * 测试文件上传 - 使用明确的断言
   */
  async uploadFile(fileInputTestId, fileName = 'test.txt') {
    const fileInput = this.page.getByTestId(fileInputTestId);
    
    // 创建测试文件
    const buffer = Buffer.from('测试文件内容');
    
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: buffer
    });
    
    // 断言文件上传成功
    await expect(this.page.getByTestId('upload-success')).toBeVisible();
  }

  /**
   * 测试导出功能 - 返回明确的结果
   */
  async testExportDownload(exportButtonName) {
    const downloadPromise = this.page.waitForEvent('download');
    
    await this.page.getByRole('button', { name: exportButtonName }).click();
    
    const download = await downloadPromise;
    
    // 返回下载结果供断言使用
    return {
      filename: download.suggestedFilename(),
      success: true
    };
  }

  /**
   * 测试响应式布局 - 使用明确的断言
   */
  async testResponsiveLayout(contentTestId) {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      
      // 断言内容在当前视口下可见
      await expect(this.page.getByTestId(contentTestId)).toBeVisible();
    }

    // 恢复桌面视口
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  /**
   * 性能测试 - 返回可断言的结果
   */
  async measurePageLoadTime() {
    const startTime = Date.now();
    
    await this.page.reload();
    await expect(this.page.getByRole('heading')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    return {
      duration: loadTime,
      withinLimit: loadTime < 5000
    };
  }

  /**
   * 检查可访问性 - 返回可断言的结果
   */
  async checkPageAccessibility() {
    // 检查页面标题
    const title = await this.page.title();
    
    // 检查主标题
    const hasMainHeading = await this.page.getByRole('heading', { level: 1 }).isVisible();
    
    return {
      hasTitle: title.length > 0,
      hasMainHeading,
      titleContent: title
    };
  }
}

export const test = base.extend({
  testBase: async ({ page }, use) => {
    await use(new TestBase(page));
  },
});

export { expect };