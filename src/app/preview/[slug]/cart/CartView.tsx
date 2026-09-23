"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/storefront/StorefrontProvider";

export function CartView({ storeSlug }: { storeSlug: string }) {
  const { items, total, updateQuantity, removeItem, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
          <ShoppingBag className="h-9 w-9 text-gray-400" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-gray-900">سلتك فارغة</h1>
        <p className="mt-2 text-gray-500">
          لم تُضف أي منتجات بعد. ابدأ التسوق واكتشف منتجاتنا.
        </p>
        <Link
          href={`/preview/${storeSlug}/products`}
          className="mt-8 inline-flex rounded-xl bg-brand-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
        >
          تصفّح المنتجات ←
        </Link>
      </div>
    );
  }

  const shipping = 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">
        سلة التسوق ({itemCount})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* العناصر */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover border border-gray-100"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-3xl">
                    📦
                  </div>
                )}

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/preview/${storeSlug}/product/${item.slug}`}
                    className="font-bold text-gray-900 hover:text-brand-700 line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm font-bold text-brand-700 nums">
                    {item.price.toLocaleString("ar-SA")} ر.س
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
                        aria-label="إنقاص"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
                        aria-label="زيادة"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-gray-900 nums">
                        {(item.price * item.quantity).toLocaleString("ar-SA")} ر.س
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ملخص الطلب */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-extrabold text-gray-900">ملخص الطلب</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">المجموع الفرعي</span>
                <span className="font-bold nums">
                  {total.toLocaleString("ar-SA")} ر.س
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الشحن</span>
                <span className="font-bold text-brand-700">
                  {shipping === 0 ? "مجاني" : `${shipping} ر.س`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-extrabold text-gray-900">الإجمالي</span>
                <span className="text-xl font-extrabold text-brand-700 nums">
                  {(total + shipping).toLocaleString("ar-SA")} ر.س
                </span>
              </div>
            </div>

            <Link
              href={`/preview/${storeSlug}/checkout`}
              className="mt-6 block w-full rounded-xl bg-brand-600 px-6 py-3.5 text-center font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
            >
              متابعة الدفع ←
            </Link>

            <Link
              href={`/preview/${storeSlug}/products`}
              className="mt-3 block w-full rounded-xl border border-gray-200 px-6 py-3 text-center font-bold text-gray-700 transition hover:bg-gray-50"
            >
              مواصلة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
