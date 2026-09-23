import { headers } from "next/headers";
import { prisma } from "./prisma";

/**
 * يحل المتجر الحالي للواجهة (Storefront) من النطاق الفرعي.
 * proxy.ts يقرأ النطاق الفرعي ويضعه في ترويسة x-store-slug.
 * في التطوير أو النطاق الرئيسي يُستخدم مسار /preview/[slug].
 */
export async function getCurrentStore() {
  const h = await headers();
  const headerSlug = h.get("x-store-slug");

  if (headerSlug) {
    return prisma.store.findUnique({
      where: { slug: headerSlug },
    });
  }

  // fallback: لا يوجد نطاق فرعي → null (الصفحة تستخدم params.slug)
  return null;
}

/** بناء رابط واجهة متجر حسب البيئة */
export function storeUrl(slug: string) {
  const storeDomain = process.env.STORE_DOMAIN || "ai-hrj.xyz";
  // في الإنتاج: نطاق فرعي مخصص
  if (process.env.NODE_ENV === "production") {
    return `https://${slug}.${storeDomain}`;
  }
  // في التطوير: مسار مع basePath
  return `/preview/${slug}`;
}

/**
 * يولّد slug فريداً للمتجر/المنتج (عربي/إنجليزي) ويتفادى التكرار
 */
export async function generateUniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (await exists(slug)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

/** تحويل نص عربي/إنجليزي إلى slug آمن للرابط */
export function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    // أحرف عربية شائعة → أرقام أو تُبقى كما هي
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
