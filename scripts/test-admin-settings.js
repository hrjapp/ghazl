/**
 * 🧪 اختبار صفحة الإعدادات في لوحة الأدمن
 */
const { chromium } = require("playwright-core");
const BASE = "https://ai-hrj.xyz/ghazl";

let pass = 0, fail = 0;
const log = (ok, label, extra = "") => {
  if (ok) pass++; else fail++;
  console.log(`  ${ok ? "✅" : "❌"} ${label}${extra ? ` (${extra})` : ""}`);
};

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  // دخول
  await page.goto(`${BASE}/admin-login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.fill('input[name="identifier"]', "admin");
  await page.fill('input[name="password"]', "admin");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  // فتح الإعدادات
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const url = page.url();
  const body = await page.textContent("body");

  console.log("🧪 اختبار الإعدادات — لوحة الأدمن\n");
  console.log(`  URL: ${url}\n`);

  log(url.includes("/admin/settings"), "الصفحة فتحت");
  log(!!body?.includes("خطط الاشتراك"), "عنوان «خطط الاشتراك»");
  log(!!body?.includes("المجاني"), "الخطة المجانية معروضة");
  log(!!body?.includes("الفضي"), "الخطة الفضية معروضة");
  log(!!body?.includes("الذهبي"), "الخطة الذهبية معروضة");
  log(!!body?.includes("خطة جديدة"), "زر «خطة جديدة\"");
  log((await page.locator("text=تعديل").count()) >= 3, "أزرار «تعديل» للخطط", `${await page.locator("text=تعديل").count()}`);
  log(!!body?.includes("شهرياً"), "الأسعار الشهرية معروضة");
  log(!!body?.includes("عمولة المنصة"), "عمولة المنصة معروضة");

  // تجربة فتح نموذج التعديل
  await page.locator("text=تعديل").first().click();
  await page.waitForTimeout(1500);
  const formBody = await page.textContent("body");
  log(!!formBody?.includes("تعديل الخطة"), "نموذج التعديل فتح");
  log(!!formBody?.includes("حدود الاستخدام"), "قسم حدود الاستخدام");
  log(!!formBody?.includes("المزايا"), "قسم المزايا");
  log((await page.locator('input[name="priceMonthly"]').count()) > 0, "حقل السعر الشهري");

  // عدّل سعر الفضي ثم ألغِ (للحفاظ على البيانات)
  log(errs.length === 0, "لا أخطاء كونسول", errs.length ? errs[0] : "");

  await page.screenshot({ path: "/tmp/admin-settings.png" });
  await browser.close();

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  ✅ نجح: ${pass}   ❌ فشل: ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
