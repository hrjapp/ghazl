"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Store, ChevronLeft, ChevronRight } from "lucide-react";

type StoreItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: Date;
  owner: { name: string | null; email: string | null };
  _count: { products: number; orders: number; customers: number };
  subscriptions: { plan: { name: string } }[];
  monthOrders: number;
  revenue: number;
};

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

export function StoresTable({
  items,
  totalPages,
  page,
  search,
  status,
  plans,
}: {
  items: StoreItem[];
  totalPages: number;
  page: number;
  search: string;
  status: string;
  plans: { slug: string; name: string }[];
}) {
  const [localSearch, setLocalSearch] = useState(search);

  const buildUrl = (overrides: Record<string, string | number>) => {
    const params = new URLSearchParams();
    const merged = { search: localSearch, status, page, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && String(v) && !(k === "page" && v === 1) && !(k === "status" && v === "all"))
        params.set(k, String(v));
    });
    const qs = params.toString();
    return qs ? `/admin/stores?${qs}` : "/admin/stores";
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <Store className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 font-extrabold text-gray-900">لا توجد متاجر</h3>
        <p className="mt-1 text-sm text-gray-400">لم يتم العثور على متاجر تطابق الفلاتر الحالية</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* الفلاتر */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") window.location.href = buildUrl({ search: localSearch, page: 1 });
            }}
            placeholder="ابحث باسم المتجر أو النطاق أو المالك..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-10 pl-4 text-sm font-medium text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Link
            href={buildUrl({ status: "all", page: 1 })}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
              status === "all" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            الكل
          </Link>
          {Object.keys(STATUS_LABELS).map((s) => (
            <Link
              key={s}
              href={buildUrl({ status: s, page: 1 })}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                status === s ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>

      {/* الجدول */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-bold text-gray-500">
                <th className="p-4">المتجر</th>
                <th className="p-4">المالك</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">الباقة</th>
                <th className="p-4">المنتجات</th>
                <th className="p-4">الطلبات</th>
                <th className="p-4">العملاء</th>
                <th className="p-4">الإيرادات</th>
                <th className="p-4">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <Link
                      href={`/admin/stores/${store.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-extrabold text-emerald-700">
                        {store.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-gray-900 hover:text-emerald-700">
                          {store.name}
                        </p>
                        <p className="truncate text-[11px] text-gray-400">{store.slug}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-900">{store.owner.name ?? "—"}</p>
                    <p className="text-[11px] text-gray-400">{store.owner.email ?? "—"}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        STATUS_STYLES[store.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_LABELS[store.status] ?? store.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-gray-700">
                      {store.subscriptions[0]?.plan.name ?? "بدون باقة"}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-900 nums">
                    {store._count.products}
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-gray-900 nums">{store._count.orders}</p>
                    <p className="text-[10px] text-gray-400 nums">
                      {store.monthOrders} هذا الشهر
                    </p>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-900 nums">
                    {store._count.customers}
                  </td>
                  <td className="p-4 text-sm font-extrabold text-emerald-700 nums">
                    {store.revenue.toLocaleString("ar-SA")} ر.س
                  </td>
                  <td className="p-4 text-xs text-gray-500 nums">
                    {new Date(store.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ترقيم الصفحات */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-bold text-gray-500">
            الصفحة {page.toLocaleString("ar-SA")} من {totalPages.toLocaleString("ar-SA")}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={buildUrl({ page: Math.max(1, page - 1) })}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 ${
                page === 1
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-gray-50"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const num = start + i;
              if (num > totalPages) return null;
              return (
                <Link
                  key={num}
                  href={buildUrl({ page: num })}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold ${
                    num === page
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {num.toLocaleString("ar-SA")}
                </Link>
              );
            })}
            <Link
              href={buildUrl({ page: Math.min(totalPages, page + 1) })}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 ${
                page === totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
