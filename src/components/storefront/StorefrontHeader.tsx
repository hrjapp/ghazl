"use client";

import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "./StorefrontProvider";
import { usePathname } from "next/navigation";

export function StorefrontHeader({
  storeName,
  slug,
  logoUrl,
  customerName,
}: {
  storeName: string;
  slug: string;
  logoUrl: string | null;
  currency: string;
  customerName?: string | null;
}) {
  const { itemCount } = useCart();
  const pathname = usePathname();

  const nav = [
    { href: `/preview/${slug}`, label: "الرئيسية" },
    { href: `/preview/${slug}/products`, label: "المنتجات" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={`/preview/${slug}`} className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={storeName}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <span className="text-lg">🧶</span>
            </div>
          )}
          <span className="text-lg font-extrabold text-gray-900 sm:text-xl">
            {storeName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => {
            const isActive =
              item.href === pathname ||
              (item.href !== `/preview/${slug}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={`/preview/${slug}/auth`}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              pathname.includes("/auth") || pathname.includes("/account")
                ? "bg-brand-50 text-brand-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            title={customerName ? `حسابي — ${customerName}` : "حسابي"}
          >
            <User className="h-5 w-5" />
            <span className="hidden max-w-[80px] truncate sm:inline">
              {customerName || "حسابي"}
            </span>
          </Link>

          <Link
            href={`/preview/${slug}/cart`}
            className="relative flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden sm:inline">السلة</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white nums">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
