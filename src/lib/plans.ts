import { prisma } from "./prisma";

// تعريفات الباقات الأساسية لمنصة متاجر
// تُزرع في قاعدة البيانات عند التشغيل الأول (seed)
export const PLAN_DEFS = [
  {
    slug: "free",
    name: "المجاني",
    tagline: "ابدأ متجرك بدون أي تكلفة",
    description: "مثالي للمبتدئين والتجارب الأولى. أنشئ متجرك وابدأ البيع فوراً.",
    priceMonthly: 0,
    priceYearly: 0,
    isPopular: false,
    sortOrder: 1,
    limits: {
      maxProducts: 25,
      maxStaff: 1,
      hasCustomDomain: false,
      hasDiscounts: false,
      hasReports: false,
      hasAbandonedCarts: false,
      commissionRate: 0.02, // عمولة المنصة على كل طلب
    },
    features: [
      "حتى 25 منتج",
      "مستخدم واحد",
      "نطاق فرعي مجاني (متجرك.متاجر)",
      "واجهة متجر احترافية",
      "إدارة الطلبات الأساسية",
      "دعم عبر البريد",
    ],
  },
  {
    slug: "silver",
    name: "الفضي",
    tagline: "للتجار الذين يكبرون",
    description: "مزايا أكثر وعمولة أقل لمتجر ينمو. مناسب للمتاجر النشطة.",
    priceMonthly: 99,
    priceYearly: 999,
    isPopular: true,
    sortOrder: 2,
    limits: {
      maxProducts: 500,
      maxStaff: 5,
      hasCustomDomain: true,
      hasDiscounts: true,
      hasReports: true,
      hasAbandonedCarts: false,
      commissionRate: 0.01,
    },
    features: [
      "حتى 500 منتج",
      "حتى 5 مستخدمين",
      "نطاق مخصص (domain.com)",
      "أكواد الخصومات والعروض",
      "تقارير المبيعات المتقدمة",
      "أتمتة الطلبات والإشعارات",
      "دعم ذو أولوية",
    ],
  },
  {
    slug: "gold",
    name: "الذهبي",
    tagline: "الخيار الاحترافي الكامل",
    description: "كل ما تحتاجه متاجر كبيرة: لا حدود للمنتجات، تقارير عميقة، وأدوات تسويقية.",
    priceMonthly: 249,
    priceYearly: 2490,
    isPopular: false,
    sortOrder: 3,
    limits: {
      maxProducts: -1, // غير محدود
      maxStaff: -1,
      hasCustomDomain: true,
      hasDiscounts: true,
      hasReports: true,
      hasAbandonedCarts: true,
      commissionRate: 0.005,
    },
    features: [
      "منتجات غير محدودة",
      "مستخدمون غير محدودين",
      "نطاق مخصص + شهادة SSL",
      "استرجاع السلات المتروكة",
      "تقارير وتحليلات معمقة",
      "ربط بوابات دفع متعددة",
      "أدوات التسويق والولاء",
      "دعم مخصص 24/7",
    ],
  },
] as const;

/** زرع الباقات في قاعدة البيانات إن لم تكن موجودة */
export async function ensurePlansSeeded() {
  for (const def of PLAN_DEFS) {
    const exists = await prisma.plan.findUnique({ where: { slug: def.slug } });
    if (!exists) {
      await prisma.plan.create({
        data: {
          slug: def.slug,
          name: def.name,
          tagline: def.tagline,
          description: def.description,
          priceMonthly: def.priceMonthly,
          priceYearly: def.priceYearly,
          limits: def.limits as object,
          features: [...def.features],
          isPopular: def.isPopular,
          sortOrder: def.sortOrder,
        },
      });
    }
  }
}

export type PlanLimits = {
  maxProducts: number;
  maxStaff: number;
  hasCustomDomain: boolean;
  hasDiscounts: boolean;
  hasReports: boolean;
  hasAbandonedCarts: boolean;
  commissionRate: number;
};

/** جلب حدود باقة المتجر الحالي */
export async function getStoreLimits(storeId: string): Promise<PlanLimits> {
  const sub = await prisma.storeSubscription.findFirst({
    where: { storeId, status: { in: ["ACTIVE", "TRIALING"] } },
    include: { plan: true },
    orderBy: { startedAt: "desc" },
  });

  const plan = sub?.plan;
  if (!plan) {
    // الرجوع للباقة المجانية افتراضياً
    const free = await prisma.plan.findUnique({ where: { slug: "free" } });
    return (free?.limits as PlanLimits) ?? (PLAN_DEFS[0].limits as PlanLimits);
  }
  return plan.limits as PlanLimits;
}
