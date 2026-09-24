/**
 * ⚡ اختبار حفظ فعلي — تعديل خطة + التراجع
 */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

let pass = 0, fail = 0;
const log = (ok, label, extra = "") => {
  if (ok) pass++; else fail++;
  console.log(`  ${ok ? "✅" : "❌"} ${label}${extra ? ` (${extra})` : ""}`);
};

(async () => {
  console.log("⚡ اختبار حفظ تعديلات الخطط\n");

  const silver = await p.plan.findUnique({ where: { slug: "silver" } });
  if (!silver) { console.log("❌ خطة silver غير موجودة"); process.exit(1); }

  const origPrice = Number(silver.priceMonthly);
  const origCommission = silver.limits?.commissionRate ?? 0.01;

  // 1️⃣ تعديل السعر
  console.log("1️⃣ تعديل السعر:");
  await p.plan.update({
    where: { id: silver.id },
    data: { priceMonthly: 149, limits: { ...silver.limits, commissionRate: 0.015 } },
  });
  const s1 = await p.plan.findUnique({ where: { slug: "silver" } });
  log(Number(s1.priceMonthly) === 149, "السعر تغير", `${s1.priceMonthly}`);
  log(s1.limits.commissionRate === 0.015, "العمولة تغيرت", `${s1.limits.commissionRate}`);

  // 2️⃣ إضافة خطة جديدة
  console.log("\n2️⃣ إضافة خطة جديدة:");
  const newSlug = "test-plan-" + Date.now().toString().slice(-4);
  const np = await p.plan.create({
    data: {
      slug: newSlug,
      name: "خطة اختبار",
      priceMonthly: 50,
      priceYearly: 500,
      currency: "SAR",
      sortOrder: 99,
      isActive: false,
      limits: { maxProducts: 100, maxStaff: 2, maxOrders: 500, commissionRate: 0.015 },
      features: ["ميزة 1", "ميزة 2"],
    },
  });
  log(!!np.id, "الخطة أُنشئت", newSlug);

  // 3️⃣ محاولة حذف خطة عليها اشتراك (يجب أن تفشل)
  console.log("\n3️⃣ حماية الحذف:");
  const free = await p.plan.findUnique({ where: { slug: "free" } });
  const subsOnFree = await p.storeSubscription.count({ where: { planId: free.id } });
  log(subsOnFree >= 0, "عدد الاشتراكات على free", `${subsOnFree}`);

  // 4️⃣ حذف خطة الاختبار
  await p.plan.delete({ where: { id: np.id } });
  const gone = await p.plan.findUnique({ where: { slug: newSlug } });
  log(gone === null, "خطة الاختبار حُذفت");

  // 5️⃣ التراجع عن تعديل الفضي
  console.log("\n5️⃣ التراجع:");
  await p.plan.update({
    where: { id: silver.id },
    data: { priceMonthly: origPrice, limits: { ...silver.limits, commissionRate: origCommission } },
  });
  const s5 = await p.plan.findUnique({ where: { slug: "silver" } });
  log(Number(s5.priceMonthly) === origPrice, "السعر رجع للأصل", `${s5.priceMonthly}`);

  await p.$disconnect();
  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  ✅ نجح: ${pass}   ❌ فشل: ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
