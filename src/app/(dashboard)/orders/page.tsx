import Link from "next/link";
import { requireStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { store } = await requireStore();

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">الطلبات</h1>
        <p className="mt-1 text-sm text-gray-500">
          كل طلبات متجرك — {orders.length} طلب
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <ShoppingCart className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">لا توجد طلبات بعد</h3>
          <p className="mt-1 text-sm text-gray-500">
            ستظهر هنا طلبات عملاء متجرك تلقائياً.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="border-b border-gray-100 bg-gray-50/60">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">رقم الطلب</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">العميل</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">المنتجات</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">الإجمالي</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">الدفع</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">الحالة</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-bold text-gray-900 hover:text-brand-700"
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-400 nums" dir="ltr">
                        {order.customerPhone}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 nums">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} قطعة
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900 nums">
                        {Number(order.total).toLocaleString("ar-SA")}
                      </span>
                      <span className="text-xs text-gray-400 mr-1">ر.س</span>
                    </td>
                    <td className="px-5 py-4">
                      <PaymentBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 nums">
                      {new Date(order.createdAt).toLocaleDateString("ar-SA")}
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "بانتظار التأكيد", cls: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: "مؤكد", cls: "bg-blue-100 text-blue-700" },
    PROCESSING: { label: "قيد التجهيز", cls: "bg-purple-100 text-purple-700" },
    SHIPPED: { label: "مشحون", cls: "bg-indigo-100 text-indigo-700" },
    DELIVERED: { label: "تم التوصيل", cls: "bg-brand-100 text-brand-700" },
    CANCELLED: { label: "ملغي", cls: "bg-red-100 text-red-700" },
    REFUNDED: { label: "مسترجع", cls: "bg-gray-100 text-gray-700" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    UNPAID: { label: "غير مدفوع", cls: "bg-red-100 text-red-700" },
    PAID: { label: "مدفوع", cls: "bg-brand-100 text-brand-700" },
    COD: { label: "عند الاستلام", cls: "bg-amber-100 text-amber-700" },
    REFUNDED: { label: "مسترجع", cls: "bg-gray-100 text-gray-700" },
    FAILED: { label: "فشل", cls: "bg-red-100 text-red-700" },
  };
  const s = map[status] || map.UNPAID;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}
