import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber, toStringArray } from "@/lib/convert";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  // متطلب: مستخدم مسجّل دخوله
  await requireUser();

  const { plan: preset } = await searchParams;

  // جلب الباقات النشطة من قاعدة البيانات
  const dbPlans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      priceMonthly: true,
      features: true,
      isPopular: true,
    },
  });

  // تحويل أنواع Prisma (Decimal/Json) لأنواع عادية للواجهة
  const plans = dbPlans.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    priceMonthly: toNumber(p.priceMonthly),
    features: toStringArray(p.features),
    isPopular: p.isPopular,
  }));

  return <OnboardingForm plans={plans} presetPlanSlug={preset} />;
}
