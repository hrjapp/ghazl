"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * إجراءات لوحة تحكم المنصة (Super Admin)
 * كلها تتطلب صلاحية ADMIN — وإلا يُعاد توجيه المستخدم.
 */

export type ActionResult = { ok: boolean; message: string };

async function guard() {
  // requireAdmin تعيد توجيه غير المدراء تلقائياً
  await requireAdmin();
}

// ════════════════════════════════════════════════════════════
//  إدارة المتاجر
// ════════════════════════════════════════════════════════════

/** إيقاف متجر مؤقتاً — يمنع ظهوره للعملاء */
export async function suspendStoreAction(storeId: string): Promise<ActionResult> {
  await guard();
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return { ok: false, message: "المتجر غير موجود" };
    if (store.status === "CLOSED") return { ok: false, message: "لا يمكن إيقاف متجر مغلق" };

    await prisma.store.update({
      where: { id: storeId },
      data: { status: "SUSPENDED" },
    });
    revalidatePath("/admin/stores");
    revalidatePath(`/admin/stores/${storeId}`);
    revalidatePath(`/preview/${store.slug}`);
    return { ok: true, message: `تم إيقاف متجر «${store.name}» مؤقتاً` };
  } catch {
    return { ok: false, message: "حدث خطأ أثناء الإيقاف" };
  }
}

/** تنشيط متجر موقوف */
export async function activateStoreAction(storeId: string): Promise<ActionResult> {
  await guard();
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return { ok: false, message: "المتجر غير موجود" };

    await prisma.store.update({
      where: { id: storeId },
      data: { status: "ACTIVE" },
    });
    revalidatePath("/admin/stores");
    revalidatePath(`/admin/stores/${storeId}`);
    revalidatePath(`/preview/${store.slug}`);
    return { ok: true, message: `تم تنشيط متجر «${store.name}»` };
  } catch {
    return { ok: false, message: "حدث خطأ أثناء التنشيط" };
  }
}

/** حذف متجر نهائياً — يحذف كل بياناته (products, orders, customers...) */
export async function deleteStoreAction(storeId: string): Promise<ActionResult> {
  await guard();
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return { ok: false, message: "المتجر غير موجود" };

    // حذف متسلسل: العلاقات المعتمدة على storeId
    await prisma.$transaction([
      prisma.orderItem.deleteMany({
        where: { order: { storeId } },
      }),
      prisma.payment.deleteMany({ where: { storeId } }),
      prisma.order.deleteMany({ where: { storeId } }),
      prisma.address.deleteMany({ where: { storeId } }),
      prisma.customer.deleteMany({ where: { storeId } }),
      prisma.discount.deleteMany({ where: { storeId } }),
      prisma.product.deleteMany({ where: { storeId } }),
      prisma.category.deleteMany({ where: { storeId } }),
      prisma.storeSubscription.deleteMany({ where: { storeId } }),
      prisma.storeMember.deleteMany({ where: { storeId } }),
      prisma.store.delete({ where: { id: storeId } }),
    ]);

    revalidatePath("/admin/stores");
    revalidatePath("/admin");
    revalidatePath(`/preview/${store.slug}`);
    return { ok: true, message: `تم حذف متجر «${store.name}» وكل بياناته نهائياً` };
  } catch (e) {
    console.error("deleteStore error:", e);
    return { ok: false, message: "حدث خطأ أثناء الحذف" };
  }
}

/** تغيير باقة متجر (ترقية/تخفيض) */
export async function changeStorePlanAction(
  storeId: string,
  planSlug: string
): Promise<ActionResult> {
  await guard();
  try {
    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan) return { ok: false, message: "الباقة غير موجودة" };

    const current = await prisma.storeSubscription.findFirst({
      where: { storeId, status: { in: ["ACTIVE", "TRIALING"] } },
      orderBy: { startedAt: "desc" },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 يوم

    if (current) {
      await prisma.storeSubscription.update({
        where: { id: current.id },
        data: { planId: plan.id, startedAt: now, expiresAt, status: "ACTIVE" },
      });
    } else {
      await prisma.storeSubscription.create({
        data: { storeId, planId: plan.id, startedAt: now, expiresAt, status: "ACTIVE" },
      });
    }

    revalidatePath("/admin/stores");
    revalidatePath(`/admin/stores/${storeId}`);
    revalidatePath("/admin/subscriptions");
    return { ok: true, message: `تم تغيير باقة المتجر إلى «${plan.name}»` };
  } catch {
    return { ok: false, message: "حدث خطأ أثناء تغيير الباقة" };
  }
}

/** تمديد اشتراك متجر بعدد أيام */
export async function extendSubscriptionAction(
  subscriptionId: string,
  days: number
): Promise<ActionResult> {
  await guard();
  try {
    const sub = await prisma.storeSubscription.findUnique({
      where: { id: subscriptionId },
      include: { store: true },
    });
    if (!sub) return { ok: false, message: "الاشتراك غير موجود" };

    const base = sub.expiresAt && new Date(sub.expiresAt) > new Date()
      ? new Date(sub.expiresAt)
      : new Date();
    const expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    await prisma.storeSubscription.update({
      where: { id: subscriptionId },
      data: { expiresAt, status: "ACTIVE", cancelledAt: null },
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath(`/admin/stores/${sub.store.id}`);
    return {
      ok: true,
      message: `تم تمديد اشتراك «${sub.store.name}» ${days} يوم (حتى ${expiresAt.toLocaleDateString("ar-SA")})`,
    };
  } catch {
    return { ok: false, message: "حدث خطأ أثناء التمديد" };
  }
}

/** إلغاء اشتراك متجر */
export async function cancelSubscriptionAction(subscriptionId: string): Promise<ActionResult> {
  await guard();
  try {
    const sub = await prisma.storeSubscription.findUnique({
      where: { id: subscriptionId },
      include: { store: true },
    });
    if (!sub) return { ok: false, message: "الاشتراك غير موجود" };

    await prisma.storeSubscription.update({
      where: { id: subscriptionId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath(`/admin/stores/${sub.store.id}`);
    return { ok: true, message: `تم إلغاء اشتراك «${sub.store.name}»` };
  } catch {
    return { ok: false, message: "حدث خطأ أثناء الإلغاء" };
  }
}

// ════════════════════════════════════════════════════════════
//  إدارة العملاء
// ════════════════════════════════════════════════════════════

/** حذف عميل من متجر معين */
export async function deleteCustomerAction(customerId: string): Promise<ActionResult> {
  await guard();
  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return { ok: false, message: "العميل غير موجود" };

    await prisma.$transaction([
      prisma.address.deleteMany({ where: { customerId } }),
      prisma.customer.delete({ where: { id: customerId } }),
    ]);

    revalidatePath("/admin/customers");
    return { ok: true, message: `تم حذف العميل «${customer.name}»` };
  } catch {
    return { ok: false, message: "حدث خطأ أثناء حذف العميل" };
  }
}
