import { requireStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/dashboard/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { store } = await requireStore();

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">إضافة منتج جديد</h1>
        <p className="mt-1 text-sm text-gray-500">
          املأ بيانات المنتج ثم انشره في متجرك.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
