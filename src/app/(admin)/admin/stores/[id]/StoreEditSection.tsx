"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateStoreByAdminAction } from "@/app/actions/admin-store";
import { Store as StoreIcon, Globe, Wrench, ExternalLink } from "lucide-react";

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

export function StoreEditSection({
  store,
  siteDomain,
}: {
  store: StoreData;
  siteDomain: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <StoreIcon className="h-5 w-5 text-brand-600" />
        <h2 className="text-xl font-extrabold text-gray-900">تعديل بيانات المتجر</h2>
      </div>

      <StoreEditForm key={store.id} store={store} siteDomain={siteDomain} />
    </div>
  );
}

function StoreEditForm({
  store,
  siteDomain,
}: {
  store: StoreData;
  siteDomain: string;
}) {
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
              رابط المتجر (المسار الفرعي) *
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
              <span className="border-l border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-400 whitespace-nowrap" dir="ltr">
                https://{siteDomain}/
              </span>
              <input
                name="slug"
                defaultValue={store.slug}
                required
                dir="ltr"
                className="w-full bg-transparent px-4 py-2.5 text-left text-sm outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400" dir="ltr">
              رابط المتجر الكامل: https://{siteDomain}/{store.slug}
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
          href={`https://${siteDomain}/${store.slug}`}
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
