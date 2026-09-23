"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Pause,
  Play,
  Trash2,
  CreditCard,
  CalendarPlus,
  Ban,
  ChevronDown,
} from "lucide-react";

import {
  suspendStoreAction,
  activateStoreAction,
  deleteStoreAction,
  changeStorePlanAction,
  extendSubscriptionAction,
  cancelSubscriptionAction,
} from "@/app/actions/admin";

type Plan = { id: string; slug: string; name: string };

export function StoreActions({
  storeId,
  storeName,
  status,
  subscriptionId,
  currentPlanSlug,
  plans,
}: {
  storeId: string;
  storeName: string;
  status: string;
  subscriptionId: string | null;
  currentPlanSlug: string | null;
  plans: Plan[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  const run = (fn: () => Promise<{ ok: boolean; message: string }>, redirect = false) => {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(res.message);
        if (redirect) {
          router.push("/admin/stores");
          router.refresh();
        } else {
          router.refresh();
        }
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-extrabold text-gray-900">إجراءات إدارية</h2>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {/* إيقاف / تنشيط */}
        {status === "ACTIVE" || status === "PENDING" ? (
          <button
            disabled={pending}
            onClick={() => run(() => suspendStoreAction(storeId))}
            className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100 disabled:opacity-50"
          >
            <Pause className="h-4 w-4" />
            إيقاف المتجر
          </button>
        ) : (
          <button
            disabled={pending}
            onClick={() => run(() => activateStoreAction(storeId))}
            className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            تنشيط المتجر
          </button>
        )}

        {/* تغيير الباقة */}
        <div className="relative">
          <button
            disabled={pending}
            onClick={() => setPlanOpen(!planOpen)}
            className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100 disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            تغيير الباقة
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {planOpen && (
            <div className="absolute z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  disabled={pending || plan.slug === currentPlanSlug}
                  onClick={() => {
                    setPlanOpen(false);
                    run(() => changeStorePlanAction(storeId, plan.slug));
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-sm font-bold transition ${
                    plan.slug === currentPlanSlug
                      ? "bg-gray-50 text-gray-400"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.name}
                  {plan.slug === currentPlanSlug && (
                    <span className="text-[10px] font-bold text-gray-400">الحالية</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* تمديد الاشتراك */}
        {subscriptionId && (
          <>
            <button
              disabled={pending}
              onClick={() => run(() => extendSubscriptionAction(subscriptionId, 30))}
              className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-100 disabled:opacity-50"
            >
              <CalendarPlus className="h-4 w-4" />
              تمديد 30 يوم
            </button>
            <button
              disabled={pending}
              onClick={() => run(() => cancelSubscriptionAction(subscriptionId))}
              className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <Ban className="h-4 w-4" />
              إلغاء الاشتراك
            </button>
          </>
        )}

        {/* حذف نهائي */}
        {!confirmDelete ? (
          <button
            disabled={pending}
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            حذف المتجر
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2">
            <span className="text-xs font-bold text-red-700">حذف نهائي؟</span>
            <button
              disabled={pending}
              onClick={() =>
                run(() => deleteStoreAction(storeId), true)
              }
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              نعم، احذف
            </button>
            <button
              disabled={pending}
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>

      {status === "SUSPENDED" && (
        <p className="mt-3 text-xs font-bold text-amber-600">
          ⚠️ المتجر موقوف — واجهته غير ظاهرة للعملاء حتى يتم تنشيطه.
        </p>
      )}
      {status === "CLOSED" && (
        <p className="mt-3 text-xs font-bold text-gray-500">
          المتجر مغلق من قبل المالك.
        </p>
      )}
    </div>
  );
}
