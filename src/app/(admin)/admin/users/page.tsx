import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireAdmin();
  const { q } = await searchParams;

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      stores: {
        select: { id: true, name: true, slug: true, status: true },
      },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">المستخدمون</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة التجار وأصحاب المتاجر — تعديل، حذف، وتغيير كلمة المرور.
        </p>
      </div>

      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="ابحث بالاسم أو البريد أو الهاتف..."
          className="w-full max-w-sm rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
        >
          بحث
        </button>
      </form>

      <UsersTable users={users} currentUserId={user.id} />
    </div>
  );
}
