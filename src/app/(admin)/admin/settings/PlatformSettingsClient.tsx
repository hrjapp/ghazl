"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { savePlatformSettingsAction } from "@/app/actions/platform-settings";
import { Globe, Server } from "lucide-react";

export function PlatformSettingsClient({
  siteDomain,
  siteName,
}: {
  siteDomain: string;
  siteName: string;
}) {
  const [state, action, pending] = useActionState(
    savePlatformSettingsAction,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <div className="flex items-center gap-2.5">
        <Server className="h-5 w-5 text-brand-600" />
        <h2 className="text-xl font-extrabold text-gray-900">إعدادات المنصة</h2>
      </div>

      {state?.message && !state.ok && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2">
          <Globe className="h-4.5 w-4.5 text-brand-600" />
          <h3 className="font-bold text-gray-900">الدومين الرئيسي</h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              دومين المنصة *
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
              <span className="border-l border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-400 whitespace-nowrap">
                https://
              </span>
              <input
                name="siteDomain"
                defaultValue={siteDomain}
                required
                dir="ltr"
                placeholder="example.com"
                className="w-full bg-transparent px-4 py-2.5 text-left text-sm outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              الدومين الذي تعمل عليه لوحة الإدارة والمنصة.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              اسم المنصة
            </label>
            <input
              name="siteName"
              defaultValue={siteName}
              className={inputCls}
            />
            <p className="mt-1.5 text-xs text-gray-400">
              الاسم الذي يظهر في الواجهات والتقارير.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3.5" dir="ltr">
          <p className="text-xs font-bold text-gray-500">معاينة الروابط:</p>
          <p className="mt-1.5 text-xs text-gray-400">
            لوحة الإدارة: https://{siteDomain}/admin
          </p>
          <p className="mt-1 text-xs text-gray-400">
            متجر «sss»: https://{siteDomain}/sss
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-brand-600 px-8 py-3 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "جارٍ الحفظ..." : "حفظ إعدادات المنصة"}
          </button>
        </div>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
