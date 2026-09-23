import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-emerald-100/50">
          {/* الشعار */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-3xl font-extrabold text-white shadow-lg shadow-emerald-200">
              م
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
              لوحة تحكم المنصة
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              بوابة دخول مدير المنصة — للإدارة الكاملة للمتاجر والاشتراكات
            </p>
          </div>

          <div className="mt-8">
            <AdminLoginForm />
          </div>

          <div className="mt-6 border-t border-gray-100 pt-5 text-center">
            <a
              href="/login"
              className="text-sm font-bold text-gray-500 hover:text-emerald-600"
            >
              أنت تاجر؟ ادخل من هنا ←
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          متاجر — منصة المتاجر الإلكترونية
        </p>
      </div>
    </div>
  );
}
