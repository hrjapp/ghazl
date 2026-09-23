"use client";

import { useState } from "react";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/storefront/StorefrontProvider";

type ProductDetailProps = {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    comparePrice: number | null;
    stock: number;
    sku: string | null;
    images: string[];
    slug: string;
  };
  storeSlug: string;
};

export function ProductDetail({ product, storeSlug }: ProductDetailProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const outOfStock = product.stock <= 0;
  const images = product.images.length ? product.images : [];
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: images[0] || null,
        slug: product.slug,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* المعرض */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
          {images[activeImage] ? (
            <img
              src={images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-7xl">
              📦
            </div>
          )}
          {discount > 0 && (
            <span className="absolute right-4 top-4 rounded-full bg-accent-500 px-3 py-1 text-sm font-bold text-white nums">
              -{discount}%
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  activeImage === i ? "border-brand-500" : "border-gray-100"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* التفاصيل */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
          {product.name}
        </h1>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-brand-700 nums">
            {product.price.toLocaleString("ar-SA")} ر.س
          </span>
          {discount > 0 && product.comparePrice && (
            <span className="text-lg text-gray-400 line-through nums">
              {product.comparePrice.toLocaleString("ar-SA")} ر.س
            </span>
          )}
        </div>

        {/* الحالة */}
        <div className="mt-4">
          {outOfStock ? (
            <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
              نفد المخزون
            </span>
          ) : (
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700">
              متوفر — {product.stock} قطعة
            </span>
          )}
        </div>

        {product.description && (
          <div className="mt-6 prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        )}

        {product.sku && (
          <p className="mt-4 text-sm text-gray-400" dir="ltr">
            SKU: {product.sku}
          </p>
        )}

        {/* الكمية + الإضافة */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
              aria-label="إنقاص"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-extrabold nums">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
              aria-label="زيادة"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-bold transition disabled:cursor-not-allowed ${
              outOfStock
                ? "bg-gray-100 text-gray-400"
                : added
                ? "bg-brand-100 text-brand-700"
                : "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700"
            }`}
          >
            {added ? (
              <>
                <Check className="h-5 w-5" /> تمت الإضافة للسلة
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                أضف للسلة — {(product.price * quantity).toLocaleString("ar-SA")} ر.س
              </>
            )}
          </button>
        </div>

        <a
          href={`/preview/${storeSlug}/products`}
          className="mt-6 inline-block text-sm font-bold text-gray-500 hover:text-gray-900"
        >
          ← العودة للمنتجات
        </a>
      </div>
    </div>
  );
}
