import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { slug } = await params;
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 animate-fade-in">
        <CheckCircle2 className="h-10 w-10 text-brand-600" />
      </div>

      <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
        تم استلام طلبك بنجاح! 🎉
      </h1>

      {order && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <Package className="h-5 w-5 text-brand-600" />
          <span className="text-gray-500">رقم الطلب</span>
          <span className="text-lg font-extrabold text-brand-700 nums">
            {order}
          </span>
        </div>
      )}

      <p className="mt-6 text-gray-500 leading-relaxed">
        شكراً لثقتك بنا! سيتواصل معك فريقنا قريباً لتأكيد الطلب وترتيب التوصيل.
        الدفع يكون عند الاستلام.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/preview/${slug}/products`}
          className="rounded-xl bg-brand-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
        >
          مواصلة التسوق
        </Link>
        <Link
          href={`/preview/${slug}`}
          className="rounded-xl border border-gray-200 px-8 py-3.5 font-bold text-gray-700 transition hover:bg-gray-50"
        >
          الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
