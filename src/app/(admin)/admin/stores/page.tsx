import { getStores } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { StoresTable } from "./StoresTable";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; plan?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const search = sp.search ?? "";
  const status = sp.status ?? "all";
  const plan = sp.plan ?? "all";

  const [{ items, total, totalPages }, plans] = await Promise.all([
    getStores({ page, search, status, plan }),
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">المتاجر</h1>
        <p className="mt-1 text-sm text-gray-500">
          {total.toLocaleString("ar-SA")} متجر على المنصة
        </p>
      </div>

      <StoresTable
        items={items}
        totalPages={totalPages}
        page={page}
        search={search}
        status={status}
        plans={plans.map((p) => ({ slug: p.slug, name: p.name }))}
      />
    </div>
  );
}
