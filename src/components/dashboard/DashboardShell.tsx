"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/dashboard", label: "النظرة العامة", icon: LayoutDashboard },
  { href: "/products", label: "المنتجات", icon: Package },
  { href: "/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/customers", label: "العملاء", icon: Users },
  { href: "/subscription", label: "الباقة والاشتراك", icon: CreditCard },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function DashboardShell({
  storeName,
  storeSlug,
  userName,
  userEmail,
  children,
}: {
  storeName: string;
  storeSlug: string;
  userName: string;
  userEmail?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* القائمة الجانبية */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 transform bg-white border-l border-gray-200 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* الشعار */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <span className="text-xl">🧶</span>
              </div>
              <div>
                <span className="block text-lg font-extrabold text-brand-800 leading-none">
                  متاجر
                </span>
                <span className="text-xs text-gray-400">لوحة التحكم</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* اسم المتجر */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400">المتجر الحالي</p>
              <p className="font-bold text-gray-900 truncate">{storeName}</p>
              <p className="text-xs text-gray-400 truncate" dir="ltr">
                {storeSlug}.ai-hrj.xyz
              </p>
            </div>
          </div>

          {/* روابط التنقل */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {NAV.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* التذييل: المستخدم */}
          <div className="border-t border-gray-100 p-4">
            <Link
              href={`/preview/${storeSlug}`}
              target="_blank"
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 mb-2"
            >
              <ExternalLink className="h-4 w-4" />
              عرض المتجر
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </form>
            <div className="mt-3 px-4 pt-3 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* غطاء للجوال */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* المحتوى */}
      <div className="lg:pr-72">
        {/* الشريط العلوي */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur px-5 py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-lg font-extrabold text-gray-900">{storeName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/preview/${storeSlug}`}
              target="_blank"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">عرض المتجر</span>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        <main className="p-5 sm:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
