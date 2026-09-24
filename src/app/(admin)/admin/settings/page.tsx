import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSettingsClient } from "./AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await requireAdmin();

  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">الإعدادات</h1>
        <p className="mt-1 text-sm text-gray-500">
          تحكم المنصة — الخطط، العملة، والمزايا.
        </p>
      </div>

      <AdminSettingsClient
        plans={plans.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          priceMonthly: Number(p.priceMonthly),
          priceYearly: Number(p.priceYearly),
          currency: p.currency,
          sortOrder: p.sortOrder,
          isActive: p.isActive,
          isPopular: p.isPopular,
          limits: (p.limits as Record<string, number | boolean>) || {},
          features: (p.features as string[]) || [],
        }))}
      />
    </div>
  );
}
