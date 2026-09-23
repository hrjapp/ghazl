import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StorefrontProvider } from "@/components/storefront/StorefrontProvider";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";

export const dynamic = "force-dynamic";

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
        <StorefrontFooter store={store} />
      </div>
    </StorefrontProvider>
  );
}
