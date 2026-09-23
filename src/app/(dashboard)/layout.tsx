import { requireStore } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, store } = await requireStore();

  return (
    <DashboardShell
      storeName={store.name}
      storeSlug={store.slug}
      userName={user.name}
      userEmail={user.email || undefined}
    >
      {children}
    </DashboardShell>
  );
}
