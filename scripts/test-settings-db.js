/**
 * ⚙️ اختبار فعلي لحفظ الإعدادات + وضع الصيانة (قاعدة البيانات)
 */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

let pass = 0, fail = 0;
const log = (ok, label, extra = "") => {
  if (ok) pass++; else fail++;
  console.log(`  ${ok ? "✅" : "❌"} ${label}${extra ? ` (${extra})` : ""}`);
};

(async () => {
  console.log("⚙️ اختبار حفظ الإعدادات على قاعدة البيانات\n");

  const store = await p.store.findFirst({
    where: { slug: "sss" },
  });
  if (!store) { console.log("❌ متجر sss غير موجود"); process.exit(1); }
  console.log(`  المتجر: ${store.name} (slug=${store.slug})\n`);

  // 1️⃣ حفظ SEO
  console.log("1️⃣ حفظ حقول الأرشفة:");
  await p.store.update({
    where: { id: store.id },
    data: {
      seoTitle: "متجر فصل الشتاء | أزياء عصرية",
      seoDescription: "أفضل تشكيلة ملابس الشتاء بأسعار منافسة",
      seoKeywords: "ملابس، شتاء، أزياء",
    },
  });
  const s1 = await p.store.findUnique({ where: { id: store.id } });
  log(s1.seoTitle === "متجر فصل الشتاء | أزياء عصرية", "عنوان SEO محفوظ");
  log(!!s1.seoKeywords, "الكلمات المفتاحية محفوظة", s1.seoKeywords);

  // 2️⃣ منع الأرشفة
  console.log("\n2️⃣ منع الأرشفة:");
  await p.store.update({ where: { id: store.id }, data: { seoNoIndex: true } });
  const s2 = await p.store.findUnique({ where: { id: store.id } });
  log(s2.seoNoIndex === true, "seoNoIndex = true");

  // 3️⃣ تفعيل الصيانة
  console.log("\n3️⃣ تفعيل وضع الصيانة:");
  await p.store.update({
    where: { id: store.id },
    data: {
      maintenanceMode: true,
      maintenanceMsg: "نطور متجرنا حالياً ونعود قريباً 🚀",
    },
  });
  const s3 = await p.store.findUnique({ where: { id: store.id } });
  log(s3.maintenanceMode === true, "maintenanceMode = true");
  log(s3.maintenanceMsg === "نطور متجرنا حالياً ونعود قريباً 🚀", "رسالة الصيانة محفوظة");

  // 4️⃣ تغيير الرابط (slug)
  console.log("\n4️⃣ تغيير رابط المتجر:");
  const newSlug = "sss-test-" + Date.now().toString().slice(-4);
  await p.store.update({ where: { id: store.id }, data: { slug: newSlug } });
  const s4 = await p.store.findUnique({ where: { id: store.id } });
  log(s4.slug === newSlug, "الرابط تغير", s4.slug);
  // إرجاعه
  await p.store.update({ where: { id: store.id }, data: { slug: "sss" } });

  // 5️⃣ السوشال
  console.log("\n5️⃣ وسائل التواصل:");
  await p.store.update({
    where: { id: store.id },
    data: {
      socialLinks: {
        instagram: "my_store",
        whatsapp: "9665XXXXXXXX",
        twitter: null, tiktok: null, snapchat: null,
      },
    },
  });
  const s5 = await p.store.findUnique({ where: { id: store.id } });
  log(s5.socialLinks?.instagram === "my_store", "إنستغرام محفوظ");

  // 6️⃣ إيقاف الصيانة والتراجع (حالة طبيعية)
  console.log("\n6️⃣ التراجع عن الصيانة:");
  await p.store.update({
    where: { id: store.id },
    data: {
      maintenanceMode: false,
      maintenanceMsg: null,
      seoNoIndex: false,
      socialLinks: null,
      seoTitle: null, seoDescription: null, seoKeywords: null,
    },
  });
  const s6 = await p.store.findUnique({ where: { id: store.id } });
  log(s6.maintenanceMode === false, "maintenanceMode = false");
  log(s6.seoNoIndex === false, "seoNoIndex = false");
  log(s6.slug === "sss", "الرابط الأصلي", s6.slug);

  await p.$disconnect();
  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  ✅ نجح: ${pass}   ❌ فشل: ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
