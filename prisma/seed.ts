import { PrismaClient } from "@prisma/client";
import { PLAN_DEFS } from "../src/lib/plans";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 زرع الباقات الأساسية...");

  for (const def of PLAN_DEFS) {
    await prisma.plan.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        tagline: def.tagline,
        description: def.description,
        priceMonthly: def.priceMonthly,
        priceYearly: def.priceYearly,
        limits: def.limits as object,
        features: [...def.features],
        isPopular: def.isPopular,
        sortOrder: def.sortOrder,
        isActive: true,
      },
      create: {
        slug: def.slug,
        name: def.name,
        tagline: def.tagline,
        description: def.description,
        priceMonthly: def.priceMonthly,
        priceYearly: def.priceYearly,
        limits: def.limits as object,
        features: [...def.features],
        isPopular: def.isPopular,
        sortOrder: def.sortOrder,
      },
    });
    console.log(`  ✓ باقة: ${def.name} (${def.slug})`);
  }

  // حساب مدير المنصة الافتراضي
  const bcrypt = await import("bcryptjs");
  const existing = await prisma.user.findUnique({ where: { email: "admin@ghazl.sa" } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "مدير المنصة",
        email: "admin@ghazl.sa",
        passwordHash: await bcrypt.hash("admin123456", 10),
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log("  ✓ مدير المنصة: admin@ghazl.sa / admin123456");
  }

  console.log("✅ اكتملت الزراعة");
}

main()
  .catch((e) => {
    console.error("❌ خطأ:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
