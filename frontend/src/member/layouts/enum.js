/**
 * Header Constants and Styles
 * 顶部导航相关的常量定义
 */

// 统一的 hover 样式配置 - 深蓝色主题
export const HOVER_STYLES = {
  // 深色背景上的 hover（顶部导航栏）- 浅蓝色高亮
  dark: "hover:text-blue-200",
  darkBorder: "hover:text-blue-200 hover:border-blue-300",
  // 导航项状态
  navItemActive: "border-white font-bold hover:text-blue-200",
  navItemInactive: "border-transparent",
  // 浅色背景上的 hover（下拉菜单、移动端菜单）- 深蓝色
  light: "hover:bg-blue-50 hover:text-blue-800",
  lightBorder: "hover:bg-blue-50 hover:text-blue-800 hover:border-l-blue-600",
  // 危险操作 - 保持红色
  danger: "hover:bg-red-50 hover:text-red-800 hover:border-l-red-600",
};

export const LAYOUT_CONFIG = {
  LOGO_URL: "https://k-talk.kr/static/images/user/logo.png",
};

export const UI_STYLES = {
  USER_AVATAR_GRADIENT: "linear-gradient(135deg, #0066cc 0%, #004c97 100%)",
};
