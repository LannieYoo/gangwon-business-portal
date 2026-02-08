/**
 * Excel/CSV 导出工具
 *
 * 提供前端生成 Excel/CSV 文件的功能，支持国际化
 * 使用动态导入 xlsx 库，按需加载减少包体积
 */

/**
 * 生成时间戳字符串
 * @returns {string} 格式: YYYYMMDD
 */
const getTimestamp = () => {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
};

/**
 * 通用 Excel 导出工具
 *
 * @param {Object} options - 导出配置
 * @param {Array} options.data - 数据数组
 * @param {Array} options.columns - 列配置 [{key, label?, labelKey?, exportRender?}]
 * @param {Function} options.t - i18n 翻译函数
 * @param {string} options.filename - 文件名（不含扩展名）
 * @param {string} options.sheetName - 工作表名
 * @param {Function} [options.valueTranslator] - 可选的值翻译函数 (key, value, row) => translatedValue
 *
 * @example
 * // 基础用法
 * await exportToExcel({
 *   data: users,
 *   columns: [{ key: 'name', label: '姓名' }, { key: 'email', label: '邮箱' }],
 *   t,
 *   filename: '用户列表',
 *   sheetName: '用户数据',
 * });
 *
 * @example
 * // 使用 labelKey 和 valueTranslator (配合 useEnumTranslation hook)
 * const { translateFieldValue } = useEnumTranslation();
 * await exportToExcel({
 *   data: companies,
 *   columns: TABLE_COLUMN_CONFIGS,  // 使用 labelKey: "statistics.table.xxx"
 *   t,
 *   filename: t('common.export.excel'),
 *   sheetName: t('common.title'),
 *   valueTranslator: (key, value) => translateFieldValue(key, value),
 * });
 */
export const exportToExcel = async (options) => {
  // 动态导入 xlsx 库，按需加载
  const XLSX = await import("xlsx");

  const { data, columns, t, filename, sheetName, valueTranslator } = options;

  // 过滤掉 actions 列等不需要导出的列
  const exportColumns = columns.filter(
    (col) => col.key !== "actions" && !col.hideInExport,
  );

  // 1. 生成翻译后的列名（header）
  const headers = exportColumns.map((col) => {
    if (col.label) return col.label;
    if (col.labelKey) return t(col.labelKey);
    return col.key;
  });

  // 2. 翻译数据值
  const translatedData = data.map((row) => {
    const translatedRow = {};

    exportColumns.forEach((col) => {
      const rawValue = row[col.key];
      const header = col.label || (col.labelKey ? t(col.labelKey) : col.key);

      // 优先使用列的自定义导出渲染器
      if (col.exportRender) {
        translatedRow[header] = col.exportRender(rawValue, row, t);
      }
      // 其次使用全局值翻译器
      else if (valueTranslator) {
        translatedRow[header] = valueTranslator(col.key, rawValue, row);
      }
      // 默认直接使用原值
      else {
        translatedRow[header] = rawValue ?? "";
      }
    });

    return translatedRow;
  });

  // 3. 生成 Excel
  const ws = XLSX.utils.json_to_sheet(translatedData, { header: headers });

  // 设置列宽（可选）
  const colWidths = exportColumns.map((col) => ({
    wch: col.width ? Math.floor(col.width / 8) : 15,
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");

  // 4. 下载文件
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * 通用 CSV 导出工具
 *
 * @param {Object} options - 导出配置（与 exportToExcel 相同）
 */
export const exportToCsv = async (options) => {
  // 动态导入 xlsx 库
  const XLSX = await import("xlsx");

  const { data, columns, t, filename, sheetName, valueTranslator } = options;

  // 过滤掉 actions 列等不需要导出的列
  const exportColumns = columns.filter(
    (col) => col.key !== "actions" && !col.hideInExport,
  );

  // 1. 生成翻译后的列名
  const headers = exportColumns.map((col) => {
    if (col.label) return col.label;
    if (col.labelKey) return t(col.labelKey);
    return col.key;
  });

  // 2. 翻译数据值
  const translatedData = data.map((row) => {
    const translatedRow = {};

    exportColumns.forEach((col) => {
      const rawValue = row[col.key];
      const header = col.label || (col.labelKey ? t(col.labelKey) : col.key);

      if (col.exportRender) {
        translatedRow[header] = col.exportRender(rawValue, row, t);
      } else if (valueTranslator) {
        translatedRow[header] = valueTranslator(col.key, rawValue, row);
      } else {
        translatedRow[header] = rawValue ?? "";
      }
    });

    return translatedRow;
  });

  // 3. 生成 CSV
  const ws = XLSX.utils.json_to_sheet(translatedData, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");

  // 4. 下载 CSV 文件（带 UTF-8 BOM，兼容 Excel 打开中文）
  XLSX.writeFile(wb, `${filename}.csv`, { bookType: "csv" });
};

/**
 * 生成导出文件名
 *
 * @param {string} prefix - 文件名前缀（已翻译）
 * @param {Object} [options] - 可选配置
 * @param {number} [options.year] - 年份
 * @returns {string} 格式: prefix_year_YYYYMMDD 或 prefix_YYYYMMDD
 */
export const generateExportFilename = (prefix, options = {}) => {
  const timestamp = getTimestamp();
  const { year } = options;

  if (year) {
    return `${prefix}_${year}_${timestamp}`;
  }
  return `${prefix}_${timestamp}`;
};
