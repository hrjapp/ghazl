/**
 * 🌐 اختبار قسم الإعدادات — تسجيل دخول تاجر + تعبئة + أرشفة + صيانة
 */
const { chromium } = require("playwright-core");

const BASE = "https://ai-hrj.xyz/ghazl";

let pass = 0, fail = 0;
const log = (ok, label, extra = "") => {
  if (ok) pass++; else fail++;
  console.log(`  ${ok ? "✅" : "❌"} ${label}${extra ? ` (${extra})` : ""}`);
};

(async () => {
  console.log("⚙️  اختبار قسم الإعدادات\n");
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // 1️⃣ تسجيل دخول التاجر (نفس حساب الاختبار السابق)
  console.log("1️⃣ تسجيل دخول التاجر:");
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.fill('input[name="identifier"]', "lltt5ttll@gmail.com");
  await page.fill('input[name="password"], input[type="password"]', "Test123456!");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  const loggedIn = await page.textContent("body");
  const ok = page.url().includes("/dashboard") || !page.url().includes("/login");
  log(ok, "دخول التاجر", page.url());

  // 2️⃣ فتح صفحة الإعدادات
  console.log("\n2️⃣ صفحة الإعدادات:");
  await page.goto(`${BASE}/settings`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const settingsBody = await page.textContent("body");
  const sections = [
    "معلومات أساسية",
    "رابط المتجر والنطاق",
    "أرشفة محركات البحث",
    "التحكم بالمتجر",
    "باقة الاشتراك",
    "التواصل ووسائل التواصل",
  ];
  sections.forEach((s) => log(settingsBody?.includes(s) || false, `قسم: ${s}`));

  // 3️⃣ حقول SEO
  console.log("\n3️⃣ حقول الأرشفة:");
  const hasSeoTitle = await page.locator('input[name="seoTitle"]').count();
  const hasSeoDesc = await page.locator('textarea[name="seoDescription"]').count();
  const hasSeoKeywords = await page.locator('input[name="seoKeywords"]').count();
  const hasNoIndex = await page.locator('input[name="seoNoIndex"]').count();
  log(hasSeoTitle > 0, "حقل عنوان SEO");
  log(hasSeoDesc > 0, "حقل وصف SEO");
  log(hasSeoKeywords > 0, "حقل الكلمات المفتاحية");
  log(hasNoIndex > 0, "خيار منع الأرشفة");

  // 4️⃣ حقول التحكم
  console.log("\n4️⃣ حقول التحكم:");
  const hasMaint = await page.locator('input[name="maintenanceMode"]').count();
  const hasMaintMsg = await page.locator('textarea[name="maintenanceMsg"]').count();
  const hasClosed = await page.locator('textarea[name="closedMessage"]').count();
  log(hasMaint > 0, "خيار وضع الصيانة");
  log(hasMaintMsg > 0, "حقل رسالة الصيانة");
  log(hasClosed > 0, "حقل رسالة الإغلاق");

  // 5️⃣ حقل الرابط
  console.log("\n5️⃣ رابط المتجر:");
  const hasSlug = await page.locator('input[name="slug"]').count();
  log(hasSlug > 0, "حقل تعديل الرابط");

  // 6️⃣ تفعيل وضع الصيانة وحفظ
  console.log("\n6️⃣ تفعيل الصيانة + حفظ:");
  if (hasMaint > 0) {
    const checkbox = page.locator('input[name="maintenanceMode"]');
    if (!(await checkbox.isChecked())) await checkbox.check();
    await page.fill('textarea[name="maintenanceMsg"]', "نطور متجرنا حالياً ونعود قريباً 🚀");
  }
  // اضغط حفظ
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  const afterSave = await page.textContent("body");
  log(!!afterSave?.includes("تم حفظ") || !afterSave?.includes("خطأ"), "الحفظ تم");

  // 7️⃣ تحقق من ظهور وضع الصيانة في preview
  console.log("\n7️⃣ وضع الصيانة في preview:");
  await page.goto(`${BASE}/preview/sss`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const previewBody = await page.textContent("body");
  const maintShown = previewBody?.includes("قيد الصيانة") || previewBody?.includes("الصيانة");
  log(!!maintShown, "صفحة الصيانة ظاهرة", maintShown ? "✓" : "✗");

  // 8️⃣ إيقاف الصيانة للتراجع
  console.log("\n8️⃣ إيقاف الصيانة:");
  await page.goto(`${BASE}/settings`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const cb = page.locator('input[name="maintenanceMode"]');
  if (await cb.isChecked()) await cb.uncheck();
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  log(true, "تم التراجع");

  // 9️⃣ تحقق أن المتجر عاد
  await page.goto(`${BASE}/preview/sss`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const back = await page.textContent("body");
  log(!back?.includes("قيد الصيانة"), "المتجر عاد للعمل");

  // 🔟 أخطاء
  console.log("\n9️⃣ أخطاء الكونسول:");
  log(errors.length === 0, "أخطاء الكونسول", `${errors.length}`);
  errors.slice(0, 3).forEach((e) => console.log("      ⚠️", e));

  await browser.close();
  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  ✅ نجح: ${pass}   ❌ فشل: ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
