import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Store,
  CreditCard,
  Truck,
  BarChart3,
  ShieldCheck,
  Smartphone,
  ArrowLeft,
  Check,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const hasStore = user
    ? await prisma.storeMember.findFirst({ where: { userId: user.id } })
    : null;

  const primaryHref = user ? (hasStore ? "/dashboard" : "/onboarding") : "/register";

  const features = [
    {
      icon: Store,
      title: "متجر في دقائق",
      desc: "أنشئ متجرك الإلكتروني الاحترافي بدون أي خبرة تقنية.",
    },
    {
      icon: CreditCard,
      title: "دفع عند الاستلام",
      desc: "استقبل طلباتك بسهولة مع خيار الدفع نقداً عند التوصيل.",
    },
    {
      icon: Truck,
      title: "إدارة الطلبات",
      desc: "تابع كل طلب من تأكيده حتى توصيله في لوحة واحدة.",
    },
    {
      icon: BarChart3,
      title: "تقارير المبيعات",
      desc: "افهم أداء متجرك بأرقام واضحة وإحصائيات لحظية.",
    },
    {
      icon: ShieldCheck,
      title: "بياناتك محمية",
      desc: "عزل كامل لبيانات كل متجر وأمان على مستوى المؤسسات.",
    },
    {
      icon: Smartphone,
      title: "متجزك على كل الأجهزة",
      desc: "تصميم متجاوب يعمل بسلاسة على الجوال والحاسوب.",
    },
  ];

  const plans = [
    {
      name: "المجاني",
      price: "0",
      desc: "للبدايات",
      features: ["حتى 25 منتج", "نطاق فرعي مجاني", "إدارة الطلبات", "دعم بريدي"],
      cta: "ابدأ مجاناً",
    },
    {
      name: "الفضي",
      price: "99",
      desc: "للتجار النامين",
      popular: true,
      features: [
        "حتى 500 منتج",
        "نطاق مخصص",
        "أكواد الخصومات",
        "تقارير متقدمة",
        "دعم أولوية",
      ],
      cta: "اختر الفضي",
    },
    {
      name: "الذهبي",
      price: "249",
      desc: "للمتاجر الكبيرة",
      features: [
        "منتجات غير محدودة",
        "مستخدمون بلا حدود",
        "تحليلات معمقة",
        "أدوات التسويق",
        "دعم 24/7",
      ],
      cta: "اختر الذهبي",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      {/* الترويسة */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <span className="text-xl">🧶</span>
            </div>
            <span className="text-xl font-extrabold text-brand-800">متاجر</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
              المزايا
            </a>
            <a href="#plans" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
              الباقات
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href={primaryHref}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                لوحة التحكم
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  أنشئ متجرك
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* البطل */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute top-20 -left-32 h-80 w-80 rounded-full bg-accent-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-700 backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-brand-500" />
            منصة عربية بالكامل
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 sm:text-6xl">
            متجرك الإلكتروني
            <br />
            <span className="bg-gradient-to-l from-brand-600 to-accent-500 bg-clip-text text-transparent">
              يبدأ من متاجر
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-relaxed">
            أنشئ متجرك في دقائق، أدر منتجاتك وطلباتك من لوحة واحدة، ووسّع
            عملك مع باقات تنموك — بدون أي خبرة تقنية.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={primaryHref}
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 font-bold text-white shadow-xl shadow-brand-600/25 transition hover:bg-brand-700"
            >
              ابدأ متجرك مجاناً
              <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
            </Link>
            <a
              href="#plans"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 font-bold text-gray-700 transition hover:bg-gray-50"
            >
              شاهد الباقات
            </a>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand-600" /> بدون رسوم خفية
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand-600" /> دعم بالعربية
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand-600" /> باقة مجانية للأبد
            </span>
          </div>
        </div>
      </section>

      {/* المزايا */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            كل ما يحتاجه متجرك
          </h2>
          <p className="mt-3 text-gray-500">
            أدوات متكاملة تواكب نمو متجرك من أول طلب إلى آلاف الطلبات
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-brand-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 transition group-hover:scale-110">
                  <Icon className="h-6 w-6 text-brand-700" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* الباقات */}
      <section id="plans" className="bg-gray-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              باقات تناسب الجميع
            </h2>
            <p className="mt-3 text-gray-500">
              ابدأ مجاناً وارتقِ عندما تكبر — بدون عقود
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border-2 bg-white p-8 shadow-sm ${
                  plan.popular
                    ? "border-brand-500 shadow-lg shadow-brand-500/10 scale-[1.02]"
                    : "border-gray-100"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-8 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow">
                    الأكثر شيوعاً
                  </span>
                )}
                <h3 className="text-xl font-extrabold text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{plan.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-brand-700 nums">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-500">ر.س / شهرياً</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${primaryHref}${plan.name !== "المجاني" ? `?plan=${plan.name === "الفضي" ? "silver" : "gold"}` : ""}`}
                  className={`mt-8 block rounded-xl px-6 py-3.5 text-center font-bold transition ${
                    plan.popular
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* دعوة للعمل */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center sm:p-16">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 -left-16 h-64 w-64 rounded-full bg-accent-500/20 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold text-white sm:text-4xl">
            جاهز لبدء رحلتك؟
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">
            انضم لمئات التجار الذين يديرون متاجرهم على متاجر. أنشئ متجرك
            مجاناً اليوم.
          </p>
          <Link
            href={primaryHref}
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-brand-700 shadow-xl transition hover:bg-gray-50"
          >
            إنشاء متجرك الآن
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* التذييل */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧶</span>
            <span className="font-extrabold text-brand-800">متاجر</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 متاجر — منصة المتاجر الإلكترونية
          </p>
        </div>
      </footer>
    </div>
  );
}
