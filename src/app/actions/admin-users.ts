"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * تحديث بيانات مستخدم (من الأدمن): الاسم، البريد، الهاتف، كلمة المرور
 */
export async function updateUserByAdminAction(
  prev: unknown,
  formData: FormData,
) {
  await requireAdmin();

  const userId = String(formData.get("userId") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const password = String(formData.get("password") || "");

  if (!userId) return { ok: false, message: "معرّف المستخدم مفقود" };
  if (!name) return { ok: false, message: "الاسم مطلوب" };

  // التحقق من صحة البريد
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, message: "صيغة البريد غير صحيحة" };

  try {
    // فحص تكرار البريد
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existing)
        return { ok: false, message: "هذا البريد مستخدم من مستخدم آخر" };
    }

    // فحص تكرار الهاتف
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone, NOT: { id: userId } },
      });
      if (existingPhone)
        return { ok: false, message: "هذا الهاتف مستخدم من مستخدم آخر" };
    }

    const data: any = { name, email, phone };
    if (password) {
      if (password.length < 6)
        return { ok: false, message: "كلمة المرور 6 أحرف على الأقل" };
      data.passwordHash = bcrypt.hashSync(password, 10);
    }

    await prisma.user.update({ where: { id: userId }, data });

    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
    return { ok: true, message: `تم تحديث «${name}» بنجاح` };
  } catch (e) {
    return { ok: false, message: "حدث خطأ أثناء الحفظ" };
  }
}

/**
 * حذف مستخدم (مع متاجره)
 */
export async function deleteUserByAdminAction(
  prev: unknown,
  formData: FormData,
) {
  await requireAdmin();

  const userId = String(formData.get("userId") || "");
  if (!userId) return { ok: false, message: "معرّف المستخدم مفقود" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, stores: { select: { id: true } } },
    });

    if (!user) return { ok: false, message: "المستخدم غير موجود" };
    if (user.role === "ADMIN")
      return { ok: false, message: "لا يمكن حذف مدير المنصة" };

    // حذف متاجره أولاً (العلاقات المرتبطة بها)
    for (const store of user.stores) {
      await prisma.orderItem.deleteMany({
        where: { order: { storeId: store.id } },
      });
      await prisma.payment.deleteMany({ where: { storeId: store.id } });
      await prisma.order.deleteMany({ where: { storeId: store.id } });
      await prisma.product.deleteMany({ where: { storeId: store.id } });
      await prisma.category.deleteMany({ where: { storeId: store.id } });
      await prisma.customer.deleteMany({ where: { storeId: store.id } });
      await prisma.address.deleteMany({
        where: { customer: { storeId: store.id } },
      });
      await prisma.storeSubscription.deleteMany({
        where: { storeId: store.id },
      });
      await prisma.storeMember.deleteMany({ where: { storeId: store.id } });
      await prisma.store.delete({ where: { id: store.id } });
    }

    // حذف العضويات والـ OTP
    await prisma.storeMember.deleteMany({ where: { userId } });
    await prisma.otp.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
    return { ok: true, message: "تم حذف المستخدم ومتاجره" };
  } catch (e) {
    return { ok: false, message: "حدث خطأ أثناء الحذف" };
  }
}
