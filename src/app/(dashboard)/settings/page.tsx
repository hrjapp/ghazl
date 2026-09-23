import { requireStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { store } = await requireStore();

  // الباقة الحالية + كل الباقات لعرضها في النموذج
  const currentSub = await prisma.storeSubscription.findFirst({
    where: { storeId: store.id, status: { in: ["ACTIVE", "TRIALING"] } },
    include: { plan: true },
    orderBy: { startedAt: "desc" },
  });
  const currentPlan = currentSub?.plan;
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">الإعدادات</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة معلومات متجرك، رابطه، أرشفته، وتحكمك الكامل فيه.
        </p>
      </div>
      <SettingsForm
        store={{
          ...store,
          socialLinks:
            (store.socialLinks as Record<string, string | null> | null) ?? null,
        }}
        currentPlanSlug={currentPlan?.slug ?? null}
        currentPlanName={currentPlan?.name ?? null}
        subscriptionEndsAt={currentSub?.expiresAt ?? null}
        plans={plans}
      />
    </div>
  );
}
