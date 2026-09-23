"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStore } from "@/lib/auth";

const slugRegex = /^[a-z0-9-]{3,30}$/;

const settingsSchema = z.object({
  name: z.string().min(2, "اسم المتجر حرفين على الأقل"),
  slug: z
    .string()
    .min(3, "الرابط 3 أحرف على الأقل")
    .max(30, "الرابط 30 حرف كحد أقصى")
    .regex(slugRegex, "الرابط: أحرف إنجليزية صغيرة أو أرقام أو شرطة فقط")
    .optional(),
  description: z.string().optional(),
  logoUrl: z.string().url("رابط الشعار غير صالح").optional().or(z.literal("")),
  bannerUrl: z.string().url("رابط البانر غير صالح").optional().or(z.literal("")),
  currency: z.string().min(3).max(3),
  phone: z.string().optional(),
  email: z.string().email("بريد غير صالح").optional().or(z.literal("")),
  city: z.string().optional(),
  address: z.string().optional(),
  // SEO
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),
  seoKeywords: z.string().max(255).optional().or(z.literal("")),
  seoNoIndex: z.string().optional(),
  // التواصل الاجتماعي
  instagram: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  tiktok: z.string().optional().or(z.literal("")),
  snapchat: z.string().optional().or(z.literal("")),
  // التحكم بالمتجر
  maintenanceMode: z.string().optional(),
  maintenanceMsg: z.string().max(300).optional().or(z.literal("")),
  closedMessage: z.string().max(300).optional().or(z.literal("")),
});

export type SettingsFormState = {
  errors?: Record<string, string>;
  message?: string;
  ok?: boolean;
};

export async function updateStoreSettingsAction(
  _prev: SettingsFormState | undefined,
  formData: FormData
): Promise<SettingsFormState> {
  const { store } = await requireStore();

  const raw = {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || ""),
    logoUrl: String(formData.get("logoUrl") || ""),
    bannerUrl: String(formData.get("bannerUrl") || ""),
    currency: String(formData.get("currency") || "SAR"),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    city: String(formData.get("city") || ""),
    address: String(formData.get("address") || ""),
    seoTitle: String(formData.get("seoTitle") || ""),
    seoDescription: String(formData.get("seoDescription") || ""),
    seoKeywords: String(formData.get("seoKeywords") || ""),
    seoNoIndex: String(formData.get("seoNoIndex") || ""),
    instagram: String(formData.get("instagram") || ""),
    twitter: String(formData.get("twitter") || ""),
    whatsapp: String(formData.get("whatsapp") || ""),
    tiktok: String(formData.get("tiktok") || ""),
    snapchat: String(formData.get("snapchat") || ""),
    maintenanceMode: String(formData.get("maintenanceMode") || ""),
    maintenanceMsg: String(formData.get("maintenanceMsg") || ""),
    closedMessage: String(formData.get("closedMessage") || ""),
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { errors };
  }

  const d = parsed.data;

  // التحقق من تفرد الرابط عند تغييره
  const newSlug = d.slug?.trim().toLowerCase() || undefined;
  if (newSlug && newSlug !== store.slug) {
    const exists = await prisma.store.findUnique({ where: { slug: newSlug } });
    if (exists) {
      return { message: "هذا الرابط مستخدم من قبل متجر آخر — اختر رابطاً مختلفاً" };
    }
  }

  // فحص حدود الباقة قبل تغيير الرابط (النطاق المخصص)
  const socialLinks = {
    instagram: d.instagram || null,
    twitter: d.twitter || null,
    whatsapp: d.whatsapp || null,
    tiktok: d.tiktok || null,
    snapchat: d.snapchat || null,
  };

  await prisma.store.update({
    where: { id: store.id },
    data: {
      name: d.name,
      slug: newSlug ?? store.slug,
      description: d.description || null,
      logoUrl: d.logoUrl || null,
      bannerUrl: d.bannerUrl || null,
      currency: d.currency,
      phone: d.phone || null,
      email: d.email || null,
      city: d.city || null,
      address: d.address || null,
      socialLinks,
      seoTitle: d.seoTitle || null,
      seoDescription: d.seoDescription || null,
      seoKeywords: d.seoKeywords || null,
      seoNoIndex: d.seoNoIndex === "on",
      maintenanceMode: d.maintenanceMode === "on",
      maintenanceMsg: d.maintenanceMsg || null,
      closedMessage: d.closedMessage || null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  // إعادة تحميل صفحة المتجر العام (قد يتغير الرابط)
  if (newSlug && newSlug !== store.slug) {
    revalidatePath(`/preview/${store.slug}`);
    revalidatePath(`/preview/${newSlug}`);
  }
  return { ok: true, message: "تم حفظ الإعدادات بنجاح" };
}
