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
      label: t("member.projects.tabs.projectList", "사업 목록"),
      path: "/member/projects",
      activePaths: ["/member/projects"],
      isTab: true,
      exact: false,
      // 自定义匹配逻辑：匹配 /member/projects 和 /member/projects/:id，但不匹配 /member/projects/applications
      customMatch: (pathname) => {
        // 匹配 /member/projects 精确
        if (pathname === "/member/projects") return true;

        // 匹配 /member/projects/:id 格式，但不匹配 /member/projects/applications
        if (
          pathname.startsWith("/member/projects/") &&
          !pathname.includes("/applications")
        ) {
          const parts = pathname.split("/");
          if (parts.length === 4) return true;
        }

        return false;
      },
    },
    {
      key: "application-records",
      label: t("member.projects.tabs.applicationRecords", "신청 기록"),
      path: "/member/projects/applications",
      activePaths: ["/member/projects/applications"],
      isTab: true,
      exact: true,
    },
  ];

  return <Submenu items={submenuItems} renderLeft={() => null} />;
}
