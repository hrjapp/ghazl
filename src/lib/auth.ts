import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
type CurrentStore = NonNullable<Awaited<ReturnType<typeof getCurrentStore>>>;

const SESSION_COOKIE = "ghazl_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);

export type SessionPayload = {
  userId: string;
  role: string;
};

// مدة الجلسة: 7 أيام
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** إنشاء JWT وتخزينه في كوكيز آمن */
export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE)
    .sign(secret);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return token;
}

/** التحقق من الجلسة وإرجاع الحمولة فقط (بدون استعلام قاعدة البيانات) */
export async function verifySession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** استرجاع المستخدم الحالي مع متجره النشط */
export async function getCurrentUser() {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      memberships: {
        include: { store: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  return user;
}

/** المتجر النشط للمستخدم الحالي (أول متجر يملكه) */
export async function getCurrentStore() {
  const user = await getCurrentUser();
  if (!user || user.memberships.length === 0) return null;
  const first = user.memberships[0];
  return first.store;
}

/** إنهاء الجلسة */
export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** حماية الصفحات: إرجاع المستخدم أو إعادة توجيه لتسجيل الدخول */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** تتطلب متجراً نشطاً */
export async function requireStore(): Promise<{ user: CurrentUser; store: CurrentStore }> {
  const user = await requireUser();
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");
  return { user, store };
}
