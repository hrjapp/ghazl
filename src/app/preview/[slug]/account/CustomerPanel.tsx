"use client";

import { customerLogoutAction } from "@/app/actions/customer-auth";
import { LogOut, Package, Phone, Mail, ShoppingBag } from "lucide-react";
import { useTransition } from "react";

type CustomerPanelProps = {
  store: { id: string; name: string };
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  orders?: {
    id: string;
    number: string;
    total: number;
    status: string;
    createdAt: Date;
  }[];
};

export function CustomerPanel({ store, customer, orders = [] }: CustomerPanelProps) {
  const [, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await customerLogoutAction();
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      {/* رأس اللوحة */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">
            أهلاً، {customer.name} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">لوحة عميل {store.name}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>

      {/* بطاقات الملخص */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <ShoppingBag className="h-5 w-5 text-brand-600" />
          <p className="mt-2 text-2xl font-extrabold text-gray-900 nums">
            {orders.length}
          </p>
          <p className="text-xs text-gray-400">إجمالي الطلبات</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <Phone className="h-5 w-5 text-brand-600" />
          <p className="mt-2 truncate text-sm font-bold text-gray-900 nums" dir="ltr">
            {customer.phone}
          </p>
          <p className="text-xs text-gray-400">الهاتف</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <Mail className="h-5 w-5 text-brand-600" />
          <p className="mt-2 truncate text-sm font-bold text-gray-900 nums" dir="ltr">
            {customer.email || "—"}
          </p>
          <p className="text-xs text-gray-400">البريد</p>
        </div>
      </div>

      {/* الطلبات */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <Package className="h-5 w-5 text-brand-600" />
            طلباتي
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">
              لا توجد طلبات بعد. تصفّح منتجات {store.name} واطلب الآن!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-bold text-gray-500">
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">المبلغ</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0">
                    <td className="p-4 text-sm font-bold text-gray-900 nums">
                      {o.number}
                    </td>
                    <td className="p-4 text-sm font-bold text-brand-600 nums">
                      {Number(o.total).toFixed(2)} ر.س
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400 nums">
                      {new Date(o.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
