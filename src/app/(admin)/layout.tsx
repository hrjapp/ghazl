import { redirect } from "next/navigation";
import { requireAdmin, getCurrentStore } from "@/lib/auth";
import { getPlatformStats, getExpiringSoon } from "@/lib/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // صلاحية مدير المنصة فقط — المزار يعاد توجيهه للوحة تحكم متجره
  const user = await requireAdmin();

  // المدير بدون متجر لا مشكلة فيه؛ لكن إن كان لديه متجر نُبقيه
  let storesCount = 0;
  try {
    const stats = await getPlatformStats();
    storesCount = stats.totalStores;
  } catch {
    // قاعدة البيانات قد تكون فارغة
  }

  let expiringCount = 0;
  try {
    expiringCount = (await getExpiringSoon(7)).length;
  } catch {
    // ignore
  }

  return (
    <AdminShell
      userName={user.name}
      storesCount={storesCount}
      expiringCount={expiringCount}
    >
      {children}
    </AdminShell>
  );
}
