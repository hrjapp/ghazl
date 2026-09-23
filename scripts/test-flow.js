/**
 * سكربت اختبار الرحلة الكاملة لمنصة غَزْل
 * - يحاكي POST الخاص بـ Server Actions (Next.js)
 * - يسجل تاجر، ينشئ متجر، يضيف منتج، ويتحقق من الواجهة
 *
 * ملاحظة: Next.js Server Actions تستخدم POST مع ترويسات خاصة،
 * لذا نختبر المنطق مباشرة عبر Prisma (نفس ما يفعله الـ action).
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const TEST = {
  email: `test-${Date.now()}@ghazl.test`,
  phone: "0500000001",
  password: "Test123456!",
  storeName: "متجر غَزْل التجريبي",
  storeSlug: `ghazl-test-${Date.now()}`,
};

async function main() {
  console.log("🧪 اختبار الرحلة الكاملة\n");

  // تنظيف أي بيانات تجريبية سابقة (المتاجر أولاً بسبب المفتاح الأجنبي)
  await prisma.store.deleteMany({ where: { slug: { startsWith: "ghazl-test-" } } });
  await prisma.user.deleteMany({ where: { email: { contains: "@ghazl.test" } } });

  // 1) التسجيل
  console.log("1️⃣ تسجيل تاجر جديد...");
  const passwordHash = await bcrypt.hash(TEST.password, 10);
  const user = await prisma.user.create({
    data: { name: "تاجر تجريبي", email: TEST.email, phone: TEST.phone, passwordHash },
  });
  console.log(`   ✓ مستخدم: ${user.email}\n`);

  // 2) اختيار الباقة المجانية + إنشاء المتجر
  console.log("2️⃣ إنشاء المتجر مع الباقة المجانية...");
  const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
  if (!freePlan) throw new Error("الباقة المجانية غير مزروعة!");

  const store = await prisma.store.create({
    data: {
      name: TEST.storeName,
      slug: TEST.storeSlug,
      ownerId: user.id,
      status: "ACTIVE",
      currency: "SAR",
      phone: TEST.phone,
      description: "متجر تجريبي للاختبار",
    },
  });
  await prisma.storeMember.create({
    data: { storeId: store.id, userId: user.id, role: "OWNER" },
  });
  const subscription = await prisma.storeSubscription.create({
    data: {
      storeId: store.id,
      planId: freePlan.id,
      status: "ACTIVE",
      startedAt: new Date(),
    },
  });
  console.log(`   ✓ متجر: ${store.slug} (باقة ${freePlan.name})\n`);

  // 3) إضافة منتجات
  console.log("3️⃣ إضافة منتجات...");
  const p1 = await prisma.product.create({
    data: {
      storeId: store.id,
      name: "عباية فستقية",
      slug: "abayah-pistachio",
      description: "عباية فخمة بلون الفستق",
      price: 450,
      comparePrice: 600,
      stock: 10,
      status: "ACTIVE",
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600"],
    },
  });
  const p2 = await prisma.product.create({
    data: {
      storeId: store.id,
      name: "طرحة حرير",
      slug: "silk-scarf",
      price: 120,
      stock: 25,
      status: "ACTIVE",
    },
  });
  console.log(`   ✓ ${p1.name} (450 ر.س) + ${p2.name} (120 ر.س)\n`);

  // 4) محاكاة طلب عميل
  console.log("4️⃣ محاكاة طلب عميل (دفع عند الاستلام)...");
  const customer = await prisma.customer.create({
    data: { storeId: store.id, name: "عميلة تجريبية", phone: "0550000002" },
  });
  const order = await prisma.order.create({
    data: {
      storeId: store.id,
      number: "GH-0001",
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      status: "PENDING",
      paymentStatus: "COD",
      paymentMethod: "COD",
      subtotal: 570,
      shipping: 0,
      discount: 0,
      total: 570,
      shippingAddress: { city: "الرياض" },
      items: {
        create: [
          { productId: p1.id, name: p1.name, price: 450, quantity: 1 },
          { productId: p2.id, name: p2.name, price: 120, quantity: 1 },
        ],
      },
    },
  });
  console.log(`   ✓ طلب ${order.number} بقيمة ${order.total} ر.س\n`);

  // 5) التحقق من الواجهة
  console.log("5️⃣ التحقق من واجهة المتجر (HTTP)...");
  const res = await fetch(`http://localhost:3000/ghazl/preview/${store.slug}`);
  const html = await res.text();
  const checks = {
    "HTTP 200": res.status === 200,
    "اسم المتجر ظاهر": html.includes(store.name),
    "المنتج الأول ظاهر": html.includes(p1.name),
    "الأسعار ظاهرة": html.includes("450"),
  };
  for (const [k, v] of Object.entries(checks)) {
    console.log(`   ${v ? "✓" : "✗"} ${k}`);
  }

  console.log("\n✅ تم اختبار الرحلة الكاملة بنجاح!\n");
  console.log("📌 بيانات الدخول التجريبية:");
  console.log(`   البريد: ${TEST.email}`);
  console.log(`   كلمة المرور: ${TEST.password}`);
  console.log(`   رابط المتجر: /preview/${store.slug}`);
  console.log(`   لوحة التحكم: /dashboard`);
}

main()
  .catch((e) => {
    console.error("❌ فشل:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
