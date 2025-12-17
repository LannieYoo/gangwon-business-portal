/**
 * Admin Layouts Tests - Admin Portal
 * 管理员端布局组件测试
 */

import { test, expect } from '@playwright/test';
import { AdminTestBase } from '../utils/test-base.js';

class LayoutsTestBase extends AdminTestBase {
  constructor(page) {
    super(page);
  }

  // Header operations
  async clickMobileMenuToggle() {
    await this.page.click('[data-testid="mobile-menu-toggle"]');
  }

  async clickUserMenu() {
    await this.page.click('[data-testid="user-menu-button"]');
  }

  async clickLogout() {
    await this.page.click('[data-testid="logout-button"]');
  }

  async switchLanguage(language) {
    await this.page.click('[data-testid="language-switcher"]');
    await this.page.click(`[data-testid="language-${language}"]`);
  }

  // Sidebar operations
  async clickSidebarItem(itemKey) {
    await this.page.click(`[data-testid="sidebar-${itemKey}"]`);
  }

  async closeMobileSidebar() {
    await this.page.click('[data-testid="mobile-sidebar-overlay"]');
  }

  // Assertions
  async expectHeaderVisible() {
    await expect(this.page.locator('[data-testid="admin-header"]')).toBeVisible();
  }

  async expectSidebarVisible() {
    await expect(this.page.locator('[data-testid="admin-sidebar"]')).toBeVisible();
  }

  async expectUserMenuOpen() {
    await expect(this.page.locator('[data-testid="user-menu-dropdown"]')).toBeVisible();
  }

  async expectUserMenuClosed() {
    await expect(this.page.locator('[data-testid="user-menu-dropdown"]')).not.toBeVisible();
  }

  async expectMobileSidebarOpen() {
    await expect(this.page.locator('[data-testid="admin-sidebar"]')).toHaveClass(/translate-x-0/);
  }

  async expectMobileSidebarClosed() {
    await expect(this.page.locator('[data-testid="admin-sidebar"]')).toHaveClass(/-translate-x-full/);
  }

  async expectActiveMenuItem(itemKey) {
    await expect(this.page.locator(`[data-testid="sidebar-${itemKey}"]`)).toHaveClass(/bg-blue-50/);
  }
}

test.describe('Admin Layouts', () => {
  let layoutsTest;

  test.beforeEach(async ({ page }) => {
    layoutsTest = new LayoutsTestBase(page);
    await layoutsTest.login();
    await layoutsTest.page.goto('/admin');
  });

  test.describe('Admin Layout', () => {
    test('should render main layout components', async () => {
      // Check if all main layout components are visible
      await layoutsTest.expectHeaderVisible();
      await layoutsTest.expectSidebarVisible();
      
      // Check main content area
      await expect(layoutsTest.page.locator('main')).toBeVisible();
      
      // Check footer
      await expect(layoutsTest.page.locator('[data-testid="admin-footer"]')).toBeVisible();
    });

    test('should have proper layout structure', async () => {
      // Check layout container
      await expect(layoutsTest.page.locator('.min-h-screen')).toBeVisible();
      
      // Check flex layout
      const mainContainer = layoutsTest.page.locator('main');
      await expect(mainContainer).toHaveClass(/flex-1/);
    });

    test('should handle responsive layout', async () => {
      // Test desktop layout
      await layoutsTest.page.setViewportSize({ width: 1024, height: 768 });
      await layoutsTest.expectSidebarVisible();
      
      // Test mobile layout
      await layoutsTest.page.setViewportSize({ width: 375, height: 667 });
      await layoutsTest.expectMobileSidebarClosed();
    });
  });

  test.describe('Header Component', () => {
    test('should display header elements', async () => {
      await layoutsTest.expectHeaderVisible();
      
      // Check mobile menu toggle
      await expect(layoutsTest.page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
      
      // Check logo/title
      await expect(layoutsTest.page.locator('[data-testid="admin-logo"]')).toBeVisible();
      
      // Check user menu
      await expect(layoutsTest.page.locator('[data-testid="user-menu-button"]')).toBeVisible();
      
      // Check language switcher
      await expect(layoutsTest.page.locator('[data-testid="language-switcher"]')).toBeVisible();
    });

    test('should toggle user menu', async () => {
      // Initially closed
      await layoutsTest.expectUserMenuClosed();
      
      // Click to open
      await layoutsTest.clickUserMenu();
      await layoutsTest.expectUserMenuOpen();
      
      // Click again to close
      await layoutsTest.clickUserMenu();
      await layoutsTest.expectUserMenuClosed();
    });

    test('should close user menu when clicking outside', async () => {
      // Open user menu
      await layoutsTest.clickUserMenu();
      await layoutsTest.expectUserMenuOpen();
      
      // Click outside
      await layoutsTest.page.click('main');
      await layoutsTest.expectUserMenuClosed();
    });

    test('should display user information in menu', async () => {
      await layoutsTest.clickUserMenu();
      
      // Check user avatar
      await expect(layoutsTest.page.locator('[data-testid="user-avatar"]')).toBeVisible();
      
      // Check user name
      await expect(layoutsTest.page.locator('[data-testid="user-name"]')).toBeVisible();
      
      // Check user email
      await expect(layoutsTest.page.locator('[data-testid="user-email"]')).toBeVisible();
    });

    test('should have profile and logout options', async () => {
      await layoutsTest.clickUserMenu();
      
      // Check profile link
      await expect(layoutsTest.page.locator('[data-testid="profile-link"]')).toBeVisible();
      
      // Check logout button
      await expect(layoutsTest.page.locator('[data-testid="logout-button"]')).toBeVisible();
    });

    test('should handle logout', async () => {
      await layoutsTest.clickUserMenu();
      await layoutsTest.clickLogout();
      
      // Should redirect to login page
      await expect(layoutsTest.page).toHaveURL('/admin/login');
    });

    test('should switch language', async () => {
      // Test language switching
      await layoutsTest.switchLanguage('en');
      
      // Check if language changed (you might need to check specific text changes)
      await expect(layoutsTest.page.locator('html')).toHaveAttribute('lang', 'en');
    });

    test('should be responsive', async () => {
      // Test mobile header
      await layoutsTest.page.setViewportSize({ width: 375, height: 667 });
      await layoutsTest.expectHeaderVisible();
      
      // Mobile menu toggle should be visible
      await expect(layoutsTest.page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    });
  });

  test.describe('Sidebar Component', () => {
    test('should display sidebar navigation', async () => {
      await layoutsTest.expectSidebarVisible();
      
      // Check navigation items
      const expectedItems = [
        'dashboard',
        'members', 
        'performance',
        'projects',
        'content',
        'messages',
        'reports'
      ];
      
      for (const item of expectedItems) {
        await expect(layoutsTest.page.locator(`[data-testid="sidebar-${item}"]`)).toBeVisible();
      }
    });

    test('should highlight active menu item', async () => {
      // Navigate to different pages and check active states
      await layoutsTest.page.goto('/admin/members');
      await layoutsTest.expectActiveMenuItem('members');
      
      await layoutsTest.page.goto('/admin/projects');
      await layoutsTest.expectActiveMenuItem('projects');
    });

    test('should navigate to correct pages', async () => {
      // Test navigation to members page
      await layoutsTest.clickSidebarItem('members');
      await expect(layoutsTest.page).toHaveURL('/admin/members');
      
      // Test navigation to projects page
      await layoutsTest.clickSidebarItem('projects');
      await expect(layoutsTest.page).toHaveURL('/admin/projects');
    });

    test('should handle mobile sidebar', async () => {
      await layoutsTest.page.setViewportSize({ width: 375, height: 667 });
      
      // Initially closed on mobile
      await layoutsTest.expectMobileSidebarClosed();
      
      // Open mobile menu
      await layoutsTest.clickMobileMenuToggle();
      await layoutsTest.expectMobileSidebarOpen();
      
      // Close by clicking overlay
      await layoutsTest.closeMobileSidebar();
      await layoutsTest.expectMobileSidebarClosed();
    });

    test('should close mobile sidebar when navigating', async () => {
      await layoutsTest.page.setViewportSize({ width: 375, height: 667 });
      
      // Open mobile sidebar
      await layoutsTest.clickMobileMenuToggle();
      await layoutsTest.expectMobileSidebarOpen();
      
      // Click on a menu item
      await layoutsTest.clickSidebarItem('members');
      
      // Sidebar should close
      await layoutsTest.expectMobileSidebarClosed();
      
      // Should navigate to correct page
      await expect(layoutsTest.page).toHaveURL('/admin/members');
    });

    test('should display menu icons and labels', async () => {
      const menuItems = await layoutsTest.page.locator('[data-testid^="sidebar-"]').all();
      
      for (const item of menuItems) {
        // Check icon is visible
        await expect(item.locator('svg')).toBeVisible();
        
        // Check label is visible (on desktop)
        const label = item.locator('span').last();
        await expect(label).toBeVisible();
      }
    });
  });

  test.describe('Layout Integration', () => {
    test('should maintain layout state across navigation', async () => {
      // Navigate between pages
      await layoutsTest.clickSidebarItem('members');
      await layoutsTest.expectHeaderVisible();
      await layoutsTest.expectSidebarVisible();
      
      await layoutsTest.clickSidebarItem('projects');
      await layoutsTest.expectHeaderVisible();
      await layoutsTest.expectSidebarVisible();
    });

    test('should handle layout on different screen sizes', async () => {
      // Test tablet layout
      await layoutsTest.page.setViewportSize({ width: 768, height: 1024 });
      await layoutsTest.expectHeaderVisible();
      await layoutsTest.expectSidebarVisible();
      
      // Test large desktop layout
      await layoutsTest.page.setViewportSize({ width: 1920, height: 1080 });
      await layoutsTest.expectHeaderVisible();
      await layoutsTest.expectSidebarVisible();
    });

    test('should maintain scroll position in main content', async () => {
      // Navigate to a page with scrollable content
      await layoutsTest.clickSidebarItem('members');
      
      // Scroll down in main content
      await layoutsTest.page.locator('main').evaluate(el => el.scrollTop = 200);
      
      // Layout should remain stable
      await layoutsTest.expectHeaderVisible();
      await layoutsTest.expectSidebarVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async () => {
      // Test tab navigation through header
      await layoutsTest.page.keyboard.press('Tab');
      await layoutsTest.page.keyboard.press('Tab');
      
      // Should be able to focus on interactive elements
      const focusedElement = layoutsTest.page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels', async () => {
      // Check mobile menu toggle
      const menuToggle = layoutsTest.page.locator('[data-testid="mobile-menu-toggle"]');
      await expect(menuToggle).toHaveAttribute('aria-label');
      
      // Check navigation landmarks
      await expect(layoutsTest.page.locator('nav')).toBeVisible();
      await expect(layoutsTest.page.locator('main')).toBeVisible();
    });

    test('should support screen readers', async () => {
      // Check for proper heading structure
      await expect(layoutsTest.page.locator('h1')).toBeVisible();
      
      // Check for navigation structure
      const nav = layoutsTest.page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Check for proper list structure in sidebar
      const navList = layoutsTest.page.locator('nav ul');
      await expect(navList).toBeVisible();
    });

    test('should handle focus management', async () => {
      // Open user menu
      await layoutsTest.clickUserMenu();
      
      // Focus should be manageable within menu
      await layoutsTest.page.keyboard.press('Tab');
      const focusedElement = layoutsTest.page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Escape should close menu
      await layoutsTest.page.keyboard.press('Escape');
      await layoutsTest.expectUserMenuClosed();
    });
  });

  test.describe('Performance', () => {
    test('should load layout quickly', async () => {
      const startTime = Date.now();
      await layoutsTest.page.goto('/admin');
      await layoutsTest.expectHeaderVisible();
      await layoutsTest.expectSidebarVisible();
      const loadTime = Date.now() - startTime;
      
      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    test('should handle layout transitions smoothly', async () => {
      // Test mobile menu animation
      await layoutsTest.page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await layoutsTest.clickMobileMenuToggle();
      await layoutsTest.expectMobileSidebarOpen();
      const animationTime = Date.now() - startTime;
      
      // Animation should complete within reasonable time
      expect(animationTime).toBeLessThan(1000);
    });
  });
});