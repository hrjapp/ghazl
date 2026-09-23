"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

/**
 * بوابة دخول مدير المنصة.
 * تدعم إما:
 *   1) مستخدم موجود بصلاحية ADMIN (بالبريد/الهاتف + كلمة المرور)
 *   2) حساب المدير الافتراضي admin/admin (يُنشأ تلقائياً عند أول استخدام)
 */

const ADMIN_DEFAULT_EMAIL = "admin";
const ADMIN_DEFAULT_PASSWORD = "admin";

const adminLoginSchema = z.object({
  identifier: z.string().min(1, "أدخل البريد أو اسم المستخدم"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export type AdminLoginState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function adminLoginAction(
  _prev: AdminLoginState | undefined,
  formData: FormData
): Promise<AdminLoginState> {
  const raw = {
    identifier: String(formData.get("identifier") || "").trim(),
    password: String(formData.get("password") || ""),
  };

  const parsed = adminLoginSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { errors };
  }

  const { identifier, password } = parsed.data;

  // 1) الحساب الافتراضي admin/admin
  if (identifier === ADMIN_DEFAULT_EMAIL && password === ADMIN_DEFAULT_PASSWORD) {
    // ابحث عن مستخدم ADMIN موجود (أنشئه إن لم يكن)
    let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

    if (!admin) {
      const hash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10);
      admin = await prisma.user.create({
        data: {
          name: "مدير المنصة",
          email: "admin@ai-hrj.xyz",
          passwordHash: hash,
          role: "ADMIN",
        },
      });
    }

    await createSession({ userId: admin.id, role: "ADMIN" });
    redirect("/admin");
  }

  // 2) مستخدم ADMIN موجود بالبريد/الهاتف
  const isEmail = identifier.includes("@");
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: identifier } : { phone: identifier },
  });

  if (!user || !user.passwordHash) {
    return { message: "بيانات الدخول غير صحيحة أو لا تملك صلاحية المدير" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { message: "بيانات الدخول غير صحيحة" };
  }

  if (user.role !== "ADMIN") {
    return { message: "هذا الحساب لا يملك صلاحية المدير — استخدم بوابة الدخول العادية" };
  }

  await createSession({ userId: user.id, role: "ADMIN" });
  redirect("/admin");
}
