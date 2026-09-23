import type { Prisma } from "@prisma/client";

/**
 * يحول حقل الصور (Json في Prisma) إلى مصفوفة روابط نصية بأمان.
 */
export function toImages(images: Prisma.JsonValue | null | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.filter((x): x is string => typeof x === "string");
  }
  return [];
}

/** أول صورة فقط (للبطاقات) */
export function firstImage(
  images: Prisma.JsonValue | null | undefined
): string | null {
  return toImages(images)[0] ?? null;
}

/** يحول ميزات الباقة (Json) إلى مصفوفة نصوص */
export function toStringArray(
  value: Prisma.JsonValue | null | undefined
): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === "string");
  }
  return [];
}

/** يحول قيمة Decimal من Prisma إلى رقم */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber(): number }).toNumber();
  }
  return Number(value);
}
