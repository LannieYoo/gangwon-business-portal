/**
 * Check for deeply nested keys (> 3 levels) in i18n JSON files
 */
const fs = require("fs");
const path = require("path");
const glob = require("glob");

function countNesting(obj, prefix = "", depth = 0) {
  let results = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      results = results.concat(countNesting(value, fullKey, depth + 1));
    } else {
      if (depth >= 4) {
        results.push({ key: fullKey, depth });
      }
    }
  }
  return results;
}

// Find all ko.json files in modules
const koFiles = glob.sync("frontend/src/**/locales/ko.json");

console.log("🔍 Checking for deeply nested keys (depth >= 4)...\n");

let totalDeep = 0;

koFiles.forEach((file) => {
  try {
    const content = JSON.parse(fs.readFileSync(file, "utf8"));
    const nested = countNesting(content);

    if (nested.length > 0) {
      console.log(`📁 ${file}:`);
      nested.forEach((n) => console.log(`   [${n.depth}] ${n.key}`));
      console.log("");
      totalDeep += nested.length;
    }
  } catch (e) {
    console.error(`Error parsing ${file}:`, e.message);
  }
});

if (totalDeep === 0) {
  console.log("✅ No keys with depth >= 4 found");
} else {
  console.log(`\n⚠️ Found ${totalDeep} keys with depth >= 4`);
}
