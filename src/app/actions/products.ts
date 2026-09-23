"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStore } from "@/lib/auth";
import { getStoreLimits } from "@/lib/plans";

const productSchema = z.object({
  name: z.string().min(2, "اسم المنتج حرفين على الأقل"),
  description: z.string().optional(),
  price: z.coerce.number().positive("السعر يجب أن يكون أكبر من صفر"),
  comparePrice: z.coerce.number().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0, "المخزون لا يمكن أن يكون سالباً").default(0),
  categoryId: z.string().optional(),
  images: z.string().optional(), // URLs مفصولة بأسطر جديدة
  status: z.enum(["DRAFT", "ACTIVE"]).default("DRAFT"),
  isFeatured: z.coerce.boolean().optional(),
});

export type ProductFormState = {
  errors?: Record<string, string>;
  message?: string;
  ok?: boolean;
};

function slugifyAr(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || `p-${Date.now()}`
  );
}

async function uniqueProductSlug(storeId: string, name: string, excludeId?: string) {
  const base = slugifyAr(name);
  let slug = base;
  let counter = 1;
  while (
    await prisma.product.findFirst({
      where: { storeId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export async function createProductAction(
  _prev: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  const { store } = await requireStore();
  const limits = await getStoreLimits(store.id);

  // التحقق من حد الباقة
  if (limits.maxProducts !== -1) {
    const count = await prisma.product.count({ where: { storeId: store.id } });
    if (count >= limits.maxProducts) {
      return {
        message: `وصلت إلى الحد الأقصى للمنتجات في باقتك (${limits.maxProducts}). قم بالترقية لإضافة المزيد.`,
      };
    }
  }

  const raw = {
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    price: String(formData.get("price") || ""),
    comparePrice: String(formData.get("comparePrice") || ""),
    sku: String(formData.get("sku") || ""),
    stock: String(formData.get("stock") || "0"),
    categoryId: String(formData.get("categoryId") || "") || undefined,
    images: String(formData.get("images") || ""),
    status: String(formData.get("status") || "DRAFT"),
    isFeatured: String(formData.get("isFeatured") || ""),
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { errors };
  }

  const data = parsed.data;
  const images = data.images
    ? data.images
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean)
    : [];

  const slug = await uniqueProductSlug(store.id, data.name);

  await prisma.product.create({
    data: {
      storeId: store.id,
      categoryId: data.categoryId || null,
      name: data.name,
      slug,
      description: data.description || null,
      price: data.price,
      comparePrice: data.comparePrice || null,
      sku: data.sku || null,
      stock: data.stock,
      images: images.length ? images : Prisma.JsonNull,
      status: data.status,
      isFeatured: !!data.isFeatured,
    },
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { ok: true, message: "تم إنشاء المنتج بنجاح" };
}

export async function updateProductAction(
  _prev: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  const { store } = await requireStore();
  const productId = String(formData.get("productId") || "");
  if (!productId) return { message: "المنتج غير محدد" };

  // التأكد من أن المنتج يتبع لهذا المتجر
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId: store.id },
  });
  if (!product) return { message: "المنتج غير موجود" };

  const raw = {
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    price: String(formData.get("price") || ""),
    comparePrice: String(formData.get("comparePrice") || ""),
    sku: String(formData.get("sku") || ""),
    stock: String(formData.get("stock") || "0"),
    categoryId: String(formData.get("categoryId") || "") || undefined,
    images: String(formData.get("images") || ""),
    status: String(formData.get("status") || "DRAFT"),
    isFeatured: String(formData.get("isFeatured") || ""),
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { errors };
  }

  const data = parsed.data;
  const images = data.images
    ? data.images
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean)
    : [];

  const slug =
    data.name !== product.name
      ? await uniqueProductSlug(store.id, data.name, product.id)
      : product.slug;

  await prisma.product.update({
    where: { id: product.id },
    data: {
      categoryId: data.categoryId || null,
      name: data.name,
      slug,
      description: data.description || null,
      price: data.price,
      comparePrice: data.comparePrice || null,
      sku: data.sku || null,
      stock: data.stock,
      images: images.length ? images : Prisma.JsonNull,
      status: data.status,
      isFeatured: !!data.isFeatured,
    },
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { ok: true, message: "تم تحديث المنتج بنجاح" };
}

export async function deleteProductAction(productId: string) {
  const { store } = await requireStore();
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId: store.id },
  });
  if (!product) throw new Error("المنتج غير موجود");

  await prisma.product.delete({ where: { id: product.id } });
  revalidatePath("/products");
  revalidatePath("/dashboard");
}

export async function toggleProductStatusAction(productId: string) {
  const { store } = await requireStore();
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId: store.id },
  });
  if (!product) throw new Error("المنتج غير موجود");

  await prisma.product.update({
    where: { id: product.id },
    data: { status: product.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE" },
  });
  revalidatePath("/products");
}
