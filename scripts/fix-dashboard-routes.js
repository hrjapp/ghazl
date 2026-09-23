/**
 * يصحح الروابط الخاطئة:
 * "(dashboard)" هو ROUTE GROUP — لا يدخل في مسار URL.
 * لذا /dashboard/products → /products (الصحيح)
 * لكن الرابط /dashboard (الرئيسية) صحيح لوجود dashboard/page.tsx
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
let changed = 0;

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

// روابط الأقسام: /dashboard/products → /products
const SUBROUTES = [
  "products", "orders", "customers", "settings", "subscription",
];

function fixFile(file) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  for (const r of SUBROUTES) {
    // ` و " و '
    content = content.split(`/dashboard/${r}`).join(`/${r}`);
  }
  // روابط تعديل المنتج: /dashboard/products/new → /products/new (تمت)
  // تفاصيل الطلب: /dashboard/orders/x → /orders/x (تمت)

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    changed++;
    console.log("✓", path.relative(SRC, file));
  }
}

for (const f of walk(SRC)) fixFile(f);
console.log(`\n✅ تم تصحيح ${changed} ملف`);
console.log("⚠️ تأكد أن /dashboard (الرئيسية) لا يزال يعمل — له page.tsx خاص");
