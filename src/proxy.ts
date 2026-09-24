import { NextResponse, type NextRequest } from "next/server";

/**
 * وكيل متاجر المسار الفرعي (Path-based proxy)
 * يحوّل domain.com/mystore → واجهة متجر mystore.
 * النطاقات الفرعية القديمة (mystore.domain.com) لا تزال مدعومة.
 * Next.js يطبّق basePath تلقائياً على request.nextUrl هنا.
 */

const PLATFORM_HOSTS = ["localhost:3000", "localhost"];
const APP_SUBDOMAINS = ["www", "app", "admin", "api", "dashboard"];
// مسارات المنصة المحجوزة (لا تُعتبر متاجر)
const RESERVED_PATHS = [
  "/admin",
  "/dashboard",
  "/login",
  "/register",
  "/subscription",
  "/settings",
  "/api",
  "/_next",
  "/preview",
  "/admin-login",
  "/verify",
  "/otp",
  "/storefront",
  "/auth",
  "/account",
];

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]; // إزالة المنفذ
  const storeDomain = process.env.STORE_DOMAIN || "ai-hrj.xyz";
  const { pathname } = request.nextUrl;

  // المنصة الرئيسية أو localhost → بدون تغيير
  if (PLATFORM_HOSTS.includes(hostname) || hostname === storeDomain) {
    // ── المسار الفرعي: domain.com/mystore ──
    // إزالة basePath من المسار
    const basePath = "/ghazl";
    const relPath = pathname.startsWith(basePath)
      ? pathname.slice(basePath.length)
      : pathname;

    // مسار جذر أو مسار محجوز → ليس متجراً
    if (relPath === "/" || relPath === "") return NextResponse.next();
    if (RESERVED_PATHS.some((p) => relPath === p || relPath.startsWith(p + "/")))
      return NextResponse.next();

    // أول جزء من المسار = slug المتجر
    const segments = relPath.split("/").filter(Boolean);
    const maybeSlug = segments[0];

    // تجاهل الملفات والأصول
    if (maybeSlug.includes(".")) return NextResponse.next();

    // أعد الكتابة لواجهة المتجر
    const url = request.nextUrl.clone();
    url.pathname = `/preview/${maybeSlug}${segments
      .slice(1)
      .map((s) => "/" + s)
      .join("")}`;
    url.search = request.nextUrl.search;

    const response = NextResponse.rewrite(url);
    response.headers.set("x-store-slug", maybeSlug);
    return response;
  }

  // ── النطاق الفرعي القديم: mystore.domain.com ──
  const parts = hostname.split(".");
  if (parts.length <= 2) return NextResponse.next();

  const subdomain = parts[0];
  if (APP_SUBDOMAINS.includes(subdomain)) return NextResponse.next();

  if (!hostname.endsWith(`.${storeDomain}`)) return NextResponse.next();

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

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
