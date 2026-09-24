"use client";

import { useState } from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateStoreByAdminAction } from "@/app/actions/admin-store";
import { Store as StoreIcon, Globe, Wrench, ChevronDown, ExternalLink } from "lucide-react";

type StoreData = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoNoIndex: boolean;
  maintenanceMode: boolean;
  maintenanceMsg: string;
};

export function StoreSettingsClient({ stores }: { stores: StoreData[] }) {
  const [selectedId, setSelectedId] = useState(stores[0]?.id ?? "");
  const selected = stores.find((s) => s.id === selectedId) ?? stores[0];

  if (!selected) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
        لا توجد متاجر بعد.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <StoreIcon className="h-5 w-5 text-brand-600" />
        <h2 className="text-xl font-extrabold text-gray-900">إدارة المتاجر</h2>
      </div>

      {/* اختيار المتجر */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          اختر المتجر
        </label>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.slug}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <StoreEditForm key={selected.id} store={selected} />
    </div>
  );
}

function StoreEditForm({ store }: { store: StoreData }) {
  const [state, action, pending] = useActionState(
    updateStoreByAdminAction,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="storeId" value={store.id} />

      {state?.message && !state.ok && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}

      {/* المعلومات الأساسية */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="mb-5 font-bold text-gray-900">المعلومات الأساسية</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              اسم المتجر *
            </label>
            <input
              name="name"
              defaultValue={store.name}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              رابط المتجر (النطاق الفرعي) *
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
              <input
                name="slug"
                defaultValue={store.slug}
                required
                dir="ltr"
                className="w-full bg-transparent px-4 py-2.5 text-left text-sm outline-none"
              />
              <span className="border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap">
                .ai-hrj.xyz
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-400" dir="ltr">
              {store.slug}.ai-hrj.xyz/ghazl/preview/{store.slug}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              العملة
            </label>
            <select name="currency" defaultValue={store.currency} className={inputCls}>
              <option value="SAR">ريال سعودي</option>
              <option value="AED">درهم إماراتي</option>
              <option value="EGP">جنيه مصري</option>
              <option value="KWD">دينار كويتي</option>
              <option value="QAR">ريال قطري</option>
              <option value="BHD">دينار بحريني</option>
              <option value="OMR">ريال عماني</option>
              <option value="JOD">دينار أردني</option>
              <option value="USD">دولار أمريكي</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              الحالة
            </label>
            <select
              name="status"
              defaultValue={store.status}
              className={inputCls}
            >
              <option value="ACTIVE">نشط</option>
              <option value="SUSPENDED">موقوف</option>
              <option value="CLOSED">مغلق</option>
            </select>
          </div>
        </div>
      </div>

      {/* الأرشفة */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2">
          <Globe className="h-4.5 w-4.5 text-brand-600" />
          <h3 className="font-bold text-gray-900">أرشفة محركات البحث (SEO)</h3>
        </div>
        <div className="grid gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              عنوان Google
            </label>
            <input
              name="seoTitle"
              defaultValue={store.seoTitle}
              placeholder={`${store.name} | تسوق أونلاين`}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              الوصف
            </label>
            <textarea
              name="seoDescription"
              rows={2}
              defaultValue={store.seoDescription}
              placeholder="وصف مختصر يظهر في نتائج البحث"
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              الكلمات المفتاحية
            </label>
            <input
              name="seoKeywords"
              defaultValue={store.seoKeywords}
              placeholder="ملابس، أزياء، تسوق"
              className={inputCls}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-amber-50 px-4 py-3">
            <input
              type="checkbox"
              name="seoNoIndex"
              defaultChecked={store.seoNoIndex}
              className="h-4.5 w-4.5 rounded border-gray-300 text-amber-600"
            />
            <span className="text-sm font-semibold text-gray-700">
              منع أرشفة هذا المتجر (noindex)
            </span>
          </label>
        </div>
      </div>

      {/* وضع الصيانة */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2">
          <Wrench className="h-4.5 w-4.5 text-orange-600" />
          <h3 className="font-bold text-gray-900">وضع الصيانة</h3>
        </div>
        <label className="mb-4 flex cursor-pointer items-center gap-2.5 rounded-xl bg-orange-50 px-4 py-3">
          <input
            type="checkbox"
            name="maintenanceMode"
            defaultChecked={store.maintenanceMode}
            className="h-4.5 w-4.5 rounded border-gray-300 text-orange-600"
          />
          <span className="text-sm font-semibold text-gray-700">
            تفعيل وضع الصيانة — يخفي المتجر عن العملاء
          </span>
        </label>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            رسالة الصيانة
          </label>
          <textarea
            name="maintenanceMsg"
            rows={2}
            defaultValue={store.maintenanceMsg}
            placeholder="نطور متجرنا حالياً ونعود قريباً 🚀"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
        <a
          href={`/preview/${store.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
        >
          <ExternalLink className="h-4 w-4" />
          فتح المتجر
        </a>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-600 px-8 py-3 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ..." : "حفظ تغييرات المتجر"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
