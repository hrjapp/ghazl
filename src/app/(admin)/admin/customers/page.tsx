import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { CustomerActions } from "./CustomerActions";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const perPage = 20;
  const skip = (page - 1) * perPage;
  const search = sp.search ?? "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        store: { select: { id: true, name: true, slug: true } },
        _count: { select: { orders: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">عملاء المنصة</h1>
        <p className="mt-1 text-sm text-gray-500">
          {total.toLocaleString("ar-SA")} عميل عبر جميع المتاجر
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 font-extrabold text-gray-900">لا يوجد عملاء</h3>
          <p className="mt-1 text-sm text-gray-400">
            {search ? "لا نتائج لبحثك" : "لم يسجّل أي عميل بعد"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-right">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-bold text-gray-500">
                  <th className="p-4">العميل</th>
                  <th className="p-4">المتجر</th>
                  <th className="p-4">الهاتف</th>
                  <th className="p-4">البريد</th>
                  <th className="p-4">الطلبات</th>
                  <th className="p-4">تاريخ التسجيل</th>
                  <th className="p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-sm font-extrabold text-amber-700">
                          {c.name.charAt(0)}
                        </div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">{c.store.name}</td>
                    <td className="p-4 text-sm font-medium text-gray-600 nums" dir="ltr">
                      {c.phone}
                    </td>
                    <td className="p-4 text-sm text-gray-500" dir="ltr">
                      {c.email ?? "—"}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 nums">
                        {c._count.orders}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400 nums">
                      {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="p-4">
                      <CustomerActions customerId={c.id} customerName={c.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 3, totalPages - 6));
            const num = start + i;
            if (num > totalPages) return null;
            const qs = search ? `&search=${encodeURIComponent(search)}` : "";
            return (
              <a
                key={num}
                href={`/admin/customers?page=${num}${qs}`}
                className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold ${
                  num === page
                    ? "bg-emerald-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {num.toLocaleString("ar-SA")}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
