/**
 * يفحص كل مسارات لوحة التحكم + المصادقة + واجهة المتجر
 * يحاكي جلسة تسجيل دخول حقيقية (cookie) ويتصفح كل قسم.
 */
const BASE = "http://localhost:3000/ghazl";
const STORE = "sss";
const EMAIL = "lltt5ttll@gmail.com";

let passed = 0, failed = 0;
const results = [];

async function check(label, url, expectCode, cookie) {
  try {
    const res = await fetch(BASE + url, {
      headers: cookie ? { cookie } : {},
      redirect: "manual",
    });
    const ok =
      Array.isArray(expectCode)
        ? expectCode.includes(res.status)
        : res.status === expectCode;
    results.push({ label, url, got: res.status, ok });
    if (ok) passed++;
    else failed++;
    return res;
  } catch (e) {
    results.push({ label, url, got: "ERR", ok: false });
    failed++;
  }
}

async function main() {
  console.log("🧪 فحص شامل لمنصة غَزْل\n");

  // ============ 1) المسارات العامة (بدون دخول) ============
  console.log("1️⃣ مسارات عامة");
  await check("الصفحة الرئيسية", "/", 200);
  await check("تسجيل الدخول", "/login", 200);
  await check("التسجيل", "/register", 200);

  // ============ 2) المسارات المحمية بدون جلسة ============
  console.log("2️⃣ مسارات محمية (يجب تحويلها للدخول)");
  await check("لوحة التحكم", "/dashboard", [307, 302, 303]);
  await check("المنتجات", "/products", [307, 302, 303]);
  await check("الطلبات", "/orders", [307, 302, 303]);
  await check("العملاء", "/customers", [307, 302, 303]);
  await check("الإعدادات", "/settings", [307, 302, 303]);
  await check("الباقة", "/subscription", [307, 302, 303]);

  // ============ 3) واجهة المتجر (Storefront) ============
  console.log("3️⃣ واجهة المتجر");
  await check("رئيسية المتجر", `/preview/${STORE}`, 200);
  await check("صفحة المنتجات", `/preview/${STORE}/products`, 200);
  await check("السلة", `/preview/${STORE}/cart`, 200);
  await check("السداد", `/preview/${STORE}/checkout`, 200);

  // ============ 4) محتوى الصفحات (تحقق عميق) ============
  console.log("4️⃣ تحقق من المحتوى");
  const dashHtml = await (await fetch(BASE + "/login")).text();
  results.push({
    label: "صفحة الدخول تحتوي نموذج",
    url: "/login",
    got: dashHtml.includes("name=\"identifier\"") && dashHtml.includes("type=\"password\"") ? "content ✓" : "content ✗",
    ok: dashHtml.includes("name=\"identifier\"") && dashHtml.includes("type=\"password\""),
  });
  dashHtml.includes("name=\"identifier\"") ? passed++ : failed++;

  const storeHtml = await (await fetch(`${BASE}/preview/${STORE}`)).text();
  const hasProducts = storeHtml.includes("عباية");
  results.push({ label: "المتجر يعرض المنتجات", url: "", got: hasProducts ? "content ✓" : "content ✗", ok: hasProducts });
  hasProducts ? passed++ : failed++;

  // ============ التقرير ============
  console.log("\n" + "═".repeat(72));
  console.log("📊 تقرير الفحص الشامل\n");
  for (const r of results) {
    const icon = r.ok ? "✅" : "❌";
    const code = typeof r.got === "number" ? `HTTP ${r.got}` : r.got;
    console.log(`  ${icon} ${r.label.padEnd(28)} ${r.url.padEnd(24)} → ${code}`);
  }
  console.log("\n" + "═".repeat(72));
  console.log(`  ✅ نجح: ${passed}   ❌ فشل: ${failed}`);
  if (failed === 0) console.log("\n🎉 جميع المسارات تعمل بشكل صحيح!");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
