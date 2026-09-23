"use client";

import { useActionState } from "react";
import { adminLoginAction, type AdminLoginState } from "@/app/actions/admin-auth";
import { ShieldCheck, Loader2 } from "lucide-react";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<
    AdminLoginState | undefined,
    FormData
  >(adminLoginAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {state?.message && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-red-200">
          {state.message}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-bold text-gray-700">
          البريد أو اسم المستخدم
        </label>
        <input
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="admin"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
        {state?.errors?.identifier && (
          <p className="mt-1 text-xs font-bold text-red-600">{state.errors.identifier}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-gray-700">
          كلمة المرور
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
        {state?.errors?.password && (
          <p className="mt-1 text-xs font-bold text-red-600">{state.errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        دخول لوحة المنصة
      </button>

      <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
        🔑 الدخول الافتراضي: <span className="nums" dir="ltr">admin</span> /{" "}
        <span className="nums" dir="ltr">admin</span>
        <p className="mt-1 font-medium text-amber-600">
          مخصص لمدير المنصة فقط. التجار يستخدمون بوابة الدخول العادية.
        </p>
      </div>
    </form>
  );
}
