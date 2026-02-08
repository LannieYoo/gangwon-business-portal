/**
 * Header Logic Hook
 * 会员端 Header 逻辑钩子：导航菜单定义/激活状态/登录弹窗
 *
 * 参考 dev-frontend_patterns skill 构建
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@shared/hooks";
import {
  DashboardIcon,
  FolderIcon,
  ChartIcon,
  DocumentIcon,
  SupportIcon,
} from "@shared/components";

export function useHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  // 主导航菜单项配置
  const mainMenuItems = [
    {
      key: "home",
      path: "/member/home",
      icon: DashboardIcon,
      label: t("member.layout.menu.home"),
      exact: true,
      requiresAuth: false,
    },
    {
      key: "about",
      path: "/member/about",
      icon: DocumentIcon,
      label: t("member.layout.menu.about"),
      requiresAuth: false,
    },
    {
      key: "projects",
      path: "/member/programs",
      icon: FolderIcon,
      label: t("member.layout.menu.projects"),
      requiresAuth: true,
    },
    {
      key: "performance",
      path: "/member/performance",
      icon: ChartIcon,
      label: t("member.layout.menu.performance"),
      requiresAuth: true,
    },
    {
      key: "support",
      path: "/member/support",
      icon: SupportIcon,
      label: t("member.layout.menu.support"),
      requiresAuth: true,
    },
  ];

  // 判断菜单是否激活
  const isMenuActive = (item) => {
    // 首页特殊处理
    if (item.key === "home") {
      return (
        location.pathname === "/member/home" ||
        location.pathname === "/member" ||
        location.pathname.startsWith("/member/news")
      );
    }
    // 项目菜单特殊处理
    if (item.key === "projects") {
      return (
        location.pathname.startsWith("/member/programs") ||
        location.pathname.startsWith("/member/project")
      );
    }
    // 支持菜单特殊处理
    if (item.key === "support") {
      return (
        location.pathname.startsWith("/member/support") ||
        location.pathname.startsWith("/member/notices")
      );
    }
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  // 菜单点击处理器
  const handleMenuClick = (e, item) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      setPendingPath(item.path);
      setShowLoginModal(true);
    } else {
      setShowMobileMenu(false); // Mobile menu auto-close
    }
  };

  // 登录成功处理
  const handleLoginSuccess = (response) => {
    setShowLoginModal(false);
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    } else {
      const redirectPath =
        response.user?.role === "admin" ? "/admin" : "/member";
      navigate(redirectPath);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/member/home", { replace: true });
  };

  return {
    user,
    isAuthenticated,
    mainMenuItems,
    state: {
      showMobileMenu,
      showLoginModal,
    },
    actions: {
      navigate,
      setShowMobileMenu,
      setShowLoginModal,
      setPendingPath,
      handleMenuClick,
      handleLoginSuccess,
      handleLogout,
      isMenuActive,
    },
  };
}
