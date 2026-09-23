import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Store as StoreIcon,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Calendar,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { getStoreDetail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { StoreActions } from "./StoreActions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-red-50 text-red-700",
  CLOSED: "bg-gray-100 text-gray-600",
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "نشط",
  PENDING: "قيد الانتظار",
  SUSPENDED: "موقوف",
  CLOSED: "مغلق",
};
const SUB_LABELS: Record<string, string> = {
  TRIALING: "فترة تجريبية",
  ACTIVE: "نشط",
  PAST_DUE: "متأخر الدفع",
  CANCELLED: "ملغي",
  EXPIRED: "منتهي",
};
const ORDER_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
  RETURNED: "مرتجع",
};

function daysUntil(date: Date) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStoreDetail(id);
  if (!store) notFound();

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const fmtMoney = (n: number) =>
    n.toLocaleString("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 });

  const currentSub = store.subscriptions[0];
  const daysLeft = currentSub?.expiresAt ? daysUntil(currentSub.expiresAt) : null;

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-extrabold text-white">
            {store.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">{store.name}</h1>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  STATUS_STYLES[store.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {STATUS_LABELS[store.status] ?? store.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {store.slug} · أنشئ{" "}
              {new Date(store.createdAt).toLocaleDateString("ar-SA")}
            </p>
          </div>
        </div>
        <Link
          href={`/preview/${store.slug}`}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          زيارة المتجر
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* إجراءات إدارية */}
      <StoreActions
        storeId={store.id}
        storeName={store.name}
        status={store.status}
        subscriptionId={store.subscriptions[0]?.id ?? null}
        currentPlanSlug={store.subscriptions[0]?.plan.slug ?? null}
        plans={plans}
      />

      {/* بطاقات الإحصائيات */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { icon: DollarSign, label: "الإيرادات", value: fmtMoney(store.totalRevenue), color: "bg-emerald-50 text-emerald-600" },
          { icon: ShoppingCart, label: "الطلبات", value: store._count.orders.toLocaleString("ar-SA"), color: "bg-blue-50 text-blue-600" },
          { icon: Package, label: "المنتجات", value: store._count.products.toLocaleString("ar-SA"), color: "bg-violet-50 text-violet-600" },
          { icon: Users, label: "العملاء", value: store._count.customers.toLocaleString("ar-SA"), color: "bg-amber-50 text-amber-600" },
          { icon: StoreIcon, label: "الفئات", value: store._count.categories.toLocaleString("ar-SA"), color: "bg-pink-50 text-pink-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-gray-500">{s.label}</p>
              <p className="mt-0.5 text-lg font-extrabold text-gray-900 nums">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* معلومات المتجر */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-gray-900">معلومات المتجر</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["المالك", store.owner.name ?? "—"],
              ["البريد", store.owner.email ?? "—"],
              ["الهاتف", store.owner.phone ?? "—"],
              ["الوصف", store.description ?? "لا يوجد"],
              ["العملة", store.currency],
              ["الدولة", store.country],
              ["المدينة", store.city ?? "—"],
              ["العنوان", store.address ?? "—"],
              ["هاتف المتجر", store.phone ?? "—"],
              ["بريد المتجر", store.email ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 border-b border-gray-50 pb-2.5">
                <dt className="font-bold text-gray-500">{k}</dt>
                <dd className="text-left font-medium text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* الاشتراك الحالي + السجل */}
        <div className="lg:col-span-2 space-y-6">
          {/* الاشتراك الحالي */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold text-gray-900">الاشتراك الحالي</h2>
            {currentSub ? (
              <div className="mt-4">
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-l from-emerald-50 to-white p-4 ring-1 ring-emerald-100">
                  <div>
                    <p className="font-extrabold text-gray-900">{currentSub.plan.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {fmtMoney(Number(currentSub.plan.priceMonthly))} / شهرياً
                    </p>
                  </div>
                  <div className="text-left">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        currentSub.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {SUB_LABELS[currentSub.status] ?? currentSub.status}
                    </span>
                    {daysLeft !== null && (
                      <p
                        className={`mt-1.5 text-xs font-bold ${
                          daysLeft <= 3
                            ? "text-red-600"
                            : daysLeft <= 7
                              ? "text-amber-600"
                              : "text-gray-500"
                        }`}
                      >
                        {daysLeft > 0
                          ? `ينتهي بعد ${daysLeft} يوم`
                          : daysLeft === 0
                            ? "ينتهي اليوم!"
                            : `منتهي منذ ${Math.abs(daysLeft)} يوم`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-gray-100 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Calendar className="h-3.5 w-3.5" /> تاريخ البدء
                    </p>
                    <p className="mt-1 font-bold text-gray-900 nums">
                      {new Date(currentSub.startedAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Calendar className="h-3.5 w-3.5" /> تاريخ الانتهاء
                    </p>
                    <p className="mt-1 font-bold text-gray-900 nums">
                      {currentSub.expiresAt
                        ? new Date(currentSub.expiresAt).toLocaleDateString("ar-SA")
                        : "غير محدد"}
                    </p>
                  </div>
                  {currentSub.trialEndsAt && (
                    <div className="rounded-xl border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500">نهاية التجربة</p>
                      <p className="mt-1 font-bold text-gray-900 nums">
                        {new Date(currentSub.trialEndsAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  )}
                  {currentSub.cancelledAt && (
                    <div className="rounded-xl border border-gray-100 p-3">
                      <p className="text-xs font-bold text-gray-500">تاريخ الإلغاء</p>
                      <p className="mt-1 font-bold text-gray-900 nums">
                        {new Date(currentSub.cancelledAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400">لا يوجد اشتراك نشط</p>
            )}
          </div>

          {/* سجل الاشتراكات */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold text-gray-900">سجل الاشتراكات</h2>
            <div className="mt-4 space-y-3">
              {store.subscriptions.length === 0 && (
                <p className="text-sm text-gray-400">لا يوجد سجل</p>
              )}
              {store.subscriptions.map((sub, i) => (
                <div
                  key={sub.id}
                  className="relative flex items-start gap-3 rounded-xl border border-gray-100 p-3"
                >
                  {i < store.subscriptions.length - 1 && (
                    <span className="absolute right-[18px] top-12 h-[calc(100%-3rem)] w-px bg-gray-100" />
                  )}
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      i === 0 ? "bg-emerald-100" : "bg-gray-100"
                    }`}
                  >
                    <CreditCard className={`h-4 w-4 ${i === 0 ? "text-emerald-600" : "text-gray-400"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900">{sub.plan.name}</p>
                      <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                        {SUB_LABELS[sub.status] ?? sub.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400 nums">
                      {new Date(sub.startedAt).toLocaleDateString("ar-SA")} ←{" "}
                      {sub.expiresAt
                        ? new Date(sub.expiresAt).toLocaleDateString("ar-SA")
                        : "مفتوح"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* حالة الطلبات + الفريق */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-gray-900">حالة الطلبات</h2>
          <div className="mt-4 space-y-2.5">
            {store.ordersByStatus.length === 0 && (
              <p className="text-sm text-gray-400">لا توجد طلبات</p>
            )}
            {store.ordersByStatus.map((o) => {
              const pct = store._count.orders
                ? Math.round((o.count / store._count.orders) * 100)
                : 0;
              return (
                <div key={o.status}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-600">
                      {ORDER_LABELS[o.status] ?? o.status}
                    </span>
                    <span className="text-gray-400 nums">{o.count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-gray-900">فريق المتجر</h2>
          <div className="mt-4 space-y-3">
            {store.memberships.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-sm font-extrabold text-gray-600">
                  {m.user.name?.charAt(0) ?? "؟"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{m.user.name}</p>
                  <p className="truncate text-[11px] text-gray-400">{m.user.email}</p>
                </div>
                <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-600">
                  {m.role === "OWNER" ? "المالك" : m.role === "ADMIN" ? "مدير" : "موظف"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* أحدث الطلبات */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-extrabold text-gray-900">أحدث الطلبات</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-right">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-500">
                <th className="p-3">رقم الطلب</th>
                <th className="p-3">العميل</th>
                <th className="p-3">الإجمالي</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {store.last30Orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="p-3 text-sm font-bold text-gray-900 nums">{order.number}</td>
                  <td className="p-3 text-sm font-medium text-gray-700">{order.customerName}</td>
                  <td className="p-3 text-sm font-bold text-emerald-700 nums">
                    {Number(order.total).toLocaleString("ar-SA")} ر.س
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-600">
                      {ORDER_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-400 nums">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
