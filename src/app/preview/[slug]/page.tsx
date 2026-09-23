import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { firstImage } from "@/lib/convert";
import { ProductCard } from "@/components/storefront/ProductCard";

export const dynamic = "force-dynamic";

export default async function StorefrontHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store || store.status !== "ACTIVE") notFound();

  const [featured, products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id, status: "ACTIVE", isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { storeId: store.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.category.findMany({
      where: { storeId: store.id },
      orderBy: { name: "asc" },
    }),
  ]);

  const banner = store.bannerUrl;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* بانر البطل */}
      {banner ? (
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={banner}
            alt={store.name}
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/50 to-transparent" />
          <div className="absolute inset-y-0 right-0 flex flex-col justify-center p-8 sm:p-12 text-white">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{store.name}</h1>
            {store.description && (
              <p className="mt-3 max-w-md text-white/90">{store.description}</p>
            )}
            <Link
              href={`/preview/${slug}/products`}
              className="mt-6 w-fit rounded-xl bg-white px-6 py-3 font-bold text-gray-900 shadow-lg transition hover:bg-gray-100"
            >
              تسوّق الآن ←
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-gradient-to-br from-brand-100 via-accent-100 to-brand-200 p-10 sm:p-16">
          <h1 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
            أهلاً بك في {store.name}
          </h1>
          {store.description && (
            <p className="mt-3 max-w-lg text-brand-700/90">{store.description}</p>
          )}
          <Link
            href={`/preview/${slug}/products`}
            className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-bold text-brand-700 shadow-lg transition hover:bg-gray-50"
          >
            تسوّق الآن ←
          </Link>
        </div>
      )}

      {/* التصنيفات */}
      {categories.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-extrabold text-gray-900">التصنيفات</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/preview/${slug}/products?cat=${cat.slug}`}
                className="rounded-full border border-gray-200 bg-white px-5 py-2.5 font-semibold text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* منتجات مميزة */}
      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-extrabold text-gray-900">
            منتجات مميزة ✨
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {featured.map((p) => (
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
        </section>
      )}

      {/* أحدث المنتجات */}
      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900">أحدث المنتجات</h2>
          <Link
            href={`/preview/${slug}/products`}
            className="text-sm font-bold text-brand-700 hover:text-brand-800"
          >
            عرض الكل ←
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
            لا توجد منتجات في هذا المتجر بعد.
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
      </section>
    </div>
  );
}
