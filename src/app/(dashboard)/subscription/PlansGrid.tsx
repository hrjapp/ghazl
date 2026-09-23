"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changePlanAction } from "@/app/actions/subscription";

type Plan = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isPopular: boolean;
};

export function PlansGrid({
  plans,
  currentPlanSlug,
}: {
  plans: Plan[];
  currentPlanSlug: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (slug: string) => {
    if (slug === currentPlanSlug) return;
    startTransition(async () => {
      try {
        await changePlanAction(slug);
        toast.success("تم تغيير باقتك بنجاح");
        router.refresh();
      } catch (e) {
        toast.error("تعذّر تغيير الباقة");
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = plan.slug === currentPlanSlug;
        return (
          <div
            key={plan.slug}
            className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all ${
              isCurrent
                ? "border-brand-500 bg-brand-50/60 shadow-lg shadow-brand-500/10"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 right-6 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow">
                الأكثر شيوعاً
              </span>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-gray-900">{plan.name}</h3>
              {isCurrent && (
                <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                  باقتك الحالية
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-brand-700 nums">
                {plan.priceMonthly}
              </span>
              <span className="text-sm text-gray-500">ر.س / شهرياً</span>
            </div>
            <p className="text-xs text-gray-400 nums">
              أو {plan.priceYearly} ر.س سنوياً (وفّر شهرين)
            </p>

            {plan.description && (
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                {plan.description}
              </p>
            )}

            <ul className="mt-5 space-y-2.5 flex-1">
              {(plan.features as string[]).map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={isCurrent || isPending}
              onClick={() => handleChange(plan.slug)}
              className={`mt-6 w-full rounded-xl px-4 py-3 font-bold transition disabled:cursor-not-allowed ${
                isCurrent
                  ? "bg-gray-100 text-gray-500"
                  : plan.priceMonthly === 0
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700"
              } ${isPending ? "opacity-60" : ""}`}
            >
              {isCurrent
                ? "الباقة الحالية"
                : isPending
                ? "جارٍ التغيير..."
                : plan.priceMonthly === 0
                ? "التبديل للمجاني"
                : `الترقية إلى ${plan.name}`}
            </button>
          </div>
        );
      })}
    </div>
  );
}
