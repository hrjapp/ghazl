"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteCustomerAction } from "@/app/actions/admin";

export function CustomerActions({ customerId, customerName }: { customerId: string; customerName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        disabled={pending}
        onClick={() => setConfirm(true)}
        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        title="حذف العميل"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await deleteCustomerAction(customerId);
            if (res.ok) {
              toast.success(res.message);
              router.refresh();
            } else {
              toast.error(res.message);
            }
          })
        }
        className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
      >
        تأكيد
      </button>
      <button
        disabled={pending}
        onClick={() => setConfirm(false)}
        className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
      >
        لا
      </button>
    </div>
  );
}
