/**
 * User Avatar Component
 * 用户头像组件 - 显示用户首字母和背景渐变
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { UI_STYLES } from "../../enum";

/**
 * UserAvatar Component
 * @param {Object} props
 * @param {Object} props.user - 用户对象
 * @param {'normal' | 'large'} [props.size='normal'] - 头像尺寸
 * @param {string} [props.className] - 额外的 CSS 类名
 */
export function UserAvatar({ user, size = "normal", className = "" }) {
  const sizeClasses =
    size === "large" ? "w-[52px] h-[52px] text-xl" : "w-9 h-9 text-[0.9375rem]";

  return (
    <div
      className={`${sizeClasses} rounded-full text-white flex items-center justify-center font-bold flex-shrink-0 border-2 border-blue-700/20 shadow-[0_2px_4px_-1px_rgba(0,76,151,0.3)] ${className}`}
      style={{
        background: UI_STYLES.USER_AVATAR_GRADIENT,
      }}
    >
      {user?.companyName?.charAt(0) || user?.name?.charAt(0) || "U"}
    </div>
  );
}
