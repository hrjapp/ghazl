import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true, status: true },
  });
  if (!store || store.status !== "ACTIVE") notFound();

  return <CheckoutForm storeSlug={slug} storeName={store.name} />;
}
