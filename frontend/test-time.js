// 测试时间解析
const testDate = "2026-01-03T03:58:43.949+00:00";

const d = new Date(testDate);
console.log("Input:", testDate);
console.log("Parsed Date:", d);
console.log("UTC:", d.toISOString());

// 使用 toLocaleString 转换到渥太华时区
const estStr = d.toLocaleString('sv-SE', { timeZone: 'America/Toronto' });
console.log("EST (sv-SE):", estStr);

// 添加毫秒
const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
console.log("Final:", `${estStr}.${ms}`);
