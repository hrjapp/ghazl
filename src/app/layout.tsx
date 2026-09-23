import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "متاجر — منصة المتاجر الإلكترونية",
    template: "%s | متاجر",
  },
  description: "أنشئ متجرك الإلكتروني الخاص في دقائق. منصة عربية متكاملة لإدارة المتاجر والمنتجات والطلبات.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased bg-gray-50 text-gray-900 min-h-screen">
        {children}
        <Toaster
          position="top-center"
          richColors
          dir="rtl"
          toastOptions={{ className: "font-cairo" }}
        />
      </body>
    </html>
  );
}
