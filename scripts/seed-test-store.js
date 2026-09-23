/**
 * يجهّز بيانات اختبار واقعية في متجر 'sss' لفحص لوحة التحكم بالكامل.
 * - يضيف منتجات وأقسام وعميلة وطلبات بحالات مختلفة
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.findUnique({
    where: { slug: "sss" },
    include: { subscriptions: { include: { plan: true } } },
  });
  if (!store) throw new Error("متجر sss غير موجود");

  console.log("🧹 تنظيف البيانات القديمة...");
  await prisma.orderItem.deleteMany({ where: { order: { storeId: store.id } } });
  await prisma.order.deleteMany({ where: { storeId: store.id } });
  await prisma.customer.deleteMany({ where: { storeId: store.id } });
  await prisma.product.deleteMany({ where: { storeId: store.id } });
  await prisma.category.deleteMany({ where: { storeId: store.id } });

  // 1) أقسام
  console.log("📂 إنشاء الأقسام...");
  const cats = await Promise.all(
    ["عبايات", "طرح", "فساتين", "إكسسوارات"].map((name, i) =>
      prisma.category.create({
        data: { storeId: store.id, name, slug: `cat-${i}`, sortOrder: i },
      })
    )
  );
  console.log("   ✓", cats.length, "أقسام");

  // 2) منتجات
  console.log("🛍️ إنشاء المنتجات...");
  const products = [
    { name: "عباية فستقية مطرزة", price: 450, compare: 600, stock: 12, featured: true, cat: 0, status: "ACTIVE" },
    { name: "عباية سوداء كلاسيك", price: 380, stock: 20, cat: 0, status: "ACTIVE" },
    { name: "طرحة حرير فاخرة", price: 120, stock: 40, cat: 1, status: "ACTIVE" },
    { name: "طرحة قطنية بسيطة", price: 65, stock: 0, cat: 1, status: "ACTIVE" },
    { name: "فستان سهرة وردي", price: 890, compare: 1100, stock: 5, featured: true, cat: 2, status: "ACTIVE" },
    { name: "فستان كاجوال رمادي", price: 290, stock: 15, cat: 2, status: "DRAFT" },
    { name: "ساعة يد ذهبية", price: 340, stock: 8, cat: 3, status: "ACTIVE" },
    { name: "عقد لؤلؤ", price: 210, stock: 3, cat: 3, status: "ARCHIVED" },
  ];
  let created = 0;
  for (const p of products) {
    await prisma.product.create({
      data: {
        storeId: store.id,
        name: p.name,
        slug: `prod-${Date.now()}-${created}`,
        description: `${p.name} — منتج اختبار عالي الجودة`,
        price: p.price,
        comparePrice: p.compare || null,
        stock: p.stock,
        status: p.status,
        isFeatured: !!p.featured,
        categoryId: cats[p.cat].id,
        images: p.featured
          ? ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600"]
          : [],
      },
    });
    created++;
  }
  console.log("   ✓", created, "منتجات (نشط/مسودة/مؤرشف/نفدت)");

  // 3) عميلة + طلبات بحالات مختلفة
  console.log("👥 إنشاء عميلة وطلبات...");
  const customer = await prisma.customer.create({
    data: {
      storeId: store.id,
      name: "نورة العتيبي",
      phone: "0551234567",
      email: "noura@example.com",
    },
  });

  const activeProducts = products.slice(0, 6).map((p, i) => ({ ...p, id: null }));
  const dbProducts = await prisma.product.findMany({ where: { storeId: store.id } });

  const ordersData = [
    { number: "SS-1001", status: "PENDING", paymentStatus: "COD", days: 0 },
    { number: "SS-1002", status: "CONFIRMED", paymentStatus: "COD", days: 1 },
    { number: "SS-1003", status: "DELIVERED", paymentStatus: "COD", days: 5 },
    { number: "SS-1004", status: "SHIPPED", paymentStatus: "COD", days: 2 },
    { number: "SS-1005", status: "PENDING", paymentStatus: "COD", days: 0 },
  ];

  for (let i = 0; i < ordersData.length; i++) {
    const o = ordersData[i];
    const p1 = dbProducts[i % dbProducts.length];
    const p2 = dbProducts[(i + 2) % dbProducts.length];
    const total = Number(p1.price) + Number(p2.price) * 2;
    const date = new Date();
    date.setDate(date.getDate() - o.days);

    await prisma.order.create({
      data: {
        storeId: store.id,
        number: o.number,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: "COD",
        subtotal: total,
        shipping: 25,
        discount: 0,
        total: total + 25,
        shippingAddress: { city: "الرياض", detail: "حي النرجس" },
        createdAt: date,
        items: {
          create: [
            { productId: p1.id, name: p1.name, price: Number(p1.price), quantity: 1 },
            { productId: p2.id, name: p2.name, price: Number(p2.price), quantity: 2 },
          ],
        },
      },
    });
  }
  console.log("   ✓", ordersData.length, "طلبات (قيد الانتظار/مؤكد/مشحون/تم التوصيل)");

  console.log("\n✅ اكتمل تجهيز بيانات الاختبار");
  console.log("📧 الدخول: lltt5ttll@gmail.com (من الإنشاء السابق)");
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
