import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toImages, firstImage } from "@/lib/convert";
import { ProductDetail } from "./ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;

  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store || store.status !== "ACTIVE") notFound();

  const product = await prisma.product.findFirst({
    where: { storeId: store.id, slug: productSlug, status: "ACTIVE" },
    include: { category: true },
  });
  if (!product) notFound();

  // منتجات مشابهة
  const related = await prisma.product.findMany({
    where: {
      storeId: store.id,
      status: "ACTIVE",
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* مسار التنقل */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href={`/preview/${slug}`} className="hover:text-gray-900">
          الرئيسية
        </Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <Link href={`/preview/${slug}/products`} className="hover:text-gray-900">
          المنتجات
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span>{product.category.name}</span>
          </>
        )}
      </nav>

      <ProductDetail
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
          stock: product.stock,
          sku: product.sku,
          images: toImages(product.images),
          slug: product.slug,
        }}
        storeSlug={slug}
      />

      {/* منتجات مشابهة */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-extrabold text-gray-900">
            قد يعجبك أيضاً
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/preview/${slug}/product/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  {firstImage(p.images) ? (
                    <img
                      src={firstImage(p.images)!}
                      alt={p.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      📦
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-gray-900">
                    {p.name}
                  </h3>
                  <p className="mt-1 font-extrabold text-brand-700 nums">
                    {Number(p.price).toLocaleString("ar-SA")} ر.س
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
