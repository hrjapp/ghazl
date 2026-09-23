"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "./StorefrontProvider";

type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  image: string | null;
  stock: number;
  storeSlug: string;
};

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  stock,
  storeSlug,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem({ productId: id, name, price, image, slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return (
    <Link
      href={`/preview/${storeSlug}/product/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            📦
          </div>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-white nums">
            -{discount}%
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-bold text-white">
              نفد المخزون
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-brand-700 nums">
            {price.toLocaleString("ar-SA")} ر.س
          </span>
          {discount > 0 && comparePrice && (
            <span className="text-sm text-gray-400 line-through nums">
              {comparePrice.toLocaleString("ar-SA")}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed ${
            outOfStock
              ? "bg-gray-100 text-gray-400"
              : added
              ? "bg-brand-100 text-brand-700"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {outOfStock ? (
            "غير متوفر"
          ) : added ? (
            <>
              <Check className="h-4 w-4" /> أُضيف للسلة
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> أضف للسلة
            </>
          )}
        </button>
      </div>
    </Link>
  );
}
