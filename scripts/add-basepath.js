/**
 * يضيف /ghazl basePath إلى كل الروابط الداخلية للتطبيق.
 * يعالج: redirect(), router.push(), href=، وروابط القوالب النصية.
 * يتجاهل: المسارات الخارجية، #anchors، و /_next، /api
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const BASE = "/ghazl";
const SRC = path.join(__dirname, "..", "src");

// أنماط المسارات الداخلية للتطبيق
const ROUTES = ["dashboard", "login", "register", "onboarding", "preview"];

let totalReplaced = 0;
let filesChanged = 0;

function walk(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (f === "node_modules" || f === ".next") continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(f)) out.push(full);
  }
  return out;
}

function processFile(file) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  // 1) redirect("/dashboard...") و router.push("/dashboard...")
  //    في server actions و client components
  for (const r of ROUTES) {
    // redirect("/route") و redirect("/route/sub")
    const reRedirect = new RegExp(
      `(redirect|router\\.push|router\\.replace)\\("(\\/${r})`,
      "g"
    );
    content = content.replace(reRedirect, (m, fn, route) => {
      changed = true;
      return `${fn}("${BASE}${route}`;
    });

    // القوالب النصية: `/dashboard` داخل backticks أو quotes
    // مثال: href={`/dashboard/products`} أو href="/dashboard"
    const reTpl = new RegExp(
      "([`\"\\'])(\\/" + r + ")([\\/`\"\\'])",
      "g"
    );
    content = content.replace(reTpl, (m, q1, route, rest) => {
      changed = true;
      return q1 + BASE + route + rest;
    });
  }

  // 2) معالجة خاصة لروابط preview الديناميكية داخل backticks:
  //    `/preview/${slug}/...` → `/ghazl/preview/${slug}/...`
  //    وكذلك `/preview/${storeSlug}`
  const rePreviewDyn = /(\`)(\/preview\/)(\$\{)/g;
  content = content.replace(rePreviewDyn, (m, bt, route, dyn) => {
    changed = true;
    return `${bt}${BASE}${route}${dyn}`;
  });

  // 3) روابط `/preview/${x}` بدون / بعدها
  const rePreviewEnd = /(\`)(\/preview)(`\})/g;
  content = content.replace(rePreviewEnd, (m, bt, route, end) => {
    changed = true;
    return `${bt}${BASE}${route}${end}`;
  });

  if (changed) {
    fs.writeFileSync(file, content, "utf8");
    filesChanged++;
    return true;
  }
  return false;
}

const files = walk(SRC).filter(
  (f) => !f.endsWith("proxy.ts") && !f.endsWith("tenant.ts")
);

for (const f of files) {
  if (processFile(f)) {
    console.log("✓", path.relative(SRC, f));
  }
}

console.log(`\n✅ تم تعديل ${filesChanged} ملف`);
