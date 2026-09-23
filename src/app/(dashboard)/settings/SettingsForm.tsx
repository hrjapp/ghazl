"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  updateStoreSettingsAction,
  type SettingsFormState,
} from "@/app/actions/settings";

export function SettingsForm({
  store,
}: {
  store: {
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    currency: string;
    phone: string | null;
    email: string | null;
    city: string | null;
    address: string | null;
  };
}) {
  const [state, action, pending] = useActionState(
    updateStoreSettingsAction,
    undefined as SettingsFormState | undefined
  );

  useEffect(() => {
    if (state?.ok) toast.success(state.message);
    if (state?.message && !state.ok) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      {state?.message && !state.ok && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-extrabold text-gray-900">معلومات المتجر</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              اسم المتجر *
            </label>
            <input
              name="name"
              defaultValue={store.name}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
            {state?.errors?.name && (
              <p className="mt-1.5 text-sm text-red-600">{state.errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              العملة
            </label>
            <select
              name="currency"
              defaultValue={store.currency}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 bg-white"
            >
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="AED">درهم إماراتي (AED)</option>
              <option value="EGP">جنيه مصري (EGP)</option>
              <option value="KWD">دينار كويتي (KWD)</option>
              <option value="QAR">ريال قطري (QAR)</option>
              <option value="BHD">دينار بحريني (BHD)</option>
              <option value="OMR">ريال عماني (OMR)</option>
              <option value="JOD">دينار أردني (JOD)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            وصف المتجر
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={store.description || ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              رابط الشعار
            </label>
            <input
              name="logoUrl"
              dir="ltr"
              defaultValue={store.logoUrl || ""}
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-left"
            />
            {state?.errors?.logoUrl && (
              <p className="mt-1.5 text-sm text-red-600">{state.errors.logoUrl}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              رابط بانر المتجر
            </label>
            <input
              name="bannerUrl"
              dir="ltr"
              defaultValue={store.bannerUrl || ""}
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-left"
            />
            {state?.errors?.bannerUrl && (
              <p className="mt-1.5 text-sm text-red-600">{state.errors.bannerUrl}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-extrabold text-gray-900">معلومات التواصل</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              رقم الجوال
            </label>
            <input
              name="phone"
              dir="ltr"
              defaultValue={store.phone || ""}
              placeholder="05XXXXXXXX"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-left"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              البريد الإلكتروني
            </label>
            <input
              name="email"
              dir="ltr"
              defaultValue={store.email || ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-left"
            />
            {state?.errors?.email && (
              <p className="mt-1.5 text-sm text-red-600">{state.errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              المدينة
            </label>
            <input
              name="city"
              defaultValue={store.city || ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              العنوان
            </label>
            <input
              name="address"
              defaultValue={store.address || ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <span className="text-sm text-gray-400" dir="ltr">
          رابط متجرك: {store.slug}.ai-hrj.xyz
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </form>
  );
}
