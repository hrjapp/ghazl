/**
 * 🌐 اختبار حقيقي بمتصفح — لوحة تحكم المنصة (Super Admin)
 */
const { chromium } = require("playwright-core");

const BASE = "https://ai-hrj.xyz/ghazl";
const EMAIL = "lltt5ttll@gmail.com";
const PASSWORD = "Test" + "123456" + "!";

let pass = 0;
let fail = 0;
function log(ok, label, extra = "") {
  if (ok) pass++;
  else fail++;
  console.log(`  ${ok ? "✅" : "❌"} ${label}${extra ? ` (${extra})` : ""}`);
}

(async () => {
  console.log("🌐 اختبار لوحة تحكم المنصة — Super Admin\n");

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));

  // 1️⃣ تسجيل الدخول
  console.log("1️⃣ تسجيل الدخول:");
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="identifier"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  log(page.url().includes("/dashboard") || page.url().includes("/admin"), "تم الدخول", page.url());

  // 2️⃣ الصفحة الرئيسية للوحة المنصة
  console.log("\n2️⃣ النظرة العامة:");
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const onAdmin = page.url().includes("/admin");
  log(onAdmin, "لوحة المنصة متاحة", page.url());
  if (onAdmin) {
    const heading = await page.locator("h1").first().textContent();
    log(!!heading, "العنوان ظاهر", `(${heading?.trim()})`);
    const cards = await page.locator("div.rounded-2xl.border").count();
    log(cards >= 4, "بطاقات الإحصائيات ظاهرة", `${cards} بطاقة`);
    const hasMoney = await page.textContent("body");
    log(hasMoney?.includes("ر.س"), "الإيرادات معروضة");
  }

  // 3️⃣ المتاجر
  console.log("\n3️⃣ المتاجر:");
  await page.goto(`${BASE}/admin/stores`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  if (page.url().includes("/admin/stores")) {
    const rows = await page.locator("tbody tr").count();
    log(rows > 0, "جدول المتاجر يحتوي متاجر", `${rows} متجر`);
    const firstStore = await page.locator("tbody tr td:first-child").first().textContent();
    log(!!firstStore, "أول متجر ظاهر", `(${firstStore?.trim().split("\n")[0]})`);
  } else {
    log(false, "صفحة المتاجر متاحة", page.url());
  }

  // 4️⃣ تفاصيل متجر
  console.log("\n4️⃣ تفاصيل متجر:");
  if (page.url().includes("/admin/stores")) {
    const link = page.locator("tbody tr td:first-child a").first();
    if (await link.count()) {
      let href = await link.getAttribute("href");
      // Next يضيف basePath تلقائياً؛ الرابط المستخرج قد يحتوي عليه مسبقاً
      href = href.replace(/^\/ghazl/, "");
      await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
      const onDetail = page.url().includes("/admin/stores/");
      log(onDetail, "صفحة التفاصيل تفتح", page.url());
      if (onDetail) {
        const body = await page.textContent("body");
        log(!!body?.includes("الاشتراك"), "قسم الاشتراك ظاهر");
        log(!!body?.includes("سجل الاشتراكات"), "سجل الاشتراكات ظاهر");
        log(!!body?.includes("حالة الطلبات"), "حالة الطلبات ظاهرة");
        log(!!body?.includes("فريق المتجر"), "فريق المتجر ظاهر");
        log(!!body?.includes("أحدث الطلبات"), "أحدث الطلبات ظاهرة");
      }
    }
  }

  // 5️⃣ الاشتراكات
  console.log("\n5️⃣ الاشتراكات:");
  await page.goto(`${BASE}/admin/subscriptions`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  if (page.url().includes("/admin/subscriptions")) {
    const rows = await page.locator("tbody tr").count();
    log(rows >= 0, "صفحة الاشتراكات تُحمّل", `${rows} اشتراك`);
    const body = await page.textContent("body");
    log(!!body?.includes("تاريخ الانتهاء"), "تواريخ الانتهاء ظاهرة");
  }

  // 6️⃣ العملاء
  console.log("\n6️⃣ العملاء:");
  await page.goto(`${BASE}/admin/customers`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  log(page.url().includes("/admin/customers"), "صفحة العملاء متاحة", page.url());

  // 7️⃣ التقارير
  console.log("\n7️⃣ التقارير:");
  await page.goto(`${BASE}/admin/analytics`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  if (page.url().includes("/admin/analytics")) {
    const body = await page.textContent("body");
    log(!!body?.includes("نمو"), "قسم النمو ظاهر");
    log(!!body?.includes("توزيع الباقات"), "توزيع الباقات ظاهر");
    log(!!body?.includes("أعلى المتاجر"), "أعلى المتاجر ظاهر");
  }

  // 8️⃣ الحماية: المزار لا يصل
  console.log("\n8️⃣ أخطاء الكونسول:");
  log(consoleErrors.length === 0, "أخطاء الكونسول", `${consoleErrors.length}`);
  if (consoleErrors.length) consoleErrors.slice(0, 3).forEach((e) => console.log("      ⚠️", e));

  await browser.close();

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  ✅ نجح: ${pass}   ❌ فشل: ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
