import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { loggerService } from "@shared/utils/loggerHandler";

/**
 * Component to log route changes automatically
 * 路由变更日志记录器
 */
export function RouteLogger() {
  const location = useLocation();
  const action = useNavigationType();

  useEffect(() => {
    // Log the page view
    loggerService.info(`Page View: ${location.pathname}`, {
      module: "Router",
      function: "RouteLogger",
      action: action,
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      type: "page_view",
    });
  }, [location, action]);

  return null;
}
