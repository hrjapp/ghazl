import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-session";
import { CustomerAuthForms } from "./CustomerAuthForms";
import { CustomerPanel } from "../account/CustomerPanel";

export const dynamic = "force-dynamic";

export default async function StoreAuthPage({
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

  // لو العميل مسجل دخوله بالفعل → وجهّه للوحته
  const customer = await getCurrentCustomer(store.id);
  if (customer) {
    return <CustomerPanel store={store} customer={customer} />;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900">
          حساب عميل {store.name}
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          سجّل أو سجّل الدخول لمتابعة طلباتك في هذا المتجر.
        </p>
      </div>

      <CustomerAuthForms storeId={store.id} />
    </div>
  );
}
