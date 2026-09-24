"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * حفظ إعدادات المنصة (الدومين الرئيسي، الاسم، ...)
 */
export async function savePlatformSettingsAction(
  prev: unknown,
  formData: FormData,
) {
  await requireAdmin();

  const siteDomain = String(formData.get("siteDomain") || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const siteName = String(formData.get("siteName") || "").trim();

  if (!siteDomain) return { ok: false, message: "الدومين مطلوب" };
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(siteDomain))
    return { ok: false, message: "صيغة الدومين غير صحيحة (مثل: example.com)" };

  try {
    await prisma.platformSetting.upsert({
      where: { key: "siteDomain" },
      update: { value: siteDomain },
      create: { key: "siteDomain", value: siteDomain },
    });

    if (siteName) {
      await prisma.platformSetting.upsert({
        where: { key: "siteName" },
        update: { value: siteName },
        create: { key: "siteName", value: siteName },
      });
    }

    revalidatePath("/admin/settings");
    return { ok: true, message: `تم حفظ الدومين: ${siteDomain}` };
  } catch (e) {
    return { ok: false, message: "حدث خطأ أثناء الحفظ" };
  }
}
