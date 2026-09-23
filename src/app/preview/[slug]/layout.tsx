import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StorefrontProvider } from "@/components/storefront/StorefrontProvider";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

// ═══ أرشفة محركات البحث لكل متجر ═══
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await prisma.store.findUnique({ where: { slug } });

  if (!store) return {};

  const title = store.seoTitle || store.name;
  const description = store.seoDescription || store.description || "";
  const keywords = store.seoKeywords
    ? store.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords,
    ...(store.seoNoIndex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true } }),
    openGraph: {
      title,
      description,
      images: store.logoUrl ? [{ url: store.logoUrl }] : undefined,
    },
  };
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug },
  });

  if (!store || store.status !== "ACTIVE") {
    notFound();
  }

  const currency = store.currency;

  // ═══ وضع الصيانة ═══
  if (store.maintenanceMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 shadow-lg">
            <Wrench className="h-9 w-9 text-orange-600" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-gray-900">
            {store.name} قيد الصيانة
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {store.maintenanceMsg ||
              "نطور متجرنا حالياً ونعود إليكم قريباً بإذن الله 🚀"}
          </p>
          {store.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoUrl}
              alt={store.name}
              className="mx-auto mt-6 h-12 w-auto object-contain"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <StorefrontProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <StorefrontHeader
          storeName={store.name}
          slug={store.slug}
          logoUrl={store.logoUrl}
          currency={currency}
        />
        <main className="flex-1">{children}</main>
        <StorefrontFooter
          store={{
            ...store,
            socialLinks:
              (store.socialLinks as Record<string, string | null> | null) ?? null,
          }}
        />
      </div>
    </StorefrontProvider>
  );
}
