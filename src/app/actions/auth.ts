"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, requireUser } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/tenant";

// ======================== التسجيل ========================

const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z
    .string()
    .min(9, "رقم جوال غير صالح")
    .regex(/^[0-9+]+$/, "رقم الجوال يجب أن يحتوي أرقاماً فقط"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});

export type RegisterState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function registerAction(
  _prev: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    password: String(formData.get("password") || ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { errors };
  }

  const { name, email, phone, password } = parsed.data;

  // التحقق من عدم التكرار
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (exists) {
    return {
      message: "البريد أو رقم الجوال مستخدم بالفعل. سجّل الدخول بدلاً من ذلك.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "MERCHANT" },
  });

  await createSession({ userId: user.id, role: user.role });
  redirect("/onboarding");
}

// ======================== تسجيل الدخول ========================

const loginSchema = z.object({
  identifier: z.string().min(3, "أدخل البريد أو رقم الجوال"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export type LoginState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function loginAction(
  _prev: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const raw = {
    identifier: String(formData.get("identifier") || ""),
    password: String(formData.get("password") || ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { errors };
  }

  const { identifier, password } = parsed.data;
  const isEmail = identifier.includes("@");

  const user = await prisma.user.findFirst({
    where: isEmail ? { email: identifier } : { phone: identifier },
  });

  if (!user || !user.passwordHash) {
    return { message: "بيانات الدخول غير صحيحة" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { message: "بيانات الدخول غير صحيحة" };
  }

  await createSession({ userId: user.id, role: user.role });

  // توجيه حسب الحالة: إن لم يكن لديه متجر → الإنشاء
  const hasStore = await prisma.storeMember.findFirst({
    where: { userId: user.id },
  });
  redirect(hasStore ? "/dashboard" : "/onboarding");
}

// ======================== تسجيل الخروج ========================

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

// ======================== إنشاء المتجر (Onboarding) ========================

const createStoreSchema = z.object({
  storeName: z.string().min(2, "اسم المتجر حرفين على الأقل"),
  storeSlug: z
    .string()
    .min(3, "النطاق 3 أحرف على الأقل")
    .max(30, "النطاق 30 حرفاً كحد أقصى")
    .regex(/^[a-z0-9-]+$/, "حروف لاتينية صغيرة أو أرقام أو شرطة فقط"),
  planSlug: z.enum(["free", "silver", "gold"]),
  description: z.string().optional(),
});

export type CreateStoreState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function createStoreAction(
  _prev: CreateStoreState | undefined,
  formData: FormData
): Promise<CreateStoreState> {
  const user = await requireUser();

  const raw = {
    storeName: String(formData.get("storeName") || ""),
    storeSlug: String(formData.get("storeSlug") || ""),
    planSlug: String(formData.get("planSlug") || "free"),
    description: String(formData.get("description") || ""),
  };

  const parsed = createStoreSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { errors };
  }

  const { storeName, storeSlug, planSlug, description } = parsed.data;

  const slugTaken = await prisma.store.findUnique({ where: { slug: storeSlug } });
  if (slugTaken) {
    return { message: "النطاق الفرعي محجوز، جرّب اسماً آخر", errors: { storeSlug: "محجوز" } };
  }

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) {
    return { message: "الباقة المختارة غير موجودة" };
  }

  // كل شيء سليم: أنشئ المتجر + العضوية + الاشتراك
  const store = await prisma.store.create({
    data: {
      name: storeName,
      slug: storeSlug,
      description: description || null,
      ownerId: user.id,
      status: "ACTIVE",
      memberships: {
        create: { userId: user.id, role: "OWNER" },
      },
      subscriptions: {
        create: {
          planId: plan.id,
          status: plan.slug === "free" ? "ACTIVE" : "TRIALING",
          trialEndsAt: plan.slug === "free" ? null : new Date(Date.now() + 14 * 86400 * 1000),
          expiresAt: plan.slug === "free"
            ? null
            : new Date(Date.now() + 14 * 86400 * 1000),
        },
      },
    },
  });

  redirect("/dashboard");
}

/** اقتراح نطاق فرعي متاح بناءً على اسم المتجر */
export async function suggestSlugAction(storeName: string) {
  return await generateUniqueSlug(storeName, async (slug) => {
    const existing = await prisma.store.findUnique({ where: { slug } });
    return !!existing;
  });
}
