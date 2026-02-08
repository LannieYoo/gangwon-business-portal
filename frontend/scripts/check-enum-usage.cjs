#!/usr/bin/env node

/**
 * Enum Translation Usage Check Script
 *
 * This script checks if all pages are using the useEnumTranslation hook
 * instead of manual t(`enums.xxx`) patterns.
 *
 * Usage: npm run check:enum-usage
 */

const fs = require("fs");
const path = require("path");

// Configuration
const SRC_DIR = path.join(__dirname, "..", "src");
const EXCLUDED_DIRS = [
  "node_modules",
  "dist",
  "build",
  ".git",
  "_deprecated",
  "deprecated",
];
const FILE_EXTENSIONS = [".jsx", ".js", ".tsx", ".ts"];

// Patterns to detect
const PATTERNS = {
  // Manual t(`enums.xxx`) pattern - should use hook instead
  // Excludes labelKey references and comment examples
  manualEnumTranslation: {
    pattern:
      /(?<!labelKey:\s*['"])(?<!\*\s*)(?<!\/\/\s*)t\s*\(\s*[`'"]\s*enums\.[^`'"]+[`'"]/g,
    description: "Manual t(`enums.xxx`) pattern",
    severity: "warning",
    suggestion: "Use useEnumTranslation hook methods instead",
    // Skip lines that are comments or contain labelKey
    skipLinePatterns: [/^\s*\*/, /^\s*\/\//, /labelKey/],
  },

  // Manual region options building (only in JSX, not in labelKey definitions)
  // Skip labelKey references which are correct static patterns
  manualRegionOptions: {
    pattern:
      /\{\s*t\s*\(\s*['"]enums\.regions\.(chuncheon|wonju|gangneung|donghae)/g,
    description: "Manual region options building in JSX",
    severity: "info",
    suggestion: "Use getRegionOptions() method",
  },

  // Old translateOptions function
  oldTranslateOptions: {
    pattern: /translateOptions\s*\(/g,
    description: "Old translateOptions function usage",
    severity: "info",
    suggestion: "Use useEnumTranslation hook's getXxxOptions() methods",
  },

  // Correct useEnumTranslation hook usage
  correctUsage: {
    pattern: /useEnumTranslation\s*\(\s*\)/g,
    description: "Correct useEnumTranslation hook usage",
    severity: "ok",
    suggestion: null,
  },

  // Hook translation methods
  hookMethods: {
    pattern:
      /translate(Region|StartupType|StartupStage|KsicMajor|KsicSub|GangwonIndustry|FutureTech|MainIndustryKsic|MainIndustryKsicCodes|BusinessField|IpType|IpRegistrationType|OverseasType|Country|Gender)\s*\(/g,
    description: "Hook translation methods",
    severity: "ok",
    suggestion: null,
  },

  // Hook option generation methods
  hookOptionMethods: {
    pattern:
      /get(Region|StartupType|StartupStage|KsicMajor|KsicSub|GangwonIndustry|FutureTech|MainIndustryKsic|MainIndustryKsicCodes|BusinessField|IpType|IpRegistrationType|OverseasType|Country)Options\s*\(/g,
    description: "Hook option generation methods",
    severity: "ok",
    suggestion: null,
  },
};

// Results
const results = {
  totalFiles: 0,
  filesWithIssues: 0,
  issues: [],
  correctUsages: [],
  summary: {
    manualEnumTranslation: 0,
    manualRegionOptions: 0,
    oldTranslateOptions: 0,
    correctUsage: 0,
    hookMethods: 0,
    hookOptionMethods: 0,
  },
};

/**
 * Get all files recursively
 */
function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.some((excluded) => entry.name.includes(excluded))) {
        getAllFiles(fullPath, files);
      }
    } else if (entry.isFile()) {
      if (FILE_EXTENSIONS.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Check a single file
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relativePath = path.relative(SRC_DIR, filePath);
  const fileIssues = [];
  const fileCorrectUsages = [];

  for (const [key, config] of Object.entries(PATTERNS)) {
    const matches = content.match(config.pattern);

    if (matches && matches.length > 0) {
      if (config.severity === "warning" || config.severity === "info") {
        // Find line numbers for each match
        const lines = content.split("\n");
        let issueCount = 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Skip lines that match skip patterns (comments, labelKey, etc.)
          if (config.skipLinePatterns) {
            const shouldSkip = config.skipLinePatterns.some((skipPattern) =>
              skipPattern.test(line),
            );
            if (shouldSkip) continue;
          }

          if (config.pattern.test(line)) {
            // Reset lastIndex
            config.pattern.lastIndex = 0;
            issueCount++;
            fileIssues.push({
              file: relativePath,
              line: i + 1,
              type: key,
              severity: config.severity,
              description: config.description,
              suggestion: config.suggestion,
              code: line.trim().substring(0, 80),
            });
          }
        }
        // Update summary with actual issue count (after filtering)
        results.summary[key] += issueCount;
      } else if (config.severity === "ok") {
        results.summary[key] += matches.length;
        fileCorrectUsages.push({
          file: relativePath,
          type: key,
          count: matches.length,
          description: config.description,
        });
      }
    }
  }

  if (fileIssues.length > 0) {
    results.filesWithIssues++;
    results.issues.push(...fileIssues);
  }

  if (fileCorrectUsages.length > 0) {
    results.correctUsages.push(...fileCorrectUsages);
  }

  results.totalFiles++;
}

/**
 * Print results
 */
function printResults() {
  console.log("\n" + "=".repeat(80));
  console.log("  ENUM TRANSLATION USAGE CHECK REPORT");
  console.log("=".repeat(80) + "\n");

  // Summary
  console.log("[SUMMARY]");
  console.log("-".repeat(40));
  console.log(`  Total files scanned: ${results.totalFiles}`);
  console.log(`  Files with issues: ${results.filesWithIssues}`);
  console.log(`  Total issues: ${results.issues.length}`);
  console.log("");
  console.log("  Breakdown:");
  console.log(
    `  [!] Manual t(\`enums.xxx\`) usage: ${results.summary.manualEnumTranslation}`,
  );
  console.log(
    `  [i] Manual region options: ${results.summary.manualRegionOptions}`,
  );
  console.log(
    `  [i] Old translateOptions usage: ${results.summary.oldTranslateOptions}`,
  );
  console.log(
    `  [+] Correct useEnumTranslation: ${results.summary.correctUsage}`,
  );
  console.log(`  [+] Hook translation methods: ${results.summary.hookMethods}`);
  console.log(
    `  [+] Hook option methods: ${results.summary.hookOptionMethods}`,
  );
  console.log("");

  // Issues list
  if (results.issues.length > 0) {
    console.log("[!] FILES THAT NEED UPDATES:");
    console.log("-".repeat(80));

    // Group by file
    const issuesByFile = {};
    for (const issue of results.issues) {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    }

    for (const [file, issues] of Object.entries(issuesByFile)) {
      console.log(`\n  FILE: ${file}`);
      for (const issue of issues) {
        const icon = issue.severity === "warning" ? "[!]" : "[i]";
        console.log(`    ${icon} Line ${issue.line}: ${issue.description}`);
        console.log(`        Code: ${issue.code}`);
        if (issue.suggestion) {
          console.log(`        Suggestion: ${issue.suggestion}`);
        }
      }
    }
    console.log("");
  }

  // Correct usage files
  if (results.correctUsages.length > 0) {
    console.log("\n[+] FILES CORRECTLY USING HOOK:");
    console.log("-".repeat(80));

    const usagesByFile = {};
    for (const usage of results.correctUsages) {
      if (!usagesByFile[usage.file]) {
        usagesByFile[usage.file] = [];
      }
      usagesByFile[usage.file].push(usage);
    }

    for (const [file, usages] of Object.entries(usagesByFile)) {
      const descriptions = usages
        .map((u) => `${u.description}(${u.count})`)
        .join(", ");
      console.log(`    [OK] ${file}: ${descriptions}`);
    }
    console.log("");
  }

  // Recommendations
  console.log("\n[*] RECOMMENDED ACTIONS:");
  console.log("-".repeat(80));

  if (results.summary.manualEnumTranslation > 0) {
    console.log(`
  1. Replace manual t(\`enums.xxx\`) calls:
     
     // BEFORE:
     {member.startupType ? t(\`enums.industry.startupType.\${member.startupType}\`) : '-'}
     
     // AFTER:
     const { translateStartupType } = useEnumTranslation();
     {translateStartupType(member.startupType)}
`);
  }

  if (results.summary.oldTranslateOptions > 0) {
    console.log(`
  2. Replace old translateOptions calls:
     
     // BEFORE:
     const options = translateOptions(STARTUP_TYPE_KEYS, t);
     
     // AFTER:
     const { getStartupTypeOptions } = useEnumTranslation();
     const options = getStartupTypeOptions(STARTUP_TYPE_KEYS);
`);
  }

  if (results.summary.manualRegionOptions > 0) {
    console.log(`
  3. Replace manual region options building:
     
     // BEFORE:
     const regionOptions = { chuncheon: t('xxx.regions.chuncheon'), ... };
     
     // AFTER:
     const { getRegionOptions } = useEnumTranslation();
     const regionOptions = getRegionOptions();
`);
  }

  // Final status
  console.log("\n" + "=".repeat(80));
  if (results.issues.length === 0) {
    console.log(
      "  SUCCESS! All files are correctly using useEnumTranslation hook!",
    );
  } else {
    console.log(
      `  FOUND ${results.issues.length} issue(s) that need to be updated.`,
    );
    console.log(
      "  Please follow the recommendations above to update these files.",
    );
  }
  console.log("=".repeat(80) + "\n");

  // Return exit code
  return results.summary.manualEnumTranslation > 0 ? 1 : 0;
}

// Main function
function main() {
  console.log("[*] Scanning files...");

  const files = getAllFiles(SRC_DIR);

  for (const file of files) {
    checkFile(file);
  }

  const exitCode = printResults();
  process.exit(exitCode);
}

main();
