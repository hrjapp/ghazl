import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { firstImage } from "@/lib/convert";
import { ProductCard } from "@/components/storefront/ProductCard";

export const dynamic = "force-dynamic";

export default async function StorefrontProducts({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { slug } = await params;
  const { cat } = await searchParams;

  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store || store.status !== "ACTIVE") notFound();

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    orderBy: { name: "asc" },
  });

  const activeCat = cat
    ? await prisma.category.findFirst({
        where: { storeId: store.id, slug: cat },
      })
    : null;

  const products = await prisma.product.findMany({
    where: {
      storeId: store.id,
      status: "ACTIVE",
      ...(activeCat ? { categoryId: activeCat.id } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          {activeCat ? activeCat.name : "كل المنتجات"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {products.length} منتج في {store.name}
        </p>
      </div>

      {/* فلترة التصنيفات */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <a
            href={`/preview/${slug}/products`}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              !activeCat
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            الكل
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/preview/${slug}/products?cat=${c.slug}`}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeCat?.id === c.id
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {c.name}
            </a>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
          لا توجد منتجات في هذا القسم.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={Number(p.price)}
              comparePrice={p.comparePrice ? Number(p.comparePrice) : null}
              image={firstImage(p.images)}
              stock={p.stock}
              storeSlug={slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
