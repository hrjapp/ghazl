/**
 * ⚡ اختبار فعلي للإجراءات الإدارية — إنشاء متجر تجريبي + إيقاف + تنشيط + حذف
 */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

let pass = 0, fail = 0;
const log = (ok, label, extra = "") => {
  if (ok) pass++; else fail++;
  console.log(`  ${ok ? "✅" : "❌"} ${label}${extra ? ` (${extra})` : ""}`);
};

(async () => {
  console.log("⚡ اختبار فعلي للإجراءات على قاعدة البيانات\n");

  // إنشاء مستخدم + متجر تجريبي
  console.log("1️⃣ تجهيز متجر تجريبي:");
  const slug = "admin-test-" + Date.now().toString().slice(-6);
  const user = await p.user.create({
    data: {
      name: "اختبار الإجراءات",
      email: `admin-test-${Date.now()}@ai-hrj.xyz`,
      passwordHash: "x",
    },
  });
  const plan = await p.plan.findFirst({ where: { slug: "free" } });
  const store = await p.store.create({
    data: {
      name: "متجر اختبار الإجراءات",
      slug,
      ownerId: user.id,
      status: "ACTIVE",
    },
  });
  log(!!store, "المتجر أُنشئ", store.slug);

  // 2️⃣ محاكاة suspendStoreAction
  console.log("\n2️⃣ إيقاف المتجر:");
  await p.store.update({ where: { id: store.id }, data: { status: "SUSPENDED" } });
  const suspended = await p.store.findUnique({ where: { id: store.id } });
  log(suspended.status === "SUSPENDED", "الحالة SUSPENDED", suspended.status);

  // 3️⃣ محاكاة activateStoreAction
  console.log("\n3️⃣ تنشيط المتجر:");
  await p.store.update({ where: { id: store.id }, data: { status: "ACTIVE" } });
  const active = await p.store.findUnique({ where: { id: store.id } });
  log(active.status === "ACTIVE", "الحالة ACTIVE", active.status);

  // 4️⃣ محاكاة changeStorePlanAction
  console.log("\n4️⃣ تغيير الباقة:");
  const gold = await p.plan.findFirst({ where: { slug: "gold" } });
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sub = await p.storeSubscription.create({
    data: { storeId: store.id, planId: gold.id, startedAt: now, expiresAt: expires, status: "ACTIVE" },
  });
  const subCheck = await p.storeSubscription.findUnique({ where: { id: sub.id }, include: { plan: true } });
  log(subCheck.plan.slug === "gold", "الباقة أصبحت gold", subCheck.plan.name);

  // 5️⃣ محاكاة extendSubscriptionAction
  console.log("\n5️⃣ تمديد الاشتراك:");
  const base = new Date(subCheck.expiresAt) > new Date() ? new Date(subCheck.expiresAt) : new Date();
  const newExpires = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
  await p.storeSubscription.update({ where: { id: sub.id }, data: { expiresAt: newExpires } });
  const extended = await p.storeSubscription.findUnique({ where: { id: sub.id } });
  const days = Math.round((new Date(extended.expiresAt) - new Date(subCheck.expiresAt)) / (24 * 60 * 60 * 1000));
  log(days === 30, "تم التمديد 30 يوم", `${days} يوم`);

  // 6️⃣ محاكاة deleteStoreAction (الحذف المتسلسل)
  console.log("\n6️⃣ الحذف المتسلسل:");
  // أضف منتج وعميل وطلب للتأكد من الحذف
  const cat = await p.category.create({ data: { storeId: store.id, name: "فئة", slug: "c" + Date.now() } });
  const prod = await p.product.create({
    data: { storeId: store.id, categoryId: cat.id, name: "منتج", price: 100, stock: 5, slug: "p" + Date.now() },
  });
  const cust = await p.customer.create({ data: { storeId: store.id, name: "عميل", phone: "0500000000" } });
  const addr = await p.address.create({
    data: { customerId: cust.id, storeId: store.id, fullName: "عميل", city: "الرياض", details: "حي", phone: "0500000000" },
  });
  const order = await p.order.create({
    data: {
      storeId: store.id,
      customerId: cust.id,
      number: "ORD-" + Date.now(),
      customerName: "عميل",
      customerPhone: "0500000000",
      subtotal: 100,
      total: 100,
      status: "PENDING",
      shippingAddress: { city: "الرياض", details: "حي" },
    },
  });
  await p.orderItem.create({ data: { orderId: order.id, productId: prod.id, name: prod.name, price: 100, quantity: 1 } });
  await p.payment.create({ data: { storeId: store.id, orderId: order.id, amount: 100, gateway: "cod", status: "COD" } });

  // الحذف
  await p.$transaction([
    p.orderItem.deleteMany({ where: { order: { storeId: store.id } } }),
    p.payment.deleteMany({ where: { storeId: store.id } }),
    p.order.deleteMany({ where: { storeId: store.id } }),
    p.address.deleteMany({ where: { customer: { storeId: store.id } } }),
    p.customer.deleteMany({ where: { storeId: store.id } }),
    p.discount.deleteMany({ where: { storeId: store.id } }),
    p.product.deleteMany({ where: { storeId: store.id } }),
    p.category.deleteMany({ where: { storeId: store.id } }),
    p.storeSubscription.deleteMany({ where: { storeId: store.id } }),
    p.storeMember.deleteMany({ where: { storeId: store.id } }),
    p.store.delete({ where: { id: store.id } }),
  ]);
  const gone = await p.store.findUnique({ where: { id: store.id } });
  log(!gone, "المتجر حُذف نهائياً");

  const leftovers = await p.$transaction([
    p.product.count({ where: { storeId: store.id } }),
    p.order.count({ where: { storeId: store.id } }),
    p.customer.count({ where: { storeId: store.id } }),
    p.storeSubscription.count({ where: { storeId: store.id } }),
  ]);
  log(leftovers.every((c) => c === 0), "لا بيانات يتيمة", `products:${leftovers[0]} orders:${leftovers[1]} customers:${leftovers[2]} subs:${leftovers[3]}`);

  // 7️⃣ تنظيف المستخدم
  await p.user.delete({ where: { id: user.id } });

  await p.$disconnect();
  console.log("\n════════════════════════════════════════════════════════════");
  console.log(`  ✅ نجح: ${pass}   ❌ فشل: ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
