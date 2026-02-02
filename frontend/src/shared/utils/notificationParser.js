/**
 * 通知消息解析工具
 * 
 * 后端发送结构化的 JSON 数据，前端根据类型和状态自动翻译
 */

/**
 * 检查字符串是否为 JSON 格式
 */
function isJsonString(str) {
  if (!str || typeof str !== 'string') return false;
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}

/**
 * 解析通知数据
 * @param {string} subject - 通知主题
 * @param {string} content - 通知内容
 * @returns {Object|null} - 解析后的数据，如果不是 JSON 则返回 null
 */
export function parseNotification(subject, content) {
  // 尝试解析 subject
  if (isJsonString(subject)) {
    return JSON.parse(subject);
  }
  
  // 尝试解析 content
  if (isJsonString(content)) {
    return JSON.parse(content);
  }
  
  return null;
}

/**
 * 获取通知的翻译键
 * @param {Object} data - 解析后的通知数据
 * @param {string} field - 'subject' 或 'content'
 * @param {string} namespace - 翻译命名空间前缀，默认 'support'，管理员端使用 'admin.messages'
 * @returns {string} - 翻译键
 */
export function getNotificationTranslationKey(data, field = 'subject', namespace = 'support') {
  if (!data || !data.type) return null;
  
  const { type, status, comments } = data;
  
  // 根据类型和状态返回翻译键
  const keyMap = {
    // 业绩管理通知
    performance_review: {
      subject: `${namespace}.notifications.performance.review.subject`,
      content: comments 
        ? `${namespace}.notifications.performance.review.contentWithComments` 
        : `${namespace}.notifications.performance.review.content`,
    },
    performance_submission: {
      subject: `${namespace}.notifications.performance.submission.subject`,
      content: `${namespace}.notifications.performance.submission.content`,
    },
    
    // 会员管理通知
    member_registration: {
      subject: `${namespace}.notifications.member.registration.subject`,
      content: `${namespace}.notifications.member.registration.content`,
    },
    member_approved: {
      subject: `${namespace}.notifications.member.approved.subject`,
      content: `${namespace}.notifications.member.approved.content`,
    },
    member_rejected: {
      subject: `${namespace}.notifications.member.rejected.subject`,
      content: `${namespace}.notifications.member.rejected.content`,
    },
    
    // 项目管理通知
    project_application: {
      subject: `${namespace}.notifications.project.application.subject`,
      content: `${namespace}.notifications.project.application.content`,
    },
    project_application_result: {
      subject: `${namespace}.notifications.project.result.subject`,
      content: `${namespace}.notifications.project.result.content`,
    },
  };
  
  const keys = keyMap[type];
  return keys ? keys[field] : null;
}

/**
 * 获取通知分类
 * @param {Object} data - 解析后的通知数据
 * @returns {string} - 分类标识 ('performance', 'member', 'project', 'system')
 */
export function getNotificationCategory(data) {
  if (!data || !data.type) return 'system';
  
  const { type } = data;
  
  if (type.startsWith('performance_')) return 'performance';
  if (type.startsWith('member_')) return 'member';
  if (type.startsWith('project_')) return 'project';
  
  return 'system';
}

/**
 * 格式化通知参数（用于翻译插值）
 * @param {Object} data - 解析后的通知数据
 * @returns {Object} - 格式化后的参数对象
 */
export function formatNotificationParams(data) {
  if (!data) return {};
  
  const params = { ...data };
  
  // 转换 snake_case 字段为 camelCase（用于翻译模板）
  if (params.company_name) {
    params.companyName = params.company_name;
  }
  if (params.business_number) {
    params.businessNumber = params.business_number;
  }
  if (params.applicant_name) {
    params.applicantName = params.applicant_name;
  }
  if (params.project_title) {
    params.projectTitle = params.project_title;
  }
  
  // 格式化时间周期
  if (params.year) {
    if (params.quarter) {
      // 有季度：2024년 1분기 / 2024年 第1季度
      params.period = `${params.year}년 ${params.quarter}분기`;
      params.periodZh = `${params.year}年 第${params.quarter}季度`;
    } else {
      // 只有年度：2024년 연간 / 2024年 年度
      params.period = `${params.year}년 연간`;
      params.periodZh = `${params.year}年 年度`;
    }
  }
  
  // 格式化状态 - 为韩语和中文分别提供翻译
  if (params.status) {
    const statusMap = {
      approved: { ko: '승인', zh: '批准' },
      rejected: { ko: '거부', zh: '驳回' },
      revision_requested: { ko: '보완 요청', zh: '要求补充' },
      submitted: { ko: '제출', zh: '提交' },
      pending: { ko: '대기', zh: '待处理' },
    };
    const statusText = statusMap[params.status];
    if (statusText) {
      params.statusKo = statusText.ko;
      params.statusZh = statusText.zh;
    } else {
      // 如果没有映射，使用原始值
      params.statusKo = params.status;
      params.statusZh = params.status;
    }
  }
  
  return params;
}
