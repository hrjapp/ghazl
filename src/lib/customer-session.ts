import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "customer_session";

/**
 * العميل الحالي المسجل دخوله في متجر معين (أو null)
 */
export async function getCurrentCustomer(storeId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const session = await prisma.customerSession.findUnique({
      where: { token },
      include: { customer: true },
    });

    if (!session) return null;
    if (session.storeId !== storeId) return null;
    if (session.expiresAt < new Date()) {
      await prisma.customerSession.delete({ where: { id: session.id } });
      return null;
    }

    return session.customer;
  } catch {
    return null;
  }
}
