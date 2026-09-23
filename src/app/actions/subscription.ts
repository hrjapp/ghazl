"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStore } from "@/lib/auth";

export async function changePlanAction(planSlug: string) {
  const { store } = await requireStore();

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) throw new Error("الباقة غير موجودة");

  const current = await prisma.storeSubscription.findFirst({
    where: { storeId: store.id },
    orderBy: { startedAt: "desc" },
  });

  // تسجيل التغيير كاشتراك جديد (الإصدار التجريبي يدعم الترقية الفورية)
  await prisma.storeSubscription.create({
    data: {
      storeId: store.id,
      planId: plan.id,
      status: plan.slug === "free" ? "ACTIVE" : "ACTIVE",
      startedAt: new Date(),
      // الباقات المدفوعة: نطلب الدفع لاحقاً (تُربط بوابة الدفع لاحقاً)
      expiresAt:
        plan.slug === "free"
          ? null
          : new Date(Date.now() + 30 * 86400 * 1000),
    },
  });

  // إنهاء الاشتراك السابق
  if (current) {
    await prisma.storeSubscription.update({
      where: { id: current.id },
      data: { status: "EXPIRED" },
    });
  }

  revalidatePath("/subscription");
  revalidatePath("/dashboard");
  revalidatePath("/products");
}
