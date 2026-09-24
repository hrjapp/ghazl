import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlatformSetting } from "@/lib/platform-settings";
import { AdminSettingsClient } from "./AdminSettingsClient";
import { PlatformSettingsClient } from "./PlatformSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const [plans, siteDomain, siteName] = await Promise.all([
    prisma.plan.findMany({ orderBy: { sortOrder: "asc" } }),
    getPlatformSetting("siteDomain", "ai-hrj.xyz"),
    getPlatformSetting("siteName", "غَزْل"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">الإعدادات</h1>
        <p className="mt-1 text-sm text-gray-500">
          إعدادات المنصة — الدومين الرئيسي والخطط.
        </p>
      </div>

      {/* قسم إعدادات المنصة: الدومين الرئيسي */}
      <PlatformSettingsClient siteDomain={siteDomain} siteName={siteName} />

      {/* قسم الخطط */}
      <div className="border-t border-gray-200 pt-8">
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
    </div>
  );
}
