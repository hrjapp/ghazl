import { requireStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber, toStringArray } from "@/lib/convert";
import { PlansGrid } from "./PlansGrid";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const { store } = await requireStore();

  const [plans, subscription] = await Promise.all([
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.storeSubscription.findFirst({
      where: { storeId: store.id, status: { in: ["ACTIVE", "TRIALING"] } },
      include: { plan: true },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const currentPlan = subscription?.plan;
  const isTrialing = subscription?.status === "TRIALING";

  // تحويل أنواع Prisma (Decimal/Json) إلى أنواع عادية للواجهة
  const plansForUI = plans.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    priceMonthly: toNumber(p.priceMonthly),
    priceYearly: toNumber(p.priceYearly),
    features: toStringArray(p.features),
    isPopular: p.isPopular,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">الباقة والاشتراك</h1>
        <p className="mt-1 text-sm text-gray-500">
          اختر الباقة التي تناسب نمو متجرك — يمكنك التغيير أو الإلغاء في أي وقت.
        </p>
      </div>

      {/* حالة الاشتراك الحالي */}
      {currentPlan && (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-l from-brand-50 to-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">اشتراكك الحالي</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-800">
                {currentPlan.name}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {isTrialing && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    فترة تجريبية
                  </span>
                )}
                {subscription?.expiresAt && (
                  <span className="nums">
                    ينتهي في: {new Date(subscription.expiresAt).toLocaleDateString("ar-SA")}
                  </span>
                )}
                {Number(currentPlan.priceMonthly) > 0 && (
                  <span className="nums">
                    {Number(currentPlan.priceMonthly).toLocaleString("ar-SA")} ر.س شهرياً
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <span className="text-3xl">
                {currentPlan.slug === "gold" ? "👑" : currentPlan.slug === "silver" ? "🥈" : "🆓"}
              </span>
            </div>
          </div>
        </div>
      )}

      <PlansGrid
        plans={plansForUI}
        currentPlanSlug={currentPlan?.slug || null}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-extrabold text-gray-900 mb-3">سجل الاشتراكات</h2>
        <SubscriptionHistory storeId={store.id} />
      </div>
    </div>
  );
}

async function SubscriptionHistory({ storeId }: { storeId: string }) {
  const history = await prisma.storeSubscription.findMany({
    where: { storeId },
    include: { plan: true },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  if (history.length === 0) {
    return <p className="text-sm text-gray-400">لا يوجد سجل بعد.</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {history.map((sub) => (
        <div key={sub.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-bold text-gray-900">{sub.plan.name}</p>
            <p className="text-xs text-gray-400 nums">
              بدأ: {new Date(sub.startedAt).toLocaleDateString("ar-SA")}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              sub.status === "ACTIVE"
                ? "bg-brand-100 text-brand-700"
                : sub.status === "TRIALING"
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {sub.status === "ACTIVE"
              ? "نشط"
              : sub.status === "TRIALING"
              ? "تجريبي"
              : sub.status === "CANCELLED"
              ? "ملغي"
              : "منتهي"}
          </span>
        </div>
      ))}
    </div>
  );
}
