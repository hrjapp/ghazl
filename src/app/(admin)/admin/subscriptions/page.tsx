import Link from "next/link";
import { getSubscriptions, getExpiringSoon } from "@/lib/admin";
import { CreditCard, Clock, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const SUB_STYLES: Record<string, string> = {
  TRIALING: "bg-blue-50 text-blue-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PAST_DUE: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-gray-100 text-gray-600",
  EXPIRED: "bg-red-50 text-red-700",
};
const SUB_LABELS: Record<string, string> = {
  TRIALING: "تجريبية",
  ACTIVE: "نشط",
  PAST_DUE: "متأخر",
  CANCELLED: "ملغي",
  EXPIRED: "منتهي",
};

function daysUntil(date: Date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "";
  const page = Number(sp.page) || 1;

  // فلترة "قارب على الانتهاء" تتجاوز status
  const status = filter === "expiring" ? "all" : sp.status ?? "all";

  const [{ items, total, totalPages }, expiring] = await Promise.all([
    getSubscriptions({ page, status }),
    getExpiringSoon(30),
  ]);

  const visible = filter === "expiring" ? expiring : items;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">الاشتراكات</h1>
        <p className="mt-1 text-sm text-gray-500">
          {filter === "expiring"
            ? `${expiring.length} اشتراك ينتهي خلال 30 يوماً`
            : `${total.toLocaleString("ar-SA")} اشتراك`}
        </p>
      </div>

      {/* تنبيه الاشتراكات المنتهية قريباً */}
      {expiring.length > 0 && filter !== "expiring" && (
        <Link
          href="/admin/subscriptions?filter=expiring"
          className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100/70"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-amber-900">
              {expiring.length} اشتراك ينتهي خلال 30 يوماً
            </p>
            <p className="text-xs text-amber-700">اضغط لعرضها كلها</p>
          </div>
        </Link>
      )}

      {/* الفلاتر */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/subscriptions"
          className={`rounded-xl px-3.5 py-2 text-xs font-bold ${
            status === "all" && filter !== "expiring"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          الكل
        </Link>
        {Object.keys(SUB_LABELS).map((s) => (
          <Link
            key={s}
            href={`/admin/subscriptions?status=${s}`}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold ${
              status === s
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            {SUB_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* الجدول */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 font-extrabold text-gray-900">لا توجد اشتراكات</h3>
          <p className="mt-1 text-sm text-gray-400">
            {filter === "expiring"
              ? "لا توجد اشتراكات تنتهي قريباً"
              : "لم يتم العثور على اشتراكات"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-right">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-bold text-gray-500">
                  <th className="p-4">المتجر</th>
                  <th className="p-4">الباقة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">تاريخ البدء</th>
                  <th className="p-4">تاريخ الانتهاء</th>
                  <th className="p-4">المتبقي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((sub) => {
                  const days = sub.expiresAt ? daysUntil(sub.expiresAt) : null;
                  const urgent = days !== null && days <= 7;
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <Link
                          href={`/admin/stores/${sub.store.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-extrabold text-emerald-700">
                            {sub.store.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 hover:text-emerald-700">
                              {sub.store.name}
                            </p>
                            <p className="text-[11px] text-gray-400">{sub.store.slug}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-900">{sub.plan.name}</p>
                        <p className="text-[11px] text-gray-400 nums">
                          {Number(sub.plan.priceMonthly).toLocaleString("ar-SA")} ر.س / شهر
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            SUB_STYLES[sub.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {SUB_LABELS[sub.status] ?? sub.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-gray-600 nums">
                        {new Date(sub.startedAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="p-4 text-xs font-medium text-gray-600 nums">
                        {sub.expiresAt
                          ? new Date(sub.expiresAt).toLocaleDateString("ar-SA")
                          : "غير محدد"}
                      </td>
                      <td className="p-4">
                        {days !== null ? (
                          <span
                            className={`flex items-center gap-1 text-xs font-bold ${
                              urgent ? "text-red-600" : "text-gray-600"
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {days > 0
                              ? `${days} يوم`
                              : days === 0
                                ? "اليوم"
                                : `منتهي ${Math.abs(days)}ي`}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ترقيم الصفحات */}
      {filter !== "expiring" && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 3, totalPages - 6));
            const num = start + i;
            if (num > totalPages) return null;
            return (
              <Link
                key={num}
                href={`/admin/subscriptions?status=${status}&page=${num}`}
                className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold ${
                  num === page
                    ? "bg-emerald-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {num.toLocaleString("ar-SA")}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
