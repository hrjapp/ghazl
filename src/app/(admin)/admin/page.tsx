import Link from "next/link";
import {
  Store,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
} from "lucide-react";
import { getPlatformStats, getGrowthSeries, getRecentStores, getExpiringSoon } from "@/lib/admin";

export const dynamic = "force-dynamic";

function MoneyBadge({ growth }: { growth: number }) {
  const up = growth >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
        up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(growth).toFixed(1)}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  growth,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  growth?: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {growth !== undefined && <MoneyBadge growth={growth} />}
      </div>
      <p className="mt-4 text-sm font-bold text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900 nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [stats, series, recent, expiring] = await Promise.all([
    getPlatformStats(),
    getGrowthSeries(6),
    getRecentStores(6),
    getExpiringSoon(7),
  ]);

  const fmt = (n: number) => n.toLocaleString("ar-SA");
  const fmtMoney = (n: number) =>
    n.toLocaleString("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 });

  const maxRevenue = Math.max(...series.map((s) => s.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">النظرة العامة</h1>
        <p className="mt-1 text-sm text-gray-500">
          مؤشرات أداء المنصة لشهر{" "}
          {new Date().toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Store}
          label="إجمالي المتاجر"
          value={fmt(stats.totalStores)}
          sub={`${stats.activeStores} نشط · ${stats.suspendedStores} موقوف · ${stats.pendingStores} قيد الانتظار`}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="طلبات هذا الشهر"
          value={fmt(stats.monthOrders)}
          sub={`إجمالي ${fmt(stats.totalOrders)} طلب`}
          growth={stats.orderGrowth}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={DollarSign}
          label="الإيرادات (مدفوع)"
          value={fmtMoney(stats.monthRevenue)}
          sub={`تراكمي ${fmtMoney(stats.totalRevenue)}`}
          growth={stats.revenueGrowth}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={Users}
          label="إجمالي المستخدمين"
          value={fmt(stats.totalUsers)}
          sub={`${fmt(stats.totalCustomers)} عميل · ${fmt(stats.totalProducts)} منتج`}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* تنبيه الاشتراكات */}
      {expiring.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-amber-900">
                {expiring.length} اشتراك ينتهي خلال 7 أيام
              </h3>
              <div className="mt-3 space-y-2">
                {expiring.slice(0, 4).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/admin/stores/${sub.store.id}`}
                    className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm hover:bg-white"
                  >
                    <span className="font-bold text-amber-900">{sub.store.name}</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <Clock className="h-3.5 w-3.5" />
                      {sub.expiresAt
                        ? new Date(sub.expiresAt).toLocaleDateString("ar-SA")
                        : "—"}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href="/admin/subscriptions"
                className="mt-3 inline-block text-sm font-bold text-amber-700 hover:underline"
              >
                عرض كل الاشتراكات ←
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* نمو الإيرادات */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-gray-900">نمو الإيرادات</h2>
          <p className="mt-1 text-xs text-gray-400">آخر 6 أشهر</p>
          <div className="mt-6 flex h-48 items-end justify-between gap-3">
            {series.map((s, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 nums">
                  {s.revenue > 0 ? fmtMoney(s.revenue) : "—"}
                </span>
                <div className="flex w-full items-end justify-center" style={{ height: "120px" }}>
                  <div
                    className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all"
                    style={{ height: `${Math.max((s.revenue / maxRevenue) * 100, 3)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* أحدث المتاجر */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-gray-900">أحدث المتاجر</h2>
          <div className="mt-4 space-y-3">
            {recent.length === 0 && (
              <p className="text-sm text-gray-400">لا توجد متاجر بعد</p>
            )}
            {recent.map((store) => (
              <Link
                key={store.id}
                href={`/admin/stores/${store.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5 hover:bg-gray-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-extrabold text-emerald-700">
                  {store.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{store.name}</p>
                  <p className="truncate text-[11px] text-gray-400">{store.owner.email}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                  {store.subscriptions[0]?.plan.name ?? "بدون باقة"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
