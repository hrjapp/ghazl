"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  updateUserByAdminAction,
  deleteUserByAdminAction,
} from "@/app/actions/admin-users";
import { Pencil, Trash2, X, ShieldCheck, Store as StoreIcon } from "lucide-react";

type UserData = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: Date;
  stores: { id: string; name: string; slug: string; status: string }[];
};

export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserData[];
  currentUserId: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = users.find((u) => u.id === editingId);

  if (editing) {
    return (
      <EditUserForm
        user={editing}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-400">لا يوجد مستخدمون مطابقون.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-bold text-gray-500">
              <th className="p-4">المستخدم</th>
              <th className="p-4">الهاتف</th>
              <th className="p-4">الدور</th>
              <th className="p-4">المتاجر</th>
              <th className="p-4">تاريخ التسجيل</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-50 transition last:border-0 hover:bg-gray-50/50"
              >
                <td className="p-4">
                  <div className="font-bold text-gray-900">{u.name}</div>
                  <div className="mt-0.5 text-xs text-gray-400 nums">
                    {u.email || "—"}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600 nums" dir="ltr">
                  {u.phone || "—"}
                </td>
                <td className="p-4">
                  {u.role === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                      <ShieldCheck className="h-3 w-3" />
                      مدير
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                      تاجر
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {u.stores.length === 0 ? (
                    <span className="text-xs text-gray-300">لا يوجد</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {u.stores.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                        >
                          <StoreIcon className="h-3 w-3" />
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-4 text-xs text-gray-400 nums">
                  {new Date(u.createdAt).toLocaleDateString("ar-SA")}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(u.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-200"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </button>
                    {u.id !== currentUserId && u.role !== "ADMIN" && (
                      <DeleteUserButton userId={u.id} userName={u.name} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditUserForm({
  user,
  onCancel,
}: {
  user: UserData;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    updateUserByAdminAction,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message);
      onCancel();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, onCancel]);

  return (
    <form action={action} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-900">
          تعديل: {user.name}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {state?.message && !state.ok && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}

      <input type="hidden" name="userId" value={user.id} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              الاسم *
            </label>
            <input
              name="name"
              defaultValue={user.name}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              البريد الإلكتروني
            </label>
            <input
              name="email"
              type="email"
              dir="ltr"
              defaultValue={user.email ?? ""}
              placeholder="user@example.com"
              className={`${inputCls} text-left`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              الهاتف
            </label>
            <input
              name="phone"
              dir="ltr"
              defaultValue={user.phone ?? ""}
              placeholder="+9665XXXXXXXX"
              className={`${inputCls} text-left`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              كلمة المرور الجديدة
            </label>
            <input
              name="password"
              type="password"
              dir="ltr"
              placeholder="اتركها فارغة لعدم التغيير"
              className={`${inputCls} text-left`}
            />
            <p className="mt-1.5 text-xs text-gray-400">
              اكتب كلمة مرور جديدة (6 أحرف على الأقل) أو اتركها فارغة.
            </p>
          </div>
        </div>

        {user.stores.length > 0 && (
          <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3.5">
            <p className="text-xs font-bold text-gray-500">
              متاجر هذا المستخدم ({user.stores.length}):
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.stores.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200"
                >
                  <StoreIcon className="h-3 w-3" />
                  {s.name} — /{s.slug}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-brand-600 px-8 py-3 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </form>
  );
}

function DeleteUserButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [, action, pending] = useActionState(deleteUserByAdminAction, undefined);
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        حذف
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-2 py-1.5">
      <form action={action}>
        <input type="hidden" name="userId" value={userId} />
        <span className="text-xs font-bold text-red-600">حذف {userName}؟</span>
        <button
          type="submit"
          disabled={pending}
          className="ml-1.5 rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
        >
          {pending ? "..." : "نعم"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="rounded bg-white px-2 py-1 text-xs font-bold text-gray-600 ring-1 ring-gray-200"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
