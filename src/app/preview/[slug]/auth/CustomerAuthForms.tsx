"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  customerRegisterAction,
  customerLoginAction,
} from "@/app/actions/customer-auth";
import { UserPlus, LogIn } from "lucide-react";

export function CustomerAuthForms({ storeId }: { storeId: string }) {
  const router = useRouter();

  // ── التسجيل ──
  const [regState, regAction, regPending] = useActionState(
    customerRegisterAction,
    undefined,
  );

  // ── الدخول ──
  const [loginState, loginAction, loginPending] = useActionState(
    customerLoginAction,
    undefined,
  );

  useEffect(() => {
    if (regState?.ok) {
      toast.success(regState.message);
      router.refresh();
    } else if (regState?.message) {
      toast.error(regState.message);
    }
  }, [regState, router]);

  useEffect(() => {
    if (loginState?.ok) {
      toast.success(loginState.message);
      router.refresh();
    } else if (loginState?.message) {
      toast.error(loginState.message);
    }
  }, [loginState, router]);

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* ── التسجيل ── */}
      <form action={regAction} className="space-y-4">
        <input type="hidden" name="storeId" value={storeId} />

        <div className="flex items-center gap-2.5">
          <UserPlus className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-extrabold text-gray-900">حساب جديد</h2>
        </div>

        {regState?.message && !regState.ok && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {regState.message}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            الاسم *
          </label>
          <input name="name" required className={inputCls} placeholder="اسمك الكامل" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            الهاتف *
          </label>
          <input
            name="phone"
            required
            dir="ltr"
            className={`${inputCls} text-left`}
            placeholder="+9665XXXXXXXX"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            البريد الإلكتروني
          </label>
          <input
            name="email"
            type="email"
            dir="ltr"
            className={`${inputCls} text-left`}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            كلمة المرور *
          </label>
          <input
            name="password"
            type="password"
            required
            dir="ltr"
            className={`${inputCls} text-left`}
            placeholder="6 أحرف على الأقل"
          />
        </div>

        <button
          type="submit"
          disabled={regPending}
          className="w-full rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {regPending ? "جارٍ التسجيل..." : "تسجيل جديد"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-bold text-gray-300">أو</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* ── الدخول ── */}
      <form action={loginAction} className="space-y-4">
        <input type="hidden" name="storeId" value={storeId} />

        <div className="flex items-center gap-2.5">
          <LogIn className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-extrabold text-gray-900">تسجيل الدخول</h2>
        </div>

        {loginState?.message && !loginState.ok && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loginState.message}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            الهاتف أو البريد *
          </label>
          <input
            name="identifier"
            required
            dir="ltr"
            className={`${inputCls} text-left`}
            placeholder="+9665XXXXXXXX أو you@example.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            كلمة المرور *
          </label>
          <input
            name="password"
            type="password"
            required
            dir="ltr"
            className={`${inputCls} text-left`}
          />
        </div>

        <button
          type="submit"
          disabled={loginPending}
          className="w-full rounded-xl border-2 border-brand-600 bg-white px-6 py-3 font-bold text-brand-600 transition hover:bg-brand-50 disabled:opacity-60"
        >
          {loginPending ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
