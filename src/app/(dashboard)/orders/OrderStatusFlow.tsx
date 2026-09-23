"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction, type OrderStatus } from "@/app/actions/orders";

const STATUS_FLOW: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "بانتظار التأكيد" },
  { value: "CONFIRMED", label: "تأكيد الطلب" },
  { value: "PROCESSING", label: "قيد التجهيز" },
  { value: "SHIPPED", label: "شحن" },
  { value: "DELIVERED", label: "تم التوصيل" },
  { value: "CANCELLED", label: "إلغاء" },
];

export function OrderStatusFlow({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="font-extrabold text-gray-900 mb-4">تحديث حالة الطلب</h2>
      <div className="flex flex-wrap gap-2">
        {STATUS_FLOW.map((s) => {
          const isCurrent = current === s.value;
          const isCancel = s.value === "CANCELLED";
          return (
            <button
              key={s.value}
              disabled={isPending || isCurrent}
              onClick={() =>
                startTransition(async () => {
                  await updateOrderStatusAction(orderId, s.value);
                  router.refresh();
                })
              }
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed ${
                isCurrent
                  ? isCancel
                    ? "bg-red-600 text-white"
                    : "bg-brand-600 text-white"
                  : isCancel
                  ? "border border-red-200 text-red-600 hover:bg-red-50"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
              } ${isPending ? "opacity-50" : ""}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {isPending && (
        <p className="mt-3 text-sm text-gray-500">جارٍ التحديث...</p>
      )}
    </div>
  );
}
