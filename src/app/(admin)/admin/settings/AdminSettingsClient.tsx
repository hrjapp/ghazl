"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { savePlanAction, deletePlanAction } from "@/app/actions/admin-settings";
import { Pencil, Save, Trash2, X, Plus } from "lucide-react";

type PlanData = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  sortOrder: number;
  isActive: boolean;
  isPopular: boolean;
  limits: Record<string, number | boolean>;
  features: string[];
};

const EMPTY: Record<string, string> = {
  id: "",
  slug: "",
  name: "",
  tagline: "",
  priceMonthly: "0",
  priceYearly: "0",
  currency: "SAR",
  sortOrder: "0",
  isActive: "on",
  isPopular: "",
  maxProducts: "0",
  maxStaff: "0",
  maxOrders: "0",
  commissionRate: "0.02",
  hasCustomDomain: "",
  hasReports: "",
  hasDiscounts: "",
  hasAbandonedCarts: "",
  features: "",
};

export function AdminSettingsClient({ plans }: { plans: PlanData[] }) {
  const [editing, setEditing] = useState<Record<string, string> | null>(null);

  function startEdit(p: PlanData) {
    const l = p.limits || {};
    setEditing({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline || "",
      priceMonthly: String(p.priceMonthly),
      priceYearly: String(p.priceYearly),
      currency: p.currency,
      sortOrder: String(p.sortOrder),
      isActive: p.isActive ? "on" : "",
      isPopular: p.isPopular ? "on" : "",
      maxProducts: String(l.maxProducts ?? 0),
      maxStaff: String(l.maxStaff ?? 0),
      maxOrders: String(l.maxOrders ?? 0),
      commissionRate: String(l.commissionRate ?? 0.02),
      hasCustomDomain: l.hasCustomDomain ? "on" : "",
      hasReports: l.hasReports ? "on" : "",
      hasDiscounts: l.hasDiscounts ? "on" : "",
      hasAbandonedCarts: l.hasAbandonedCarts ? "on" : "",
      features: (p.features || []).join("\n"),
    });
  }

  function startNew() {
    setEditing({ ...EMPTY, isActive: "on" });
  }

  if (editing) {
    return <PlanForm initial={editing} onCancel={() => setEditing(null)} isNew={!editing.id} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">خطط الاشتراك</h2>
          <p className="mt-1 text-sm text-gray-500">
            عدّل أسعار الخطط وحدودها ومزاياها — تنطبق فوراً على اشتراكات جديدة.
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          خطة جديدة
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => {
          const l = p.limits || {};
          return (
            <div
              key={p.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                p.isPopular ? "border-brand-300 ring-1 ring-brand-200" : "border-gray-200"
              } ${!p.isActive ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">{p.name}</h3>
                  {p.tagline && (
                    <p className="mt-0.5 text-xs text-gray-400">{p.tagline}</p>
                  )}
                </div>
                {p.isPopular && (
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
                    الأكثر طلباً
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-gray-900 nums">
                  {p.priceMonthly}
                </span>
                <span className="text-sm font-semibold text-gray-400">
                  {p.currency} / شهرياً
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400 nums">
                سنوياً: {p.priceYearly} {p.currency}
              </p>

              <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4">
                <Limit label="المنتجات" value={l.maxProducts} />
                <Limit label="المستخدمون" value={l.maxStaff} />
                <Limit label="الطلبات الشهرية" value={l.maxOrders} />
                <Limit
                  label="عمولة المنصة"
                  value={l.commissionRate}
                  isPercent
                />
                <Toggle label="نطاق مخصص" on={!!l.hasCustomDomain} />
                <Toggle label="التقارير" on={!!l.hasReports} />
                <Toggle label="أكواد الخصم" on={!!l.hasDiscounts} />
                <Toggle label="السلات المتروكة" on={!!l.hasAbandonedCarts} />
              </div>

              {!p.isActive && (
                <div className="mt-3 rounded-lg bg-red-50 px-3 py-1.5 text-center text-xs font-bold text-red-600">
                  هذه الخطة موقوفة
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => startEdit(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
                >
                  <Pencil className="h-4 w-4" />
                  تعديل
                </button>
                <DeletePlanButton planId={p.id} planName={p.name} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Limit({
  label,
  value,
  isPercent,
}: {
  label: string;
  value: number | boolean | undefined;
  isPercent?: boolean;
}) {
  const v = typeof value === "number" ? value : 0;
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold text-gray-900 nums">
        {v === -1 ? "غير محدود" : isPercent ? `${(v * 100).toFixed(1)}%` : v}
      </span>
    </div>
  );
}

function Toggle({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-bold ${on ? "text-emerald-600" : "text-gray-300"}`}
      >
        {on ? "✓ متوفر" : "غير متوفر"}
      </span>
    </div>
  );
}

function DeletePlanButton({ planId, planName }: { planId: string; planName: string }) {
  const [, action, pending] = useActionState(deletePlanAction, undefined);
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form action={action} className="inline-flex items-center gap-1.5">
      <input type="hidden" name="id" value={planId} />
      <span className="text-xs font-bold text-red-600">تأكد؟</span>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
      >
        نعم
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="rounded-lg bg-gray-100 px-2 py-2 text-xs font-bold text-gray-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

function PlanForm({
  initial,
  onCancel,
  isNew,
}: {
  initial: Record<string, string>;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [state, action, pending] = useActionState(savePlanAction, undefined);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message);
      onCancel();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, onCancel]);

  return (
    <form action={action} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-900">
          {isNew ? "إضافة خطة جديدة" : "تعديل الخطة"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {state?.message && !state.ok && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}

      <input type="hidden" name="id" value={initial.id} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="font-bold text-gray-900">المعلومات الأساسية</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="اسم الخطة *">
            <input
              name="name"
              defaultValue={initial.name}
              required
              className={inputCls}
            />
          </Field>
          {isNew && (
            <Field label="المعرّف (إنجليزي) *">
              <input
                name="slug"
                dir="ltr"
                defaultValue={initial.slug}
                placeholder="free / silver / gold"
                required
                className={`${inputCls} text-left`}
              />
            </Field>
          )}
          <Field label="الجملة التسويقية">
            <input
              name="tagline"
              defaultValue={initial.tagline}
              className={inputCls}
            />
          </Field>
          <Field label="ترتيب العرض">
            <input
              name="sortOrder"
              type="number"
              defaultValue={initial.sortOrder}
              className={`${inputCls} text-left`}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="السعر شهرياً *">
            <input
              name="priceMonthly"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initial.priceMonthly}
              required
              className={`${inputCls} text-left`}
            />
          </Field>
          <Field label="السعر سنوياً">
            <input
              name="priceYearly"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initial.priceYearly}
              className={`${inputCls} text-left`}
            />
          </Field>
          <Field label="العملة">
            <select name="currency" defaultValue={initial.currency} className={inputCls}>
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
          </Field>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial.isActive === "on"}
              className="h-4.5 w-4.5 rounded border-gray-300 text-brand-600"
            />
            <span className="text-sm font-semibold text-gray-700">الخطة مفعّلة</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isPopular"
              defaultChecked={initial.isPopular === "on"}
              className="h-4.5 w-4.5 rounded border-gray-300 text-brand-600"
            />
            <span className="text-sm font-semibold text-gray-700">الأكثر طلباً</span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="font-bold text-gray-900">حدود الاستخدام</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="حد المنتجات (-1 غير محدود)">
            <input
              name="maxProducts"
              type="number"
              defaultValue={initial.maxProducts}
              className={`${inputCls} text-left`}
            />
          </Field>
          <Field label="حد المستخدمين (-1 غير محدود)">
            <input
              name="maxStaff"
              type="number"
              defaultValue={initial.maxStaff}
              className={`${inputCls} text-left`}
            />
          </Field>
          <Field label="حد الطلبات الشهرية">
            <input
              name="maxOrders"
              type="number"
              defaultValue={initial.maxOrders}
              className={`${inputCls} text-left`}
            />
          </Field>
          <Field label="عمولة المنصة (0 - 1)">
            <input
              name="commissionRate"
              type="number"
              step="0.001"
              min="0"
              max="1"
              defaultValue={initial.commissionRate}
              className={`${inputCls} text-left`}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          <ToggleCheckbox name="hasCustomDomain" label="نطاق مخصص" defaultOn={initial.hasCustomDomain === "on"} />
          <ToggleCheckbox name="hasReports" label="التقارير المتقدمة" defaultOn={initial.hasReports === "on"} />
          <ToggleCheckbox name="hasDiscounts" label="أكواد الخصم" defaultOn={initial.hasDiscounts === "on"} />
          <ToggleCheckbox name="hasAbandonedCarts" label="السلات المتروكة" defaultOn={initial.hasAbandonedCarts === "on"} />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="font-bold text-gray-900">المزايا (كل سطر ميزة)</h3>
        <textarea
          name="features"
          rows={6}
          defaultValue={initial.features}
          placeholder={"حتى 500 منتج\nدعم ذو أولوية\n..."}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none text-sm"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {pending ? "جارٍ الحفظ..." : "حفظ الخطة"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ToggleCheckbox({
  name,
  label,
  defaultOn,
}: {
  name: string;
  label: string;
  defaultOn: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer rounded-xl bg-gray-50 px-3.5 py-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultOn}
        className="h-4.5 w-4.5 rounded border-gray-300 text-brand-600"
      />
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </label>
  );
}
