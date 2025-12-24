/**
 * Exception Filter Module - 异常过滤模块
 * 
 * 负责异常过滤和数据清理：
 * - 过滤不需要上报的异常
 * - 清理敏感信息
 * - 限制堆栈长度
 * 
 * Requirements: 12.2
 */

/**
 * 默认过滤配置
 */
const DEFAULT_FILTER_CONFIG = {
  enableFiltering: true,
  maxStackLength: 5000
};

/**
 * 默认过滤规则
 */
const DEFAULT_FILTER_RULES = [
  // 过滤脚本错误（跨域脚本无详细信息）
  {
    name: 'script-error',
    test: (record) => record.error?.message === 'Script error.',
    action: 'drop'
  },
  
  // 过滤网络错误（节流）
  {
    name: 'network-error',
    test: (record) => record.classification?.category === 'NETWORK',
    action: 'throttle',
    throttleRate: 0.1
  },
  
  // 过滤低影响异常（节流）
  {
    name: 'low-impact',
    test: (record) => record.classification?.userImpact === 'LOW',
    action: 'throttle',
    throttleRate: 0.2
  }
];

/**
 * 异常过滤器类
 */
export class ExceptionFilter {
  constructor(config = {}) {
    this.config = { ...DEFAULT_FILTER_CONFIG, ...config };
    this.filterRules = [...DEFAULT_FILTER_RULES];
  }
  
  /**
   * 检查异常是否应该保留
   * @param {Object} exceptionRecord - 异常记录
   * @returns {boolean} 是否保留
   */
  shouldKeep(exceptionRecord) {
    if (!this.config.enableFiltering) {
      return true;
    }
    
    for (const rule of this.filterRules) {
      if (rule.test(exceptionRecord)) {
        switch (rule.action) {
          case 'drop':
            return false;
          case 'throttle':
            return Math.random() < (rule.throttleRate || 0.1);
          default:
            break;
        }
      }
    }
    
    return true;
  }
  
  /**
   * 清理异常记录
   * @param {Object} exceptionRecord - 异常记录
   * @returns {Object} 清理后的记录
   */
  sanitize(exceptionRecord) {
    const sanitized = { ...exceptionRecord };
    
    // 限制堆栈长度
    if (sanitized.error?.stack?.length > this.config.maxStackLength) {
      sanitized.error = {
        ...sanitized.error,
        stack: sanitized.error.stack.substring(0, this.config.maxStackLength) + '... [truncated]'
      };
    }
    
    // 移除敏感信息
    if (sanitized.context) {
      sanitized.context = { ...sanitized.context };
      delete sanitized.context.localStorage;
      delete sanitized.context.sessionStorage;
      delete sanitized.context.cookies;
    }
    
    return sanitized;
  }
  
  /**
   * 添加自定义过滤规则
   * @param {Object} rule - 过滤规则
   */
  addRule(rule) {
    this.filterRules.push(rule);
  }
  
  /**
   * 移除过滤规则
   * @param {string} ruleName - 规则名称
   */
  removeRule(ruleName) {
    this.filterRules = this.filterRules.filter(r => r.name !== ruleName);
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// 导出单例
export const exceptionFilter = new ExceptionFilter();

export default exceptionFilter;
