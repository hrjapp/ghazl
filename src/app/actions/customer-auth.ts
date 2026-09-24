"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "customer_session";
const SESSION_DAYS = 30;

function bad(message: string) {
  return { ok: false, message };
}

/**
 * تسجيل عميل جديد في متجر
 */
export async function customerRegisterAction(prev: unknown, formData: FormData) {
  const storeId = String(formData.get("storeId") || "");
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase() || null;
  const password = String(formData.get("password") || "");

  if (!storeId) return bad("المتجر غير محدد");
  if (!name) return bad("الاسم مطلوب");
  if (!phone) return bad("الهاتف مطلوب");
  if (password.length < 6) return bad("كلمة المرور 6 أحرف على الأقل");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return bad("صيغة البريد غير صحيحة");

  try {
    const existing = await prisma.customer.findUnique({
      where: { storeId_phone: { storeId, phone } },
    });
    if (existing) return bad("هذا الهاتف مسجل مسبقاً في هذا المتجر");

    if (email) {
      const existingEmail = await prisma.customer.findUnique({
        where: { storeId_email: { storeId, email } },
      });
      if (existingEmail) return bad("هذا البريد مسجل مسبقاً في هذا المتجر");
    }

    const customer = await prisma.customer.create({
      data: {
        storeId,
        name,
        phone,
        email,
        passwordHash: bcrypt.hashSync(password, 10),
      },
    });

    await createSession(customer.id, storeId);

    revalidatePath("/*");
    return { ok: true, message: `أهلاً ${name}! تم إنشاء حسابك`, customer };
  } catch (e) {
    return bad("حدث خطأ أثناء التسجيل");
  }
}

/**
 * تسجيل دخول عميل
 */
export async function customerLoginAction(prev: unknown, formData: FormData) {
  const storeId = String(formData.get("storeId") || "");
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "");

  if (!storeId || !identifier || !password) return bad("البيانات ناقصة");

  try {
    // الهاتف أولاً، ثم البريد
    let customer = await prisma.customer.findUnique({
      where: { storeId_phone: { storeId, phone: identifier } },
    });

    if (!customer && identifier.includes("@")) {
      customer = await prisma.customer.findUnique({
        where: { storeId_email: { storeId, email: identifier.toLowerCase() } },
      });
    }

    if (!customer) return bad("الحساب غير موجود");
    if (!customer.passwordHash) return bad("هذا الحساب ليس لديه كلمة مرور");
    if (!bcrypt.compareSync(password, customer.passwordHash))
      return bad("كلمة المرور غير صحيحة");

    await createSession(customer.id, storeId);

    revalidatePath("/*");
    return { ok: true, message: `أهلاً ${customer.name}!`, customer };
  } catch (e) {
    return bad("حدث خطأ أثناء الدخول");
  }
}

/**
 * تسجيل خروج عميل
 */
export async function customerLogoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      await prisma.customerSession.deleteMany({ where: { token } });
    } catch {}
  }

  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/*");
  return { ok: true };
}

async function createSession(customerId: string, storeId: string) {
  const token = crypto.randomUUID() + "-" + Date.now();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await prisma.customerSession.create({
    data: { token, customerId, storeId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}
