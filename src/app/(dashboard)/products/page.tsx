import Link from "next/link";
import { requireStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Package, Plus } from "lucide-react";
import { ProductsTable } from "./ProductsTable";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { store } = await requireStore();

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">المنتجات</h1>
          <p className="mt-1 text-sm text-gray-500">
            إدارة منتجات متجرك — {products.length} منتج
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
        >
          <Plus className="h-5 w-5" />
          إضافة منتج
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <Package className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">لا توجد منتجات بعد</h3>
          <p className="mt-1 text-sm text-gray-500">
            ابدأ بإضافة أول منتج لمتجرك.
          </p>
          <Link
            href="/products/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-5 w-5" />
            إضافة منتج
          </Link>
        </div>
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  );
}
