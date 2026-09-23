import { requireStore } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { store } = await requireStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">الإعدادات</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة معلومات متجرك وتواصله.
        </p>
      </div>
      <SettingsForm store={store} />
    </div>
  );
}
