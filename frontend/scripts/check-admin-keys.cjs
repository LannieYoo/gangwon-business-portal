const fs = require("fs");
const path = require("path");

const modules = [
  "auth",
  "content",
  "dashboard",
  "members",
  "messages",
  "performance",
  "projects",
  "statistics",
];

modules.forEach((m) => {
  try {
    const filePath = path.join(
      __dirname,
      "src/admin/modules",
      m,
      "locales/ko.json",
    );
    const j = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`${m}: ${Object.keys(j).join(", ")}`);
  } catch (e) {
    console.log(`${m}: ERROR - ${e.message}`);
  }
});
