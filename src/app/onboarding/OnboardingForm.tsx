"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStoreAction,
  suggestSlugAction,
  type CreateStoreState,
} from "@/app/actions/auth";

type Plan = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  priceMonthly: number;
  features: string[];
  isPopular: boolean;
};

export function OnboardingForm({
  plans,
  presetPlanSlug,
}: {
  plans: Plan[];
  presetPlanSlug?: string;
}) {
  const [selected, setSelected] = useState<string>(
    presetPlanSlug && plans.some((p) => p.slug === presetPlanSlug)
      ? presetPlanSlug
      : plans[0]?.slug || "free"
  );
  const [slug, setSlug] = useState("");
  const [storeName, setStoreName] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const router = useRouter();

  const [state, action, pending] = useActionState(
    createStoreAction,
    undefined as CreateStoreState | undefined
  );

  // اقتراح النطاق تلقائياً من اسم المتجر
  useEffect(() => {
    if (slugTouched) return;
    const t = setTimeout(async () => {
      if (storeName.trim().length >= 2) {
        setSlug(await suggestSlugAction(storeName));
      }
    }, 500);
    return () => clearTimeout(t);
  }, [storeName, slugTouched]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 mb-4">
            <span className="text-3xl">🧶</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            أنشئ متجرك الجديد
          </h1>
          <p className="mt-3 text-gray-500 text-lg">
            اختر الباقة المناسبة، ثم اضبط اسم متجرك ونطاقه.
          </p>
        </div>

        {/* اختيار الباقة */}
        <div className="grid gap-5 sm:grid-cols-3 mb-10">
          {plans.map((plan) => {
            const isSelected = selected === plan.slug;
            return (
              <button
                key={plan.slug}
                type="button"
                onClick={() => setSelected(plan.slug)}
                className={`relative text-right rounded-2xl border-2 p-6 transition-all ${
                  isSelected
                    ? "border-brand-500 bg-brand-50/60 shadow-lg shadow-brand-500/10 scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 right-5 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow">
                    الأكثر شيوعاً
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-gray-900">{plan.name}</h3>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-brand-600 bg-brand-600" : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-brand-700 nums">
                    {plan.priceMonthly}
                  </span>
                  <span className="text-sm text-gray-500">ر.س / شهرياً</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {(plan.features as string[]).slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* نموذج بيانات المتجر */}
        <form
          action={action}
          className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-lg font-extrabold text-gray-900 mb-5">بيانات المتجر</h2>

          <input type="hidden" name="planSlug" value={selected} />

          {state?.message && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
              {state.message}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="storeName"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                اسم المتجر
              </label>
              <input
                id="storeName"
                name="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="متجر الوادي"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
              {state?.errors?.storeName && (
                <p className="mt-1.5 text-sm text-red-600">{state.errors.storeName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="storeSlug"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                النطاق الفرعي
              </label>
              <div className="flex flex-row-reverse items-stretch overflow-hidden rounded-xl border border-gray-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
                <span className="flex items-center bg-gray-50 px-3 text-sm text-gray-500 border-r border-gray-300">
                  .ghazl.sa
                </span>
                <input
                  id="storeSlug"
                  name="storeSlug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase());
                    setSlugTouched(true);
                  }}
                  placeholder="wadi"
                  dir="ltr"
                  className="flex-1 px-4 py-3 outline-none text-left"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400" dir="ltr">
                رابط متجرك: {slug || "wadi"}.ghazl.sa
              </p>
              {state?.errors?.storeSlug && (
                <p className="mt-1.5 text-sm text-red-600">{state.errors.storeSlug}</p>
              )}
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              وصف المتجر <span className="font-normal text-gray-400">(اختياري)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="نبذة قصيرة عما يبيعه متجرك..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none"
            />
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              تخطّي وإنشاء متجر لاحقاً
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "جارٍ الإنشاء..." : "إنشاء المتجر ←"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
