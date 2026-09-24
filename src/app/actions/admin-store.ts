"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * تحديث إعدادات متجر معين (من لوحة الأدمن)
 */
export async function updateStoreByAdminAction(
  prev: unknown,
  formData: FormData,
) {
  await requireAdmin();

  const storeId = String(formData.get("storeId") || "");
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const currency = String(formData.get("currency") || "SAR");
  const status = String(formData.get("status") || "ACTIVE");

  // الأرشفة
  const seoTitle = String(formData.get("seoTitle") || "").trim() || null;
  const seoDescription = String(formData.get("seoDescription") || "").trim() || null;
  const seoKeywords = String(formData.get("seoKeywords") || "").trim() || null;
  const seoNoIndex = formData.get("seoNoIndex") === "on";

  // الصيانة
  const maintenanceMode = formData.get("maintenanceMode") === "on";
  const maintenanceMsg = String(formData.get("maintenanceMsg") || "").trim() || null;

  if (!storeId) return { ok: false, message: "معرّف المتجر مفقود" };
  if (!name) return { ok: false, message: "اسم المتجر مطلوب" };
  if (slug.length < 3) return { ok: false, message: "الرابط 3 أحرف على الأقل" };
  if (!/^[a-z0-9-]+$/.test(slug))
    return { ok: false, message: "الرابط: أحرف إنجليزية وأرقام وشرطة فقط" };

  try {
    // فحص التكرار في الرابط
    const existing = await prisma.store.findUnique({ where: { slug } });
    if (existing && existing.id !== storeId)
      return { ok: false, message: "هذا الرابط مستخدم من متجر آخر" };

    await prisma.store.update({
      where: { id: storeId },
      data: {
        name,
        slug,
        currency,
        status: status as any,
        seoTitle,
        seoDescription,
        seoKeywords,
        seoNoIndex,
        maintenanceMode,
        maintenanceMsg,
      },
    });

    revalidatePath("/admin/settings");
    return { ok: true, message: `تم تحديث «${name}» بنجاح` };
  } catch (e) {
    return { ok: false, message: "حدث خطأ أثناء الحفظ" };
  }
}
