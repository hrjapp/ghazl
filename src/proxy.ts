import { NextResponse, type NextRequest } from "next/server";

/**
 * وكيل النطاقات الفرعية (Subdomain proxy)
 * يحوّل mystore.ai-hrj.xyz → واجهة متجر mystore.
 * Next.js يطبّق basePath تلقائياً على request.nextUrl هنا.
 */

const PLATFORM_HOSTS = ["localhost:3000", "localhost"];
const APP_SUBDOMAINS = ["www", "app", "admin", "api", "dashboard"];

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]; // إزالة المنفذ
  const storeDomain = process.env.STORE_DOMAIN || "ai-hrj.xyz";

  // المنصة الرئيسية أو localhost → بدون تغيير
  if (PLATFORM_HOSTS.includes(hostname) || hostname === storeDomain) {
    return NextResponse.next();
  }

  // النطاق الفرعي للمنصة أو المسارات الخاصة → بدون تغيير
  const parts = hostname.split(".");
  if (parts.length <= 2) return NextResponse.next();

  const subdomain = parts[0];
  if (APP_SUBDOMAINS.includes(subdomain)) return NextResponse.next();

  // نطاق متجر: subdomain.storeDomain
  if (!hostname.endsWith(`.${storeDomain}`)) return NextResponse.next();

  // أصول Next.js و API والمسارات الخاصة → بدون تغيير
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // إعادة الكتابة لمسار المتجر (Next يحافظ على basePath)
  const url = request.nextUrl.clone();
  url.pathname = `/preview/${subdomain}${pathname}`;
  url.search = request.nextUrl.search;

  const response = NextResponse.rewrite(url);
  response.headers.set("x-store-slug", subdomain);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
