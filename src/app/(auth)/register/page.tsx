"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type RegisterState } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(
    registerAction,
    undefined as RegisterState | undefined
  );

  return (
    <div>
      <div className="mb-8">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100">
            <span className="text-2xl">🧶</span>
          </div>
          <span className="text-xl font-extrabold text-brand-800">غَزْل</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">أنشئ حسابك</h2>
        <p className="mt-2 text-gray-500">
          سجّل مجاناً وابدأ متجرك خلال دقائق — بدون أي رسوم.
        </p>
      </div>

      <form action={action} className="space-y-5">
        {state?.message && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
            {state.message}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            الاسم الكامل
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="محمد العتيبي"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          {state?.errors?.name && (
            <p className="mt-1.5 text-sm text-red-600">{state.errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          {state?.errors?.email && (
            <p className="mt-1.5 text-sm text-red-600">{state.errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
            رقم الجوال
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="05XXXXXXXX"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          {state?.errors?.phone && (
            <p className="mt-1.5 text-sm text-red-600">{state.errors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="6 أحرف على الأقل"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          {state?.errors?.password && (
            <p className="mt-1.5 text-sm text-red-600">{state.errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-bold text-brand-700 hover:text-brand-800">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}
