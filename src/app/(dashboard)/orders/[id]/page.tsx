import { notFound } from "next/navigation";
import { requireStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatusFlow } from "../OrderStatusFlow";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { store } = await requireStore();
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, storeId: store.id },
    include: { items: true, payment: true, customer: true },
  });
  if (!order) notFound();

  const subtotal = Number(order.subtotal);
  const shipping = Number(order.shipping);
  const discount = Number(order.discount);
  const total = Number(order.total);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          الطلب {order.number}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleString("ar-SA")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* العناصر */}
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-extrabold text-gray-900">عناصر الطلب</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-xl object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                        <span>📦</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500 nums">
                        {item.quantity} × {Number(item.price).toLocaleString("ar-SA")} ر.س
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 nums">
                    {(Number(item.price) * item.quantity).toLocaleString("ar-SA")} ر.س
                  </p>
                </div>
              ))}
            </div>
            {/* ملخص المبالغ */}
            <div className="border-t border-gray-100 p-5 space-y-2.5 bg-gray-50/40">
              <Row label="المجموع الفرعي" value={`${subtotal.toLocaleString("ar-SA")} ر.س`} />
              {discount > 0 && (
                <Row
                  label="الخصم"
                  value={`- ${discount.toLocaleString("ar-SA")} ر.س`}
                  negative
                />
              )}
              <Row label="الشحن" value={`${shipping.toLocaleString("ar-SA")} ر.س`} />
              <div className="border-t border-gray-200 pt-2.5 flex items-center justify-between">
                <span className="font-extrabold text-gray-900">الإجمالي</span>
                <span className="text-lg font-extrabold text-brand-700 nums">
                  {total.toLocaleString("ar-SA")} ر.س
                </span>
              </div>
            </div>
          </div>

          <OrderStatusFlow orderId={order.id} current={order.status} />
        </div>

        {/* بيانات العميل */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-extrabold text-gray-900 mb-4">بيانات العميل</h2>
            <dl className="space-y-3">
              <Field label="الاسم" value={order.customerName} />
              <Field label="الجوال" value={order.customerPhone} ltr />
              {order.customer?.email && (
                <Field label="البريد" value={order.customer.email} ltr />
              )}
              {order.notes && <Field label="ملاحظات" value={order.notes} />}
            </dl>
          </div>

          {order.shippingAddress && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-extrabold text-gray-900 mb-4">عنوان التوصيل</h2>
              <address className="not-italic text-sm text-gray-600 leading-relaxed">
                {(order.shippingAddress as Record<string, string>).fullName}
                <br />
                {(order.shippingAddress as Record<string, string>).city}
                <br />
                {(order.shippingAddress as Record<string, string>).street ||
                  (order.shippingAddress as Record<string, string>).details}
              </address>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-extrabold text-gray-900 mb-4">الدفع</h2>
            <dl className="space-y-3">
              <Field
                label="الطريقة"
                value={
                  order.paymentMethod === "COD"
                    ? "الدفع عند الاستلام"
                    : order.paymentMethod === "CARD"
                    ? "بطاقة"
                    : order.payment?.gateway || "—"
                }
              />
              <Field
                label="الحالة"
                value={
                  order.paymentStatus === "PAID"
                    ? "مدفوع"
                    : order.paymentStatus === "COD"
                    ? "عند الاستلام"
                    : "غير مدفوع"
                }
              />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-bold nums ${negative ? "text-red-600" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-400">{label}</dt>
      <dd
        className="mt-0.5 font-bold text-gray-900 nums"
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
