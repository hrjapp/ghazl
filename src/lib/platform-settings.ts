import { prisma } from "@/lib/prisma";

/**
 * قراءة إعداد من إعدادات المنصة (مع قيمة افتراضية)
 */
export async function getPlatformSetting(key: string, fallback = ""): Promise<string> {
  const row = await prisma.platformSetting.findUnique({ where: { key } });
  return row?.value || fallback;
}

/**
 * الدومين الرئيسي للمنصة (الذي تحمله لوحة الأدمن)
 */
export async function getSiteDomain(): Promise<string> {
  return getPlatformSetting("siteDomain", "ai-hrj.xyz");
}

/**
 * بناء رابط متجر بالمسار الفرعي: https://domain.com/store-slug
 */
export function buildStoreUrl(domain: string, slug: string): string {
  const clean = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `https://${clean}/${slug}`;
}
