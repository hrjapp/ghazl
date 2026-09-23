"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStore } from "@/lib/auth";

const settingsSchema = z.object({
  name: z.string().min(2, "اسم المتجر حرفين على الأقل"),
  description: z.string().optional(),
  logoUrl: z.string().url("رابط الشعار غير صالح").optional().or(z.literal("")),
  bannerUrl: z.string().url("رابط البانر غير صالح").optional().or(z.literal("")),
  currency: z.string().min(3).max(3),
  phone: z.string().optional(),
  email: z.string().email("بريد غير صالح").optional().or(z.literal("")),
  city: z.string().optional(),
  address: z.string().optional(),
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
    description: String(formData.get("description") || ""),
    logoUrl: String(formData.get("logoUrl") || ""),
    bannerUrl: String(formData.get("bannerUrl") || ""),
    currency: String(formData.get("currency") || "SAR"),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    city: String(formData.get("city") || ""),
    address: String(formData.get("address") || ""),
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
  await prisma.store.update({
    where: { id: store.id },
    data: {
      name: d.name,
      description: d.description || null,
      logoUrl: d.logoUrl || null,
      bannerUrl: d.bannerUrl || null,
      currency: d.currency,
      phone: d.phone || null,
      email: d.email || null,
      city: d.city || null,
      address: d.address || null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true, message: "تم حفظ الإعدادات بنجاح" };
}
