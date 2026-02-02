/**
 * 项目模块子菜单
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from "react-i18next";
import { Submenu } from "@shared/components";

export function ProjectSubmenu() {
  const { t } = useTranslation();

  const submenuItems = [
    {
      key: "project-list",
      label: t("projects.tabs.projectList", "사업 목록"),
      path: "/member/programs",
      activePaths: ["/member/programs"],
      isTab: true,
      exact: false, // 非精确匹配，但会被 activePaths 的逻辑覆盖
      // 自定义匹配逻辑：匹配 /member/programs 和 /member/programs/:id，但不匹配 /member/programs/applications
      customMatch: (pathname) => {
        if (pathname === "/member/programs") return true;
        // 匹配 /member/programs/:id 格式（UUID 或数字）
        if (pathname.startsWith("/member/programs/") && !pathname.includes("/applications")) {
          const parts = pathname.split("/");
          // 确保是 /member/programs/:id 格式，不是更深的路径
          return parts.length === 4;
        }
        return false;
      },
    },
    {
      key: "application-records",
      label: t("projects.tabs.applicationRecords", "신청 기록"),
      path: "/member/programs/applications",
      activePaths: ["/member/programs/applications"],
      isTab: true,
      exact: true,
    },
  ];

  return <Submenu items={submenuItems} renderLeft={() => null} />;
}
