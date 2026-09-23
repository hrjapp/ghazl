import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* لوحة العلامة */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-100 via-accent-100 to-brand-200 p-12">
        {/* فقاعات زخرفية */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-accent-300/40 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-white/40 blur-2xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg">
              <span className="text-3xl">🧶</span>
            </div>
            <span className="text-2xl font-extrabold text-brand-800">غَزْل</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight text-brand-900">
            متجرك الإلكتروني
            <br />
            يبدأ من هنا
          </h1>
          <p className="text-lg text-brand-700/90 max-w-md leading-relaxed">
            أنشئ متجرك في دقائق، أدر منتجاتك وطلباتك من لوحة واحدة، ووسّع
            عملك مع باقات تنموك.
          </p>
          <div className="flex flex-wrap gap-3">
            {["عربية بالكامل", "دفع عند الاستلام", "باقة مجانية"].map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/70 backdrop-blur px-4 py-2 text-sm font-semibold text-brand-800 shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-brand-700/70">
          © 2026 غَزْل — جميع الحقوق محفوظة
        </div>
      </div>

      {/* النموذج */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
