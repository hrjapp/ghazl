import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-session";
import { CustomerPanel } from "./CustomerPanel";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StoreAccountPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true, name: true, status: true },
  });

  if (!store || store.status === "CLOSED") notFound();

  const customer = await getCurrentCustomer(store.id);
  if (!customer) redirect(`/preview/${slug}/auth`);

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      total: true,
      status: true,
      createdAt: true,
    },
    take: 20,
  });

  return (
    <CustomerPanel
      store={store}
      customer={customer}
      orders={orders.map((o) => ({
        id: o.id,
        number: o.number,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt,
      }))}
    />
  );
}
