/**
 * Exception Module - 前端异常处理系统入口
 *
 * 统一导出所有异常处理相关功能。
 */

// 导出异常处理器
export {
  ExceptionType,
  ExceptionSeverity,
  ExceptionContextCollector,
  FrontendExceptionClassifier,
  FrontendExceptionHandler,
  frontendExceptionHandler,
} from "./handler.js";

// 导出异常去重
export {
  ExceptionDeduplicator,
  exceptionDeduplicator,
} from "./dedup.js";

// 导出异常过滤
export {
  ExceptionFilter,
  exceptionFilter,
} from "./filter.js";

// 导出异常传输
export {
  ExceptionTransport,
  exceptionTransport,
} from "./transport.js";

// 导出异常服务
export {
  FrontendExceptionService,
  frontendExceptionService,
  exceptionService,
} from "./service.js";

// 导出全局异常处理器
export {
  GlobalExceptionHandler,
  globalExceptionHandler,
} from "./global.js";

// 兼容性导出 - 修复：直接重新导出
export { frontendExceptionHandler as exceptionHandler } from "./handler.js";

// 默认导出异常服务
export { frontendExceptionService as default } from "./service.js";
