"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Users,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
  ExternalLink,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "النظرة العامة", icon: LayoutDashboard },
  { href: "/admin/stores", label: "المتاجر", icon: Store },
  { href: "/admin/subscriptions", label: "الاشتراكات", icon: CreditCard },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/analytics", label: "التقارير", icon: TrendingUp },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminShell({
  children,
  userName,
  storesCount,
  expiringCount,
}: {
  children: React.ReactNode;
  userName: string;
  storesCount: number;
  expiringCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-extrabold">
                م
              </div>
              <div>
                <span className="block text-lg font-extrabold text-gray-900 leading-none">
                  متاجر
                </span>
                <span className="block text-[10px] font-bold text-emerald-600 leading-none mt-0.5">
                  لوحة تحكم المنصة
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {expiringCount > 0 && (
              <Link
                href="/admin/subscriptions?filter=expiring"
                className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {expiringCount} اشتراك قارب على الانتهاء
              </Link>
            )}
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900">{userName}</p>
              <p className="text-[10px] text-gray-500">مدير المنصة</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700">
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* القائمة الجانبية */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } w-64 shrink-0 border-l border-gray-200 bg-white lg:block`}
        >
          <nav className="space-y-1 p-4">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                  {item.href === "/admin/stores" && storesCount > 0 && (
                    <span className="mr-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                      {storesCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-gray-100 p-4">
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
              <p className="text-xs font-bold text-gray-900">منصة متاجر</p>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                لوحة التحكم المركزية لإدارة جميع متاجر المنصة والاشتراكات والإحصائيات.
              </p>
            </div>
          </div>
        </aside>

        {/* المحتوى */}
        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
