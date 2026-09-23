import { notFound } from "next/navigation";
import { requireStore } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toImages } from "@/lib/convert";
import { ProductForm } from "@/components/dashboard/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { store } = await requireStore();
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, storeId: store.id },
  });
  if (!product) notFound();

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">تعديل المنتج</h1>
        <p className="mt-1 text-sm text-gray-500">{product.name}</p>
      </div>
      <ProductForm
        product={{
          ...product,
          price: Number(product.price),
          comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
          images: toImages(product.images),
        }}
        categories={categories}
      />
    </div>
  );
}
