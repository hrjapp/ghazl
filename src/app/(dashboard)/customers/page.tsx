import { requireStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const { store } = await requireStore();

  const customers = await prisma.customer.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">العملاء</h1>
        <p className="mt-1 text-sm text-gray-500">
          عملاء متجرك — {customers.length} عميل
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <Users className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">لا يوجد عملاء بعد</h3>
          <p className="mt-1 text-sm text-gray-500">
            يُضاف العملاء تلقائياً عند أول طلب من متجرك.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="border-b border-gray-100 bg-gray-50/60">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">الاسم</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">الجوال</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">الطلبات</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">إجمالي الإنفاق</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">عميل منذ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{customer.name}</p>
                          {customer.email && (
                            <p className="text-xs text-gray-400" dir="ltr">
                              {customer.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700 nums" dir="ltr">
                      {customer.phone}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900 nums">
                        {customer.ordersCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900 nums">
                        {Number(customer.totalSpent).toLocaleString("ar-SA")}
                      </span>
                      <span className="text-xs text-gray-400 mr-1">ر.س</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 nums">
                      {new Date(customer.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
