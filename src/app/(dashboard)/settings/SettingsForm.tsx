"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  updateStoreSettingsAction,
  type SettingsFormState,
} from "@/app/actions/settings";
import {
  Store as StoreIcon,
  Globe,
  Search,
  Wrench,
  CreditCard,
  AlertTriangle,
  Check,
} from "lucide-react";

type Plan = { id: string; slug: string; name: string };

export function SettingsForm({
  store,
  currentPlanSlug,
  currentPlanName,
  subscriptionEndsAt,
  plans,
}: {
  store: {
    id: string;
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
    socialLinks: Record<string, string | null> | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
    seoNoIndex: boolean;
    maintenanceMode: boolean;
    maintenanceMsg: string | null;
    closedMessage: string | null;
  };
  currentPlanSlug: string | null;
  currentPlanName: string | null;
  subscriptionEndsAt: Date | string | null;
  plans: Plan[];
}) {
  const [state, action, pending] = useActionState(
    updateStoreSettingsAction,
    undefined as SettingsFormState | undefined
  );

  useEffect(() => {
    if (state?.ok) toast.success(state.message);
    if (state?.message && !state.ok) toast.error(state.message);
  }, [state]);

  const social = store.socialLinks || {};

  return (
    <form action={action} className="space-y-6">
      {state?.message && !state.ok && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}

      {/* ═══════════ 1. معلومات أساسية ═══════════ */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <StoreIcon className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <h2 className="font-extrabold text-gray-900">معلومات أساسية</h2>
        </div>

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

      {/* ═══════════ 2. الرابط والنطاق ═══════════ */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
            <Globe className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <h2 className="font-extrabold text-gray-900">رابط المتجر والنطاق</h2>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            رابط متجرك (النطاق الفرعي) *
          </label>
          <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
            <input
              name="slug"
              dir="ltr"
              defaultValue={store.slug}
              className="w-full px-4 py-3 outline-none text-left"
              placeholder="my-store"
            />
            <span className="whitespace-nowrap bg-gray-50 px-4 py-3 text-sm font-bold text-gray-500 border-r border-gray-200">
              .ai-hrj.xyz
            </span>
          </div>
          {state?.errors?.slug && (
            <p className="mt-1.5 text-sm text-red-600">{state.errors.slug}</p>
          )}
          <p className="mt-1.5 text-xs text-gray-400">
            أحرف إنجليزية صغيرة أو أرقام أو شرطة (3-30). تغيير الرابط ينقل عملاءك
            للرابط الجديد تلقائياً.
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">رابط متجرك الحالي</p>
          <p dir="ltr" className="mt-1 text-left text-sm font-extrabold text-emerald-600">
            https://{store.slug}.ai-hrj.xyz
          </p>
          <Link
            href={`/preview/${store.slug}`}
            className="mt-2 inline-block text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            زيارة متجري ←
          </Link>
        </div>
      </div>

      {/* ═══════════ 3. أرشفة محركات البحث (SEO) ═══════════ */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
            <Search className="h-4.5 w-4.5 text-violet-600" />
          </div>
          <h2 className="font-extrabold text-gray-900">أرشفة محركات البحث (SEO)</h2>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            عنوان الظهور في جوجل
          </label>
          <input
            name="seoTitle"
            defaultValue={store.seoTitle || ""}
            placeholder={store.name}
            maxLength={120}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <p className="mt-1 text-xs text-gray-400">يُفضّل 50-60 حرف</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            وصف الظهور في جوجل
          </label>
          <textarea
            name="seoDescription"
            rows={2}
            defaultValue={store.seoDescription || ""}
            placeholder={store.description || "وصف موجز يعرفه العملاء في نتائج البحث"}
            maxLength={320}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none"
          />
          <p className="mt-1 text-xs text-gray-400">يُفضّل 150-160 حرف</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            الكلمات المفتاحية
          </label>
          <input
            name="seoKeywords"
            defaultValue={store.seoKeywords || ""}
            placeholder="ملابس، أزياء، تسوق"
            maxLength={255}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <p className="mt-1 text-xs text-gray-400">افصل بينها بفاصلة</p>
        </div>

        <label className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 cursor-pointer">
          <input
            type="checkbox"
            name="seoNoIndex"
            defaultChecked={store.seoNoIndex}
            className="mt-0.5 h-4.5 w-4.5 rounded border-gray-300 text-amber-600 focus:ring-amber-300"
          />
          <div>
            <span className="text-sm font-bold text-amber-900">
              منع محركات البحث من أرشفة متجري
            </span>
            <p className="mt-0.5 text-xs text-amber-700">
              عند التفعيل يُطلب من جوجل وغيره عدم ظهور متجرك في نتائج البحث.
            </p>
          </div>
        </label>
      </div>

      {/* ═══════════ 4. التحكم بالمتجر (صيانة/إغلاق) ═══════════ */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <Wrench className="h-4.5 w-4.5 text-orange-600" />
          </div>
          <h2 className="font-extrabold text-gray-900">التحكم بالمتجر</h2>
        </div>

        <label className="flex items-start gap-3 rounded-xl bg-orange-50 p-4 cursor-pointer">
          <input
            type="checkbox"
            name="maintenanceMode"
            defaultChecked={store.maintenanceMode}
            className="mt-0.5 h-4.5 w-4.5 rounded border-gray-300 text-orange-600 focus:ring-orange-300"
          />
          <div>
            <span className="text-sm font-bold text-orange-900">
              تفعيل وضع الصيانة
            </span>
            <p className="mt-0.5 text-xs text-orange-700">
              يُخفي متجر العملاء مؤقتاً ويظهر رسالة «قيد الصيانة» بينما تبقى
              لوحة تحكمك تعمل.
            </p>
          </div>
        </label>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            رسالة الصيانة
          </label>
          <textarea
            name="maintenanceMsg"
            rows={2}
            defaultValue={store.maintenanceMsg || ""}
            placeholder="نطور متجرنا حالياً ونعود قريباً 🚀"
            maxLength={300}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            رسالة إغلاق المتجر
          </label>
          <textarea
            name="closedMessage"
            rows={2}
            defaultValue={store.closedMessage || ""}
            placeholder="المتجر مغلق حالياً"
            maxLength={300}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            تظهر عند إغلاق المتجر (سواء منك أو من إدارة المنصة).
          </p>
        </div>
      </div>

      {/* ═══════════ 5. الباقة ═══════════ */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50">
            <CreditCard className="h-4.5 w-4.5 text-pink-600" />
          </div>
          <h2 className="font-extrabold text-gray-900">باقة الاشتراك</h2>
        </div>

        <div className="rounded-xl bg-gradient-to-l from-brand-50 to-white p-5 ring-1 ring-brand-100">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-gray-500">باقتك الحالية</span>
          </div>
          <p className="mt-1 text-xl font-extrabold text-gray-900">
            {currentPlanName || "—"}
          </p>
          {subscriptionEndsAt && (
            <p className="mt-1 text-xs text-gray-500 nums">
              تنتهي في:{" "}
              {new Date(subscriptionEndsAt as string).toLocaleDateString("ar-SA")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {plans.map((p) => (
            <span
              key={p.id}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                p.slug === currentPlanSlug
                  ? "bg-brand-600 text-white"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              {p.name}
            </span>
          ))}
        </div>

        <Link
          href="/subscription"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <CreditCard className="h-4 w-4" />
          ترقية / تغيير الباقة
        </Link>
      </div>

      {/* ═══════════ 6. التواصل ═══════════ */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50">
            <AlertTriangle className="h-4.5 w-4.5 text-cyan-600" />
          </div>
          <h2 className="font-extrabold text-gray-900">التواصل ووسائل التواصل</h2>
        </div>

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

        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { key: "instagram", label: "إنستغرام", ph: "username" },
            { key: "twitter", label: "تويتر / X", ph: "username" },
            { key: "whatsapp", label: "واتساب", ph: "9665XXXXXXXX" },
            { key: "tiktok", label: "تيك توك", ph: "username" },
            { key: "snapchat", label: "سناب شات", ph: "username" },
          ].map((s) => (
            <div key={s.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {s.label}
              </label>
              <input
                name={s.key}
                dir="ltr"
                defaultValue={social[s.key] || ""}
                placeholder={s.ph}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-left"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ زر الحفظ ═══════════ */}
      <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-5">
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
