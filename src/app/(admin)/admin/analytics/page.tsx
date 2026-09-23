import { getGrowthSeries, getPlatformStats, getPlanDistribution } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Store, ShoppingCart, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-400",
  silver: "bg-gradient-to-r from-gray-300 to-gray-500",
  gold: "bg-gradient-to-r from-amber-400 to-amber-600",
};

export default async function AdminAnalyticsPage() {
  const [series, stats, planDist] = await Promise.all([
    getGrowthSeries(12),
    getPlatformStats(),
    getPlanDistribution(),
  ]);

  const fmtMoney = (n: number) =>
    n.toLocaleString("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 });
  const fmt = (n: number) => n.toLocaleString("ar-SA");

  // أعلى المتاجر إيراداً
  const topStores = await prisma.payment.groupBy({
    by: ["storeId"],
    where: { status: "PAID" },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 8,
  });
  const storeIds = topStores.map((t) => t.storeId);
  const stores = await prisma.store.findMany({
    where: { id: { in: storeIds } },
    select: { id: true, name: true, slug: true },
  });
  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const maxStoreRevenue = topStores[0] ? Number(topStores[0]._sum.amount) : 1;

  const totalSubs = planDist.reduce((a, p) => a + p.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">التقارير والتحليلات</h1>
        <p className="mt-1 text-sm text-gray-500">أداء المنصة خلال آخر 12 شهراً</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Store, label: "المتاجر", value: fmt(stats.totalStores), color: "bg-emerald-50 text-emerald-600" },
          { icon: ShoppingCart, label: "الطلبات", value: fmt(stats.totalOrders), color: "bg-blue-50 text-blue-600" },
          { icon: DollarSign, label: "الإيرادات", value: fmtMoney(stats.totalRevenue), color: "bg-violet-50 text-violet-600" },
          { icon: TrendingUp, label: "نمو الطلبات", value: `${stats.orderGrowth.toFixed(1)}%`, color: "bg-amber-50 text-amber-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-gray-500">{s.label}</p>
              <p className="mt-0.5 text-xl font-extrabold text-gray-900 nums">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* نمو الطلبات والإيرادات */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-gray-900">نمو الإيرادات والطلبات</h2>
          <p className="mt-1 text-xs text-gray-400">آخر 12 شهراً</p>
          <div className="mt-6 flex h-56 items-end justify-between gap-2">
            {series.map((s, i) => {
              const maxRev = Math.max(...series.map((x) => x.revenue), 1);
              const maxOrd = Math.max(...series.map((x) => x.orders), 1);
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full items-end justify-center gap-0.5" style={{ height: "150px" }}>
                    <div
                      className="w-1/2 max-w-[20px] rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400"
                      style={{ height: `${Math.max((s.revenue / maxRev) * 100, 2)}%` }}
                      title={`الإيرادات: ${fmtMoney(s.revenue)}`}
                    />
                    <div
                      className="w-1/2 max-w-[20px] rounded-t bg-gradient-to-t from-blue-500 to-blue-400"
                      style={{ height: `${Math.max((s.orders / maxOrd) * 100, 2)}%` }}
                      title={`الطلبات: ${s.orders}`}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-gray-400">{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2.5 w-2.5 rounded bg-emerald-500" /> الإيرادات
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2.5 w-2.5 rounded bg-blue-500" /> الطلبات
            </span>
          </div>
        </div>

        {/* توزيع الباقات */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-gray-900">توزيع الباقات</h2>
          <div className="mt-5 space-y-4">
            {planDist.length === 0 && (
              <p className="text-sm text-gray-400">لا توجد اشتراكات</p>
            )}
            {planDist.map((p) => {
              const plan = p.plan;
              if (!plan) return null;
              const pct = Math.round((p.count / totalSubs) * 100);
              return (
                <div key={plan.id}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-700">{plan.name}</span>
                    <span className="text-gray-400 nums">
                      {p.count} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${PLAN_COLORS[plan.slug] ?? "bg-emerald-500"}`}
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* أعلى المتاجر إيراداً */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-extrabold text-gray-900">أعلى المتاجر إيراداً</h2>
        <div className="mt-5 space-y-3">
          {topStores.length === 0 && (
            <p className="text-sm text-gray-400">لا توجد إيرادات بعد</p>
          )}
          {topStores.map((t, i) => {
            const store = storeMap.get(t.storeId);
            if (!store) return null;
            const rev = Number(t._sum.amount || 0);
            return (
              <div key={t.storeId} className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-extrabold text-gray-600 nums">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-gray-900">{store.name}</p>
                    <p className="shrink-0 text-sm font-extrabold text-emerald-700 nums">
                      {fmtMoney(rev)}
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400"
                      style={{ width: `${Math.max((rev / maxStoreRevenue) * 100, 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
