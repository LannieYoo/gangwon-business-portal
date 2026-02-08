/**
 * Header Constants and Styles
 * 头部组件的常量和样式定义
 */

// 统一的 hover 样式类 - 支持多种场景
export const HOVER_STYLES = {
  // 深色背景下的 hover(文字变浅色)- 用于顶部导航
  dark: "hover:text-blue-200",
  darkBorder: "hover:text-blue-200 hover:border-blue-300",
  // 激活状态样式
  navItemActive: "border-white font-bold hover:text-blue-200",
  navItemInactive: "border-transparent",
  // 浅色背景下的 hover(添加背景色和深色文字)- 用于侧边栏
  light: "hover:bg-blue-50 hover:text-blue-800",
  lightBorder: "hover:bg-blue-50 hover:text-blue-800 hover:border-l-blue-600",
  // 危险操作 - 用于退出等
  danger: "hover:bg-red-50 hover:text-red-800 hover:border-l-red-600",
};

export const LAYOUT_CONFIG = {
  LOGO_URL: "https://k-talk.kr/static/images/user/logo.png",
};

export const UI_STYLES = {
  USER_AVATAR_GRADIENT: "linear-gradient(135deg, #0066cc 0%, #004c97 100%)",
};
