/**
 * 🌐 اختبار شامل — بوابة المدير + الإجراءات الإدارية
 */
const { chromium } = require("playwright-core");

const BASE = "https://ai-hrj.xyz/ghazl";

let pass = 0, fail = 0;
function log(ok, label, extra = "") {
  if (ok) pass++; else fail++;
  console.log(`  ${ok ? "✅" : "❌"} ${label}${extra ? ` (${extra})` : ""}`);
}

(async () => {
  console.log("🔐 اختبار بوابة المدير + الإجراءات الإدارية\n");
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // 1️⃣ بوابة الدخول
  console.log("1️⃣ بوابة دخول المدير (admin/admin):");
  await page.goto(`${BASE}/admin-login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const hasGate = page.url().includes("/admin-login");
  log(hasGate, "البوابة متاحة", page.url());
  const title = (await page.locator("h1").allTextContents()).join(" | ");
  log(!!title.includes("لوحة تحكم المنصة"), "العنوان الصحيح", `(${title.trim()})`);

  // 2️⃣ تسجيل دخول خاطئ
  console.log("\n2️⃣ بيانات خاطئة:");
  await page.fill('input[name="identifier"]', "wronguser");
  await page.fill('input[name="password"]', "wrongpass");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  const body = await page.textContent("body");
  log(!!body?.includes("غير صحيحة"), "رسالة خطأ ظاهرة");

  // 3️⃣ تسجيل دخول صحيح admin/admin
  console.log("\n3️⃣ دخول admin/admin:");
  await page.fill('input[name="identifier"]', "admin");
  await page.fill('input[name="password"]', "admin");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  const inAdmin = page.url().includes("/admin");
  log(inAdmin, "تم الدخول للوحة المنصة", page.url());

  if (!inAdmin) {
    console.log("\n⚠️ تعذر إكمال الاختبار — الدخول فشل");
    await browser.close();
    console.log(`\n✅ نجح: ${pass}  ❌ فشل: ${fail}`);
    process.exit(1);
  }

  // 4️⃣ البطاقات
  const cards = await page.locator("div.rounded-2xl.border").count();
  log(cards >= 4, "بطاقات النظرة العامة", `${cards}`);

  // 5️⃣ المتاجر → تفاصيل متجر → إجراءات
  console.log("\n4️⃣ إجراءات إدارة المتاجر:");
  await page.goto(`${BASE}/admin/stores`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const link = page.locator("tbody tr td:first-child a").first();
  if (await link.count()) {
    let href = await link.getAttribute("href");
    href = href.replace(/^\/ghazl/, "");
    await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    const hasActions = await page.locator("text=إجراءات إدارية").count();
    log(hasActions > 0, "قسم الإجراءات الإدارية ظاهر");

    // أزرار الإيقاف/التنشيط
    const suspendBtn = await page.locator("button:has-text('إيقاف المتجر')").count();
    const activateBtn = await page.locator("button:has-text('تنشيط المتجر')").count();
    log(suspendBtn + activateBtn > 0, "زر الإيقاف/التنشيط موجود", suspendBtn ? "إيقاف" : "تنشيط");

    // زر تغيير الباقة
    const planBtn = await page.locator("button:has-text('تغيير الباقة')").count();
    log(planBtn > 0, "زر تغيير الباقة موجود");

    // زر تمديد
    const extendBtn = await page.locator("button:has-text('تمديد 30 يوم')").count();
    log(extendBtn > 0, "زر تمديد 30 يوم موجود");

    // زر حذف
    const deleteBtn = await page.locator("button:has-text('حذف المتجر')").count();
    log(deleteBtn > 0, "زر حذف المتجر موجود");

    // فتح قائمة الباقات
    if (planBtn) {
      await page.click("button:has-text('تغيير الباقة')");
      await page.waitForTimeout(1000);
      const planOptions = await page.locator("div.absolute button").count();
      log(planOptions > 0, "قائمة الباقات تفتح", `${planOptions} خيار`);
    }
  }

  // 6️⃣ العملاء
  console.log("\n5️⃣ إدارة العملاء:");
  await page.goto(`${BASE}/admin/customers`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const custRows = await page.locator("tbody tr").count();
  const actionCol = await page.locator("th:has-text('إجراءات')").count();
  log(custRows >= 0 && actionCol > 0, "عمود الإجراءات في العملاء", `${custRows} عميل`);

  // 7️⃣ الاشتراكات
  console.log("\n6️⃣ الاشتراكات:");
  await page.goto(`${BASE}/admin/subscriptions`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const subBody = await page.textContent("body");
  log(!!subBody?.includes("تاريخ الانتهاء"), "تواريخ الانتهاء ظاهرة");

  // 8️⃣ أخطاء
  console.log("\n7️⃣ أخطاء الكونسول:");
  log(errors.length === 0, "أخطاء الكونسول", `${errors.length}`);
  errors.slice(0, 3).forEach((e) => console.log("      ⚠️", e));

  await browser.close();
  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  ✅ نجح: ${pass}   ❌ فشل: ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
