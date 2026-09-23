"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Prisma } from "@prisma/client";
import { firstImage } from "@/lib/convert";
import {
  deleteProductAction,
  toggleProductStatusAction,
} from "@/app/actions/products";

type Product = Prisma.ProductGetPayload<{ include: { category: true } }>;

export function ProductsTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="border-b border-gray-100 bg-gray-50/60">
            <tr>
              <th className="px-5 py-3 text-xs font-bold text-gray-500">المنتج</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500">التصنيف</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500">السعر</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500">المخزون</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500">الحالة</th>
              <th className="px-5 py-3 text-xs font-bold text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const image = firstImage(product.images);

  return (
    <tr className="hover:bg-gray-50/60">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl object-cover border border-gray-100"
              unoptimized
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <span className="text-lg">📦</span>
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/products/${product.id}`}
              className="font-bold text-gray-900 hover:text-brand-700 truncate block"
            >
              {product.name}
            </Link>
            <p className="text-xs text-gray-400" dir="ltr">
              /{product.slug}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {product.category?.name || "—"}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-gray-900 nums">
            {Number(product.price).toLocaleString("ar-SA")}
          </span>
          <span className="text-xs text-gray-400">ر.س</span>
        </div>
        {product.comparePrice && (
          <span className="text-xs text-gray-400 line-through nums">
            {Number(product.comparePrice).toLocaleString("ar-SA")}
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold nums ${
            product.stock === 0
              ? "bg-red-100 text-red-700"
              : product.stock <= 5
              ? "bg-amber-100 text-amber-700"
              : "bg-brand-100 text-brand-700"
          }`}
        >
          {product.stock}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
            product.status === "ACTIVE"
              ? "bg-brand-100 text-brand-700"
              : product.status === "ARCHIVED"
              ? "bg-gray-100 text-gray-600"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {product.status === "ACTIVE"
            ? "نشط"
            : product.status === "ARCHIVED"
            ? "مؤرشف"
            : "مسودة"}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() => toggleProductStatusAction(product.id))
            }
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {product.status === "ACTIVE" ? "إخفاء" : "تفعيل"}
          </button>
          <Link
            href={`/products/${product.id}`}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            تعديل
          </Link>
          <button
            disabled={isPending}
            onClick={() => {
              if (confirm(`حذف المنتج "${product.name}"؟ لا يمكن التراجع.`)) {
                startTransition(() => deleteProductAction(product.id));
              }
            }}
            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            حذف
          </button>
        </div>
      </td>
    </tr>
  );
}
