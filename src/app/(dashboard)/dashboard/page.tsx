import Link from "next/link";
import { requireStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, Users, TrendingUp, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const { store } = await requireStore();
  const storeId = store.id;

  // الإحصائيات (تُحسب لحظياً لكل متجر)
  const [
    ordersCount,
    productsCount,
    customersCount,
    revenueAgg,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    prisma.order.count({ where: { storeId } }),
    prisma.product.count({ where: { storeId } }),
    prisma.customer.count({ where: { storeId } }),
    prisma.order.aggregate({
      where: { storeId, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.product.findMany({
      where: { storeId, stock: { lte: 5 } },
      take: 5,
      orderBy: { stock: "asc" },
    }),
  ]);

  const revenue = Number(revenueAgg._sum.total || 0);

  const stats = [
    {
      label: "إجمالي المبيعات",
      value: `${revenue.toLocaleString("ar-SA")} ر.س`,
      icon: TrendingUp,
      color: "bg-brand-100 text-brand-700",
    },
    {
      label: "الطلبات",
      value: ordersCount.toLocaleString("ar-SA"),
      icon: ShoppingCart,
      color: "bg-accent-100 text-accent-600",
    },
    {
      label: "المنتجات",
      value: productsCount.toLocaleString("ar-SA"),
      icon: Package,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "العملاء",
      value: customersCount.toLocaleString("ar-SA"),
      icon: Users,
      color: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* بطاقات الإحصائيات */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-extrabold text-gray-900 nums">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* أحدث الطلبات */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <h2 className="font-extrabold text-gray-900">أحدث الطلبات</h2>
            <Link
              href="/orders"
              className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              عرض الكل <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState text="لا توجد طلبات بعد" />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold text-gray-900">{order.number}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 nums">
                      {Number(order.total).toLocaleString("ar-SA")} ر.س
                    </p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* مخزون منخفض */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <h2 className="font-extrabold text-gray-900">مخزون منخفض</h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              عرض الكل <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <EmptyState text="كل المنتجات بمخزون كافٍ" />
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4">
                  <p className="font-bold text-gray-900 truncate">{product.name}</p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {product.stock === 0 ? "نفد المخزون" : `باقٍ ${product.stock}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <ShoppingCart className="h-10 w-10 mb-2" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
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
