"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/app/actions/products";

type Category = { id: string; name: string };

type ProductFormProps = {
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    comparePrice: number | null;
    sku: string | null;
    stock: number;
    categoryId: string | null;
    images: string[] | null;
    status: string;
    isFeatured: boolean;
  };
  categories: Category[];
};

export function ProductForm({ product, categories }: ProductFormProps) {
  const isEditing = !!product;
  const action = isEditing ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState(
    action,
    undefined as ProductFormState | undefined
  );
  const router = useRouter();

  // نجاح → العودة لقائمة المنتجات
  useEffect(() => {
    if (state?.ok) router.push("/products");
  }, [state?.ok, router]);

  const imagesText = product?.images?.join("\n") || "";

  return (
    <form action={formAction} className="space-y-6">
      {isEditing && (
        <input type="hidden" name="productId" value={product!.id} />
      )}
      <input
        type="hidden"
        name="status"
        value={product?.status || "DRAFT"}
      />

      {state?.message && !state.ok && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}
      {state?.ok && state.message && (
        <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 text-sm font-medium text-brand-700">
          {state.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* القسم الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-extrabold text-gray-900">المعلومات الأساسية</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                اسم المنتج *
              </label>
              <input
                name="name"
                defaultValue={product?.name || ""}
                placeholder="اسم المنتج"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
              {state?.errors?.name && (
                <p className="mt-1.5 text-sm text-red-600">{state.errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                الوصف
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={product?.description || ""}
                placeholder="وصف المنتج، المواصفات، المميزات..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                روابط الصور
                <span className="font-normal text-gray-400 mr-1">
                  (رابط واحد في كل سطر)
                </span>
              </label>
              <textarea
                name="images"
                rows={3}
                defaultValue={imagesText}
                dir="ltr"
                placeholder="https://example.com/image1.jpg"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none text-left"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-extrabold text-gray-900">التسعير والمخزون</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  السعر (ر.س) *
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.price ?? ""}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
                {state?.errors?.price && (
                  <p className="mt-1.5 text-sm text-red-600">{state.errors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  السعر قبل الخصم
                </label>
                <input
                  name="comparePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.comparePrice ?? ""}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  المخزون
                </label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product?.stock ?? 0}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
                {state?.errors?.stock && (
                  <p className="mt-1.5 text-sm text-red-600">{state.errors.stock}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  رمز المنتج (SKU)
                </label>
                <input
                  name="sku"
                  dir="ltr"
                  defaultValue={product?.sku || ""}
                  placeholder="SKU-001"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* القسم الجانبي */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-extrabold text-gray-900">التنظيم</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                التصنيف
              </label>
              <select
                name="categoryId"
                defaultValue={product?.categoryId || ""}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 bg-white"
              >
                <option value="">بدون تصنيف</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product?.isFeatured}
                className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                منتج مميز
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-gray-900">الحالة</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  const hidden = e.currentTarget.form?.querySelector(
                    'input[name="status"]'
                  ) as HTMLInputElement;
                  if (hidden) hidden.value = "ACTIVE";
                  e.currentTarget.form?.requestSubmit();
                }}
                disabled={pending}
                className="flex-1 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {pending ? "جارٍ الحفظ..." : "حفظ ونشر"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const hidden = e.currentTarget.form?.querySelector(
                    'input[name="status"]'
                  ) as HTMLInputElement;
                  if (hidden) hidden.value = "DRAFT";
                  e.currentTarget.form?.requestSubmit();
                }}
                disabled={pending}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                حفظ كمسودة
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
