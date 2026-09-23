import { prisma } from "./prisma";

/**
 * طبقة بيانات لوحة تحكم المنصة (Super Admin)
 * كل الاستعلامات على مستوى المنصة كاملة، وليست متجراً واحداً.
 */

// ════════════════════════════════════════════════════════════
//  المؤشرات الرئيسية (KPIs)
// ════════════════════════════════════════════════════════════

export async function getPlatformStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalStores,
    activeStores,
    suspendedStores,
    pendingStores,
    totalUsers,
    totalProducts,
    totalOrders,
    totalCustomers,
    monthOrders,
    prevMonthOrders,
    completedPayments,
    monthPayments,
    prevMonthPayments,
  ] = await Promise.all([
    prisma.store.count(),
    prisma.store.count({ where: { status: "ACTIVE" } }),
    prisma.store.count({ where: { status: "SUSPENDED" } }),
    prisma.store.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({
      where: { createdAt: { gte: startOfPrevMonth, lt: startOfMonth } },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "PAID",
        createdAt: { gte: startOfPrevMonth, lt: startOfMonth },
      },
      _sum: { amount: true },
    }),
  ]);

  // نسبة النمو
  const orderGrowth = prevMonthOrders
    ? ((monthOrders - prevMonthOrders) / prevMonthOrders) * 100
    : monthOrders > 0
      ? 100
      : 0;
  const revenueGrowth = Number(prevMonthPayments._sum.amount || 0)
    ? ((Number(monthPayments._sum.amount || 0) -
        Number(prevMonthPayments._sum.amount || 0)) /
        Number(prevMonthPayments._sum.amount || 0)) *
      100
    : Number(monthPayments._sum.amount || 0) > 0
      ? 100
      : 0;

  return {
    totalStores,
    activeStores,
    suspendedStores,
    pendingStores,
    totalUsers,
    totalProducts,
    totalOrders,
    totalCustomers,
    monthOrders,
    orderGrowth,
    totalRevenue: Number(completedPayments._sum.amount || 0),
    monthRevenue: Number(monthPayments._sum.amount || 0),
    revenueGrowth,
  };
}

// ════════════════════════════════════════════════════════════
//  المتاجر — قائمة مع فلترة وترقيم صفحات
// ════════════════════════════════════════════════════════════

export type StoreWithStats = Awaited<ReturnType<typeof getStores>>["items"][number];

export async function getStores(opts: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  plan?: string;
} = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, opts.perPage ?? 10);
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};
  if (opts.status && opts.status !== "all") where.status = opts.status;
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { slug: { contains: opts.search, mode: "insensitive" } },
      { owner: { name: { contains: opts.search, mode: "insensitive" } } },
      { owner: { email: { contains: opts.search, mode: "insensitive" } } },
    ];
  }
  if (opts.plan && opts.plan !== "all") {
    where.subscriptions = { some: { plan: { slug: opts.plan } } };
  }

  const [items, total] = await Promise.all([
    prisma.store.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true,
          },
        },
        subscriptions: {
          orderBy: { startedAt: "desc" },
          take: 1,
          include: { plan: true },
        },
      },
    }),
    prisma.store.count({ where }),
  ]);

  // إحصائيات سريعة لكل متجر (طلبات + إيرادات هذا الشهر)
  const storeIds = items.map((s) => s.id);
  const monthlyAgg = await prisma.order.groupBy({
    by: ["storeId"],
    where: {
      storeId: { in: storeIds },
      createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
    _count: { _all: true },
  });
  const revenueAgg = await prisma.payment.groupBy({
    by: ["storeId"],
    where: {
      storeId: { in: storeIds },
      status: "PAID",
    },
    _sum: { amount: true },
  });

  const monthMap = new Map(monthlyAgg.map((m) => [m.storeId, m._count._all]));
  const revMap = new Map(revenueAgg.map((m) => [m.storeId, Number(m._sum.amount || 0)]));

  return {
    items: items.map((s) => ({
      ...s,
      monthOrders: monthMap.get(s.id) ?? 0,
      revenue: revMap.get(s.id) ?? 0,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage) || 1,
  };
}

// ════════════════════════════════════════════════════════════
//  تفاصيل متجر واحد (عرض شامل)
// ════════════════════════════════════════════════════════════

export async function getStoreDetail(id: string) {
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      owner: true,
      memberships: { include: { user: { select: { id: true, name: true, email: true } } } },
      subscriptions: {
        orderBy: { startedAt: "desc" },
        include: { plan: true },
      },
      _count: {
        select: { products: true, orders: true, customers: true, categories: true, discounts: true },
      },
    },
  });
  if (!store) return null;

  const [payments, ordersByStatus, last30Orders] = await Promise.all([
    prisma.payment.aggregate({
      where: { storeId: id, status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { storeId: id },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { storeId: id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { items: true, payment: true },
    }),
  ]);

  return {
    ...store,
    totalRevenue: Number(payments._sum.amount || 0),
    paidPayments: payments._count,
    ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count._all })),
    last30Orders,
  };
}

// ════════════════════════════════════════════════════════════
//  الاشتراكات — كل اشتراكات المنصة
// ════════════════════════════════════════════════════════════

export async function getSubscriptions(opts: {
  page?: number;
  perPage?: number;
  status?: string;
} = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, opts.perPage ?? 10);
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};
  if (opts.status && opts.status !== "all") where.status = opts.status;

  const [items, total] = await Promise.all([
    prisma.storeSubscription.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { startedAt: "desc" },
      include: {
        store: {
          select: { id: true, name: true, slug: true, status: true },
        },
        plan: true,
      },
    }),
    prisma.storeSubscription.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage) || 1,
  };
}

/**
 * اشتراكات قاربت على الانتهاء (خلال X يوماً)
 */
export async function getExpiringSoon(days = 7) {
  const now = new Date();
  const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.storeSubscription.findMany({
    where: {
      status: { in: ["ACTIVE", "TRIALING"] },
      expiresAt: { gte: now, lte: limit },
    },
    orderBy: { expiresAt: "asc" },
    include: {
      store: { select: { id: true, name: true, slug: true, status: true } },
      plan: true,
    },
  });
}

// ════════════════════════════════════════════════════════════
//  نمو النمو — سلسلة زمنية للأشهر الأخيرة
// ════════════════════════════════════════════════════════════

export async function getGrowthSeries(months = 6) {
  const now = new Date();
  const out: { label: string; stores: number; orders: number; revenue: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = start.toLocaleDateString("ar-SA", { month: "short", year: "numeric" });

    const [stores, orders, revenue] = await Promise.all([
      prisma.store.count({ where: { createdAt: { lt: end } } }),
      prisma.order.count({ where: { createdAt: { gte: start, lt: end } } }),
      prisma.payment.aggregate({
        where: { status: "PAID", createdAt: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
    ]);

    out.push({
      label,
      stores,
      orders,
      revenue: Number(revenue._sum.amount || 0),
    });
  }

  return out;
}

/**
 * توزيع المتاجر على الباقات
 */
export async function getPlanDistribution() {
  const grouped = await prisma.storeSubscription.groupBy({
    by: ["planId"],
    where: { status: { in: ["ACTIVE", "TRIALING"] } },
    _count: { _all: true },
  });
  const plans = await prisma.plan.findMany({
    where: { id: { in: grouped.map((g) => g.planId) } },
  });
  const planMap = new Map(plans.map((p) => [p.id, p]));
  return grouped.map((g) => ({
    plan: planMap.get(g.planId),
    count: g._count._all,
  }));
}

/**
 * أحدث المتاجر المنشأة
 */
export async function getRecentStores(limit = 5) {
  return prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      owner: { select: { name: true, email: true } },
      subscriptions: { take: 1, orderBy: { startedAt: "desc" }, include: { plan: true } },
    },
  });
}
