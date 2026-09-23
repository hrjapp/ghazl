"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/StorefrontProvider";
import { checkoutAction, type CheckoutState } from "@/app/actions/checkout";

export function CheckoutForm({
  storeSlug,
  storeName,
}: {
  storeSlug: string;
  storeName: string;
}) {
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [state, action, pending] = useActionState(
    checkoutAction,
    undefined as CheckoutState | undefined
  );

  // عند نجاح الطلب: توجيه لصفحة النجاح
  useEffect(() => {
    if (state?.ok && state.orderNumber) {
      clearCart();
      router.push(`/preview/${storeSlug}/success?order=${state.orderNumber}`);
    }
  }, [state?.ok, state?.orderNumber, clearCart, router, storeSlug]);

  // سلة فارغة → لا يمكن الدفع
  if (items.length === 0 && !state?.ok) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900">السلة فارغة</h1>
        <p className="mt-2 text-gray-500">أضف منتجات قبل إتمام الطلب.</p>
        <Link
          href={`/preview/${storeSlug}/products`}
          className="mt-8 inline-flex rounded-xl bg-brand-600 px-8 py-3.5 font-bold text-white transition hover:bg-brand-700"
        >
          تصفّح المنتجات ←
        </Link>
      </div>
    );
  }

  const shipping = 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">إتمام الطلب</h1>

      {state?.message && !state.ok && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}

      <form action={action} className="grid gap-8 lg:grid-cols-3">
        {/* البيانات */}
        <div className="lg:col-span-2 space-y-6">
          <input type="hidden" name="storeSlug" value={storeSlug} />
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })))}
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-extrabold text-gray-900">بيانات التواصل</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  الاسم الكامل *
                </label>
                <input
                  name="customerName"
                  placeholder="الاسم"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
                {state?.errors?.customerName && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {state.errors.customerName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  رقم الجوال *
                </label>
                <input
                  name="customerPhone"
                  type="tel"
                  dir="ltr"
                  placeholder="05XXXXXXXX"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-left"
                />
                {state?.errors?.customerPhone && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {state.errors.customerPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-extrabold text-gray-900">عنوان التوصيل</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  المدينة *
                </label>
                <input
                  name="city"
                  placeholder="الرياض"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
                {state?.errors?.city && (
                  <p className="mt-1.5 text-sm text-red-600">{state.errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  الحي
                </label>
                <input
                  name="district"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  الشارع / تفاصيل العنوان
                </label>
                <input
                  name="street"
                  placeholder="الشارع، رقم المبنى"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ملاحظات على الطلب
              </label>
              <textarea
                name="notes"
                rows={2}
                placeholder="أي تفاصيل إضافية..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-gray-900">طريقة الدفع</h2>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-brand-500 bg-brand-50/50 p-4">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                defaultChecked
                className="h-5 w-5 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <p className="font-bold text-gray-900">الدفع عند الاستلام</p>
                <p className="text-sm text-gray-500">
                  ادفع نقداً عند وصول طلبك إلى بابك
                </p>
              </div>
            </label>
            <label className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 opacity-60">
              <input
                type="radio"
                name="paymentMethod"
                value="CARD"
                disabled
                className="h-5 w-5"
              />
              <div>
                <p className="font-bold text-gray-900">بطاقة (مدى/فيزا)</p>
                <p className="text-sm text-gray-500">قريباً — غير متاح حالياً</p>
              </div>
            </label>
          </div>
        </div>

        {/* ملخص */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-extrabold text-gray-900 mb-4">طلبك</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl">
                      📦
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400 nums">
                      {item.quantity} × {item.price.toLocaleString("ar-SA")}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 nums">
                    {(item.price * item.quantity).toLocaleString("ar-SA")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4 space-y-2.5">
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
              <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                <span className="font-extrabold text-gray-900">الإجمالي</span>
                <span className="text-xl font-extrabold text-brand-700 nums">
                  {(total + shipping).toLocaleString("ar-SA")} ر.س
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-6 w-full rounded-xl bg-brand-600 px-6 py-4 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "جارٍ تأكيد الطلب..." : `تأكيد الطلب`}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">
              بالضغط على تأكيد الطلب، أنت توافق على شروط {storeName}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
