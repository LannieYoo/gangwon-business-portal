/**
 * Korean Shared Layer Translations Index
 * 韩语共享层翻译索引文件
 */
import common from "./common.json";
import enums from "./enums.json";
import components from "./components.json";
import error from "./error.json";
import terms from "./terms.json";
import member from "./member.json";
import project from "./project.json";

// Deep merge all translations
const deepMerge = (target, source) => {
  const result = { ...target };
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = result[key];
    if (
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  });
  return result;
};

const ko = [common, enums, components, error, terms, member, project].reduce(
  (acc, curr) => deepMerge(acc, curr),
  {},
);

export default ko;
