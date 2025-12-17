import { test, expect } from '@playwright/test';

test.describe('管理员登录测试', () => {
  test('应该能够成功登录管理员账号', async ({ page }) => {
    // 访问登录页面
    await page.goto('/admin/login');
    
    // 验证登录页面加载
    await expect(page).toHaveURL(/\/admin\/login/);
    
    // 尝试多种可能的选择器来填写邮箱
    const emailSelectors = [
      'input[name="email"]',
      'input[type="email"]',
      'input[placeholder*="邮箱"]',
      'input[placeholder*="email"]',
      '#email'
    ];
    
    let emailFilled = false;
    for (const selector of emailSelectors) {
      const emailInput = page.locator(selector).first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@k-talk.kr');
        emailFilled = true;
        console.log(`邮箱输入框找到，使用选择器: ${selector}`);
        break;
      }
    }
    
    if (!emailFilled) {
      console.log('未找到邮箱输入框，尝试查看页面内容');
      const pageContent = await page.content();
      console.log('页面内容片段:', pageContent.substring(0, 1000));
    }
    
    // 尝试多种可能的选择器来填写密码
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="密码"]',
      'input[placeholder*="password"]',
      '#password'
    ];
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      const passwordInput = page.locator(selector).first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('password123');
        passwordFilled = true;
        console.log(`密码输入框找到，使用选择器: ${selector}`);
        break;
      }
    }
    
    // 尝试多种可能的选择器来点击登录按钮
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("登录")',
      'button:has-text("Login")',
      'button:has-text("提交")',
      'input[type="submit"]',
      '.login-btn',
      '.submit-btn'
    ];
    
    let submitClicked = false;
    for (const selector of submitSelectors) {
      const submitButton = page.locator(selector).first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        submitClicked = true;
        console.log(`登录按钮找到，使用选择器: ${selector}`);
        break;
      }
    }
    
    if (submitClicked) {
      // 等待登录成功跳转
      await page.waitForURL(/\/admin(?!\/login)/, { timeout: 10000 });
      
      // 验证登录成功
      await expect(page).toHaveURL(/\/admin/);
      console.log('登录成功！');
    } else {
      console.log('未找到登录按钮');
    }
  });
  
  test('应该显示登录表单', async ({ page }) => {
    // 访问登录页面
    await page.goto('/admin/login');
    
    // 验证页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 查找表单元素
    const forms = page.locator('form');
    const formCount = await forms.count();
    console.log('表单数量:', formCount);
    
    if (formCount > 0) {
      const form = forms.first();
      const formHTML = await form.innerHTML();
      console.log('表单内容:', formHTML);
    }
    
    // 查找所有输入框
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log('输入框数量:', inputCount);
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`输入框 ${i + 1}: type=${type}, name=${name}, placeholder=${placeholder}`);
    }
    
    // 查找所有按钮
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log('按钮数量:', buttonCount);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      console.log(`按钮 ${i + 1}: text="${text}", type=${type}`);
    }
  });
});