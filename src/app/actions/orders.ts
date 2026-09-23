"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStore } from "@/lib/auth";

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export async function updateOrderStatusAction(
  orderId: string,
  status: (typeof VALID_STATUSES)[number]
) {
  const { store } = await requireStore();

  const order = await prisma.order.findFirst({
    where: { id: orderId, storeId: store.id },
  });
  if (!order) throw new Error("الطلب غير موجود");

  await prisma.order.update({
    where: { id: order.id },
    data: { status },
    // توحيد حالة الدفع عند التوصيل أو الإلغاء
  });

  // عند التوصيل ووجود دفع "عند الاستلام" → نعتبره مكتمل
  if (status === "DELIVERED" && order.paymentStatus === "COD") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });
    if (order.customerId) {
      await prisma.customer.update({
        where: { id: order.customerId },
        data: {
          totalSpent: { increment: Number(order.total) },
          ordersCount: { increment: 1 },
        },
      });
    }
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

export type OrderStatus = (typeof VALID_STATUSES)[number];
export const ORDER_STATUSES = VALID_STATUSES;
