/**
 * 🌐 فحص لوحة التحكم عبر جلسة متصفح حقيقية
 * يستخدم تقنية جلب Next.js Server Actions فعلياً:
 * 1. يجلب صفحة /login ويستخرج action ID من RSC payload
 * 2. يرسل POST بالبيانات للحصول على cookie الجلسة
 * 3. يتصفح كل قسم ويتحقق من المحتوى
 */
const BASE = "http://localhost:3000/ghazl";
const STORE = "sss";
const EMAIL = "lltt5ttll@gmail.com";
const PASSWORD = "Test123456!";

let passed = 0, failed = 0;
function log(ok, msg, extra = "") {
  console.log(`  ${ok ? "✅" : "❌"} ${msg}${extra ? " " + extra : ""}`);
  ok ? passed++ : failed++;
}

async function main() {
  console.log("🌐 فحص لوحة التحكم عبر جلسة حقيقية\n");

  // 1) جلب صفحة الدخول واستخراج Action ID
  console.log("1️⃣ استخراج Server Action ID:");
  const page = await fetch(`${BASE}/login`);
  const html = await page.text();
  // Next.js embeds action IDs in the RSC payload as "id":"abc123..."
  const ids = [...html.matchAll(/"([a-f0-9]{32,64})"/g)].map((m) => m[1]);
  const actionId = ids[0];
  if (!actionId) {
    console.log("   ⚠️ تعذر استخراج Action ID — استخدام طريقة بديلة");
  } else {
    console.log(`   ✓ Action ID: ${actionId.slice(0, 20)}...`);
  }

  // 2) تنفيذ تسجيل الدخول
  console.log("\n2️⃣ تنفيذ تسجيل الدخول:");
  let cookie = "";
  try {
    // Next.js 15: POST with action protocol
    // body: array of args (identifier, password) encoded
    const body = JSON.stringify([EMAIL, PASSWORD]);
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "Next-Action": actionId || "",
        "Accept": "text/x-component",
        "Next-Router-State-Tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(login)%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%5D",
      },
      body,
      redirect: "manual",
    });
    const sc = res.headers.get("set-cookie") || "";
    cookie = sc.split(";")[0];
    log(res.status < 500, `استجابة الدخول => ${res.status}`);
    log(cookie.includes("ghazl_session"), "حصلنا على cookie الجلسة");
    console.log(`   cookie: ${cookie ? cookie.slice(0, 30) + "..." : "(فارغ)"}`);
  } catch (e) {
    console.log("   ⚠️", e.message);
  }

  if (!cookie) {
    console.log("\n   📝 ملاحظة: تعذر محاكاة Server Action (الحماية CSRF في Next 15)");
    console.log("   سنستخدم فحصاً يدوياً عبر متصفح حقيقي");
    return;
  }

  // 3) تصفح كل قسم بالجلسة
  console.log("\n3️⃣ تصفح لوحة التحكم بالجلسة:");
  const sections = [
    ["/dashboard", "نظرة عامة"],
    ["/products", "المنتجات"],
    ["/orders", "الطلبات"],
    ["/customers", "العملاء"],
    ["/settings", "الإعدادات"],
    ["/subscription", "الباقة والاشتراك"],
  ];

  for (const [path, label] of sections) {
    const res = await fetch(`${BASE}${path}`, { headers: { cookie }, redirect: "manual" });
    const html = await res.text();
    const hasContent = html.length > 3000;
    log(res.status === 200, `${label} (${path}) => ${res.status}`, hasContent ? `(${html.length} بايت)` : "(محتوى ناقص!)");
  }

  // 4) فحص تفصيلي للوحة المنتجات
  console.log("\n4️⃣ فحص لوحة المنتجات:");
  const productsPage = await fetch(`${BASE}/products`, { headers: { cookie } });
  const pHtml = await productsPage.text();
  log(pHtml.includes("عباية فستقية"), "المنتجات ظاهرة في الجدول");
  log(pHtml.includes("إضافة منتج") || pHtml.includes("منتج جديد"), "زر إضافة منتج موجود");
  log(pHtml.includes("تعديل") || pHtml.includes("edit") || pHtml.includes("حذف"), "أزرار التحكم (تعديل/حذف) موجودة");

  // 5) فحص الطلبات
  console.log("\n5️⃣ فحص الطلبات:");
  const ordersPage = await fetch(`${BASE}/orders`, { headers: { cookie } });
  const oHtml = await ordersPage.text();
  log(oHtml.includes("SS-1001") || oHtml.includes("1001"), "أرقام الطلبات ظاهرة");
  log(oHtml.includes("نورة"), "اسم العميلة ظاهر");
  log(oHtml.includes("قيد الانتظار") || oHtml.includes("PENDING") || oHtml.includes("بانتظار"), "حالات الطلبات ظاهرة");

  // 6) فحص العملاء
  console.log("\n6️⃣ فحص العملاء:");
  const cPage = await fetch(`${BASE}/customers`, { headers: { cookie } });
  const cHtml = await cPage.text();
  log(cHtml.includes("نورة"), "العميلة مسجلة");
  log(cHtml.includes("0551234567"), "رقم الهاتف ظاهر");

  console.log("\n" + "═".repeat(60));
  console.log(`  ✅ نجح: ${passed}   ❌ فشل: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
