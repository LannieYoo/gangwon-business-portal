/**
 * Audit Logs Module Tests - Admin Portal
 * 审计日志模块测试
 */

import { test, expect } from '@playwright/test';
import { AdminTestBase } from '../utils/test-base.js';

class AuditLogsTestBase extends AdminTestBase {
  constructor(page) {
    super(page);
    this.auditLogsUrl = '/admin/audit-logs';
  }

  async navigateToAuditLogs() {
    await this.page.goto(this.auditLogsUrl);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToAuditLogDetail(logId) {
    await this.page.goto(`${this.auditLogsUrl}/${logId}`);
    await this.page.waitForLoadState('networkidle');
  }

  // Filter operations
  async setActionFilter(action) {
    await this.page.selectOption('[data-testid="action-filter"]', action);
  }

  async setResourceTypeFilter(resourceType) {
    await this.page.selectOption('[data-testid="resource-type-filter"]', resourceType);
  }

  async setDateRange(startDate, endDate) {
    if (startDate) {
      await this.page.fill('[data-testid="start-date"]', startDate);
    }
    if (endDate) {
      await this.page.fill('[data-testid="end-date"]', endDate);
    }
  }

  async applyFilters() {
    await this.page.click('[data-testid="apply-filters"]');
    await this.page.waitForLoadState('networkidle');
  }

  async resetFilters() {
    await this.page.click('[data-testid="reset-filters"]');
    await this.page.waitForLoadState('networkidle');
  }

  // Table operations
  async getLogRows() {
    return await this.page.locator('[data-testid="audit-log-row"]').all();
  }

  async clickViewDetail(logId) {
    await this.page.click(`[data-testid="view-detail-${logId}"]`);
    await this.page.waitForLoadState('networkidle');
  }

  // Assertions
  async expectAuditLogsPageLoaded() {
    await expect(this.page.locator('h1')).toContainText('审计日志');
    await expect(this.page.locator('[data-testid="audit-logs-table"]')).toBeVisible();
  }

  async expectAuditLogDetailLoaded() {
    await expect(this.page.locator('h1')).toContainText('审计日志详情');
    await expect(this.page.locator('[data-testid="log-basic-info"]')).toBeVisible();
  }

  async expectFilterApplied(filterType, value) {
    const filterElement = this.page.locator(`[data-testid="${filterType}-filter"]`);
    await expect(filterElement).toHaveValue(value);
  }

  async expectLogRowsVisible() {
    const rows = await this.getLogRows();
    expect(rows.length).toBeGreaterThan(0);
  }

  async expectNoLogsMessage() {
    await expect(this.page.locator('[data-testid="no-logs-message"]')).toBeVisible();
  }
}

test.describe('Audit Logs Module', () => {
  let auditLogsTest;

  test.beforeEach(async ({ page }) => {
    auditLogsTest = new AuditLogsTestBase(page);
    await auditLogsTest.login();
  });

  test.describe('Audit Logs List', () => {
    test('should load audit logs list page', async () => {
      await auditLogsTest.navigateToAuditLogs();
      await auditLogsTest.expectAuditLogsPageLoaded();
    });

    test('should display audit logs table with data', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Check if table is visible
      await expect(auditLogsTest.page.locator('[data-testid="audit-logs-table"]')).toBeVisible();
      
      // Check table headers
      const expectedHeaders = ['时间', '用户', '操作', '资源类型', 'IP地址', '操作'];
      for (const header of expectedHeaders) {
        await expect(auditLogsTest.page.locator('th')).toContainText(header);
      }
    });

    test('should filter logs by action type', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Apply login action filter
      await auditLogsTest.setActionFilter('login');
      await auditLogsTest.applyFilters();
      
      // Verify filter is applied
      await auditLogsTest.expectFilterApplied('action', 'login');
      
      // Check if filtered results are displayed
      const rows = await auditLogsTest.getLogRows();
      if (rows.length > 0) {
        // Verify all visible logs are login actions
        for (const row of rows) {
          const actionBadge = row.locator('[data-testid="action-badge"]');
          await expect(actionBadge).toContainText('login');
        }
      }
    });

    test('should filter logs by resource type', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Apply member resource filter
      await auditLogsTest.setResourceTypeFilter('member');
      await auditLogsTest.applyFilters();
      
      // Verify filter is applied
      await auditLogsTest.expectFilterApplied('resource-type', 'member');
    });

    test('should filter logs by date range', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Set date range (last 7 days)
      const endDate = new Date().toISOString().slice(0, 16);
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      
      await auditLogsTest.setDateRange(startDate, endDate);
      await auditLogsTest.applyFilters();
      
      // Verify date filters are set
      await expect(auditLogsTest.page.locator('[data-testid="start-date"]')).toHaveValue(startDate);
      await expect(auditLogsTest.page.locator('[data-testid="end-date"]')).toHaveValue(endDate);
    });

    test('should reset all filters', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Apply some filters
      await auditLogsTest.setActionFilter('login');
      await auditLogsTest.setResourceTypeFilter('member');
      await auditLogsTest.applyFilters();
      
      // Reset filters
      await auditLogsTest.resetFilters();
      
      // Verify filters are reset
      await auditLogsTest.expectFilterApplied('action', 'all');
      await auditLogsTest.expectFilterApplied('resource-type', 'all');
      await expect(auditLogsTest.page.locator('[data-testid="start-date"]')).toHaveValue('');
      await expect(auditLogsTest.page.locator('[data-testid="end-date"]')).toHaveValue('');
    });

    test('should navigate to audit log detail', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      const rows = await auditLogsTest.getLogRows();
      if (rows.length > 0) {
        // Click on first log's detail button
        const firstRow = rows[0];
        const detailButton = firstRow.locator('[data-testid^="view-detail-"]');
        await detailButton.click();
        
        // Should navigate to detail page
        await expect(auditLogsTest.page).toHaveURL(/\/admin\/audit-logs\/[^\/]+$/);
        await auditLogsTest.expectAuditLogDetailLoaded();
      }
    });

    test('should handle pagination', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Check if pagination is visible (only if there are multiple pages)
      const pagination = auditLogsTest.page.locator('[data-testid="pagination"]');
      const paginationVisible = await pagination.isVisible();
      
      if (paginationVisible) {
        // Test page navigation
        const nextButton = auditLogsTest.page.locator('[data-testid="pagination-next"]');
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await auditLogsTest.page.waitForLoadState('networkidle');
          
          // Verify page changed
          await expect(auditLogsTest.page.locator('[data-testid="current-page"]')).toContainText('2');
        }
      }
    });

    test('should display empty state when no logs found', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Apply filters that should return no results
      await auditLogsTest.setActionFilter('nonexistent');
      await auditLogsTest.applyFilters();
      
      // Should show no logs message
      await auditLogsTest.expectNoLogsMessage();
    });

    test('should display action badges with correct variants', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      const rows = await auditLogsTest.getLogRows();
      if (rows.length > 0) {
        for (const row of rows) {
          const actionBadge = row.locator('[data-testid="action-badge"]');
          await expect(actionBadge).toBeVisible();
          
          // Check if badge has appropriate CSS classes for different actions
          const badgeClass = await actionBadge.getAttribute('class');
          expect(badgeClass).toMatch(/badge-(success|info|danger|primary|secondary)/);
        }
      }
    });
  });

  test.describe('Audit Log Detail', () => {
    test('should load audit log detail page', async () => {
      // First get a log ID from the list
      await auditLogsTest.navigateToAuditLogs();
      
      const rows = await auditLogsTest.getLogRows();
      if (rows.length > 0) {
        const firstRow = rows[0];
        const detailButton = firstRow.locator('[data-testid^="view-detail-"]');
        const logId = await detailButton.getAttribute('data-testid').then(id => id.replace('view-detail-', ''));
        
        await auditLogsTest.navigateToAuditLogDetail(logId);
        await auditLogsTest.expectAuditLogDetailLoaded();
      }
    });

    test('should display all log detail sections', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      const rows = await auditLogsTest.getLogRows();
      if (rows.length > 0) {
        // Navigate to first log detail
        const firstRow = rows[0];
        const detailButton = firstRow.locator('[data-testid^="view-detail-"]');
        await detailButton.click();
        
        // Check all detail sections are visible
        await expect(auditLogsTest.page.locator('[data-testid="log-basic-info"]')).toBeVisible();
        await expect(auditLogsTest.page.locator('[data-testid="log-user-info"]')).toBeVisible();
        await expect(auditLogsTest.page.locator('[data-testid="log-resource-info"]')).toBeVisible();
        await expect(auditLogsTest.page.locator('[data-testid="log-network-info"]')).toBeVisible();
      }
    });

    test('should display log information correctly', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      const rows = await auditLogsTest.getLogRows();
      if (rows.length > 0) {
        // Navigate to first log detail
        const firstRow = rows[0];
        const detailButton = firstRow.locator('[data-testid^="view-detail-"]');
        await detailButton.click();
        
        // Check basic information fields
        await expect(auditLogsTest.page.locator('[data-testid="log-id"]')).toBeVisible();
        await expect(auditLogsTest.page.locator('[data-testid="log-action"]')).toBeVisible();
        await expect(auditLogsTest.page.locator('[data-testid="log-created-at"]')).toBeVisible();
        
        // Check action badge
        const actionBadge = auditLogsTest.page.locator('[data-testid="log-action-badge"]');
        await expect(actionBadge).toBeVisible();
      }
    });

    test('should navigate back to logs list', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      const rows = await auditLogsTest.getLogRows();
      if (rows.length > 0) {
        // Navigate to detail page
        const firstRow = rows[0];
        const detailButton = firstRow.locator('[data-testid^="view-detail-"]');
        await detailButton.click();
        
        // Click back button
        await auditLogsTest.page.click('[data-testid="back-to-list"]');
        
        // Should be back on logs list page
        await expect(auditLogsTest.page).toHaveURL('/admin/audit-logs');
        await auditLogsTest.expectAuditLogsPageLoaded();
      }
    });

    test('should handle non-existent log ID', async () => {
      await auditLogsTest.navigateToAuditLogDetail('nonexistent-id');
      
      // Should show not found message
      await expect(auditLogsTest.page.locator('[data-testid="log-not-found"]')).toBeVisible();
      await expect(auditLogsTest.page.locator('[data-testid="back-to-list"]')).toBeVisible();
    });

    test('should format dates correctly', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      const rows = await auditLogsTest.getLogRows();
      if (rows.length > 0) {
        // Navigate to first log detail
        const firstRow = rows[0];
        const detailButton = firstRow.locator('[data-testid^="view-detail-"]');
        await detailButton.click();
        
        // Check date format (Korean locale)
        const createdAt = auditLogsTest.page.locator('[data-testid="log-created-at"]');
        const dateText = await createdAt.textContent();
        
        // Should match Korean date format pattern
        expect(dateText).toMatch(/\d{4}\.\s?\d{1,2}\.\s?\d{1,2}\.\s?\d{1,2}:\d{2}:\d{2}/);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async () => {
      await auditLogsTest.page.setViewportSize({ width: 375, height: 667 });
      await auditLogsTest.navigateToAuditLogs();
      
      // Check mobile layout
      await auditLogsTest.expectAuditLogsPageLoaded();
      
      // Filters should stack vertically on mobile
      const filtersContainer = auditLogsTest.page.locator('[data-testid="filters-container"]');
      await expect(filtersContainer).toBeVisible();
    });

    test('should work on tablet devices', async () => {
      await auditLogsTest.page.setViewportSize({ width: 768, height: 1024 });
      await auditLogsTest.navigateToAuditLogs();
      
      await auditLogsTest.expectAuditLogsPageLoaded();
    });
  });

  test.describe('Performance', () => {
    test('should load audit logs within acceptable time', async () => {
      const startTime = Date.now();
      await auditLogsTest.navigateToAuditLogs();
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle large datasets efficiently', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Check if pagination is implemented for large datasets
      const pagination = auditLogsTest.page.locator('[data-testid="pagination"]');
      const tableRows = await auditLogsTest.getLogRows();
      
      // If there are many logs, pagination should be visible
      if (tableRows.length >= 20) {
        await expect(pagination).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Test tab navigation through filters
      await auditLogsTest.page.keyboard.press('Tab');
      await auditLogsTest.page.keyboard.press('Tab');
      await auditLogsTest.page.keyboard.press('Tab');
      
      // Should be able to interact with filters using keyboard
      const focusedElement = auditLogsTest.page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels', async () => {
      await auditLogsTest.navigateToAuditLogs();
      
      // Check for ARIA labels on interactive elements
      const filterButtons = auditLogsTest.page.locator('[data-testid="apply-filters"], [data-testid="reset-filters"]');
      const count = await filterButtons.count();
      
      for (let i = 0; i < count; i++) {
        const button = filterButtons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });
  });
});