/**
 * يعكس عملية basePath: يزيل /ghazl من روابط السورس
 * لأن Next.js يضيف basePath تلقائياً عند البناء.
 * روابط "/" تُترك كما هي (تعني الجذر = basePath).
 */
const fs = require("fs");
const path = require("path");

const BASE = "/ghazl";
const SRC = path.join(__dirname, "..", "src");

let filesChanged = 0;

function walk(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (f === "node_modules" || f === ".next") continue;
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(f)) out.push(full);
  }
  return out;
}

function processFile(file) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // /ghazl/ghazl/x → /ghazl/x  (مضاعَف)
  content = content.split(`${BASE}${BASE}`).join(`${BASE}`);
  // /ghazl/x → /x  (لكن "/ghazl" وحدها = الجذر → "/")
  // عالج: "..." و `...${}`
  content = content.split(`"${BASE}/`).join(`"/`);
  content = content.split("`" + BASE + "/").join("`/");
  // redirect("/ghazl/x") → redirect("/x")
  content = content.split(`"${BASE}"`).join(`"/"`);

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    filesChanged++;
    console.log("✓", path.relative(SRC, file));
    return true;
  }
  return false;
}

const files = walk(SRC).filter(
  (f) => !f.endsWith("proxy.ts") && !f.endsWith("tenant.ts")
);

for (const f of files) processFile(f);

console.log(`\n✅ تم تنظيف ${filesChanged} ملف`);
