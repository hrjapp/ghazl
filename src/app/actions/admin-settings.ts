"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * حفظ خطة اشتراك (للأدمن)
 */
export async function savePlanAction(prev: unknown, formData: FormData) {
  const user = await requireAdmin();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim() || null;
  const priceMonthly = Number(formData.get("priceMonthly") || 0);
  const priceYearly = Number(formData.get("priceYearly") || 0);
  const currency = String(formData.get("currency") || "SAR");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isActive = formData.get("isActive") === "on";
  const isPopular = formData.get("isPopular") === "on";

  // الحدود
  const maxProducts = Number(formData.get("maxProducts") || 0);
  const maxStaff = Number(formData.get("maxStaff") || 0);
  const maxOrders = Number(formData.get("maxOrders") || 0);
  const commissionRate = Number(formData.get("commissionRate") || 0);
  const hasCustomDomain = formData.get("hasCustomDomain") === "on";
  const hasReports = formData.get("hasReports") === "on";
  const hasDiscounts = formData.get("hasDiscounts") === "on";
  const hasAbandonedCarts = formData.get("hasAbandonedCarts") === "on";

  // المزايا (نص مفصول بأسطر جديدة)
  const featuresRaw = String(formData.get("features") || "");
  const features = featuresRaw
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  if (!name) return { ok: false, message: "اسم الخطة مطلوب" };
  if (priceMonthly < 0 || priceYearly < 0)
    return { ok: false, message: "الأسعار لا يمكن أن تكون سالبة" };
  if (commissionRate < 0 || commissionRate > 1)
    return { ok: false, message: "عمولة المنصة بين 0 و 1" };

  const limits = {
    maxProducts,
    maxStaff,
    maxOrders,
    commissionRate,
    hasCustomDomain,
    hasReports,
    hasDiscounts,
    hasAbandonedCarts,
  };

  try {
    if (id) {
      // تعديل
      await prisma.plan.update({
        where: { id },
        data: {
          name,
          tagline,
          priceMonthly,
          priceYearly,
          currency,
          sortOrder,
          isActive,
          isPopular,
          limits: limits as any,
          features,
        },
      });
    } else {
      // إضافة
      const slug = String(formData.get("slug") || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      if (!slug) return { ok: false, message: "المعرّف (slug) مطلوب" };

      const exists = await prisma.plan.findUnique({ where: { slug } });
      if (exists) return { ok: false, message: "هذا المعرّف مستخدم مسبقاً" };

      await prisma.plan.create({
        data: {
          slug,
          name,
          tagline,
          priceMonthly,
          priceYearly,
          currency,
          sortOrder,
          isActive,
          isPopular,
          limits: limits as any,
          features,
        },
      });
    }

    revalidatePath("/admin/settings");
    return { ok: true, message: "تم حفظ الخطة بنجاح" };
  } catch (e) {
    return { ok: false, message: "حدث خطأ أثناء الحفظ" };
  }
}

/**
 * حذف خطة
 */
export async function deletePlanAction(prev: unknown, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "معرّف الخطة مفقود" };

  const subs = await prisma.storeSubscription.count({
    where: { planId: id },
  });
  if (subs > 0)
    return {
      ok: false,
      message: `لا يمكن حذف الخطة — عليها ${subs} اشتراك فعال. أوقفها بدلاً من ذلك.`,
    };

  try {
    await prisma.plan.delete({ where: { id } });
    revalidatePath("/admin/settings");
    return { ok: true, message: "تم حذف الخطة" };
  } catch (e) {
    return { ok: false, message: "حدث خطأ أثناء الحذف" };
  }
}
