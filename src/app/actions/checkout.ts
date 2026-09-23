"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { firstImage } from "@/lib/convert";

const checkoutSchema = z.object({
  storeSlug: z.string().min(1),
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z
    .string()
    .min(9, "رقم جوال صحيح مطلوب")
    .regex(/^[0-9+]+$/, "رقم الجوال أرقام فقط"),
  city: z.string().min(2, "المدينة مطلوبة"),
  district: z.string().optional(),
  street: z.string().optional(),
  details: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["COD", "CARD"]).default("COD"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "السلة فارغة"),
});

export type CheckoutState = {
  errors?: Record<string, string>;
  message?: string;
  ok?: boolean;
  orderNumber?: string;
};

export async function checkoutAction(
  _prev: CheckoutState | undefined,
  formData: FormData
): Promise<CheckoutState> {
  // السلة تُرسل كـ JSON مشفّر
  const itemsRaw = String(formData.get("items") || "[]");

  const parsed = checkoutSchema.safeParse({
    storeSlug: String(formData.get("storeSlug") || ""),
    customerName: String(formData.get("customerName") || ""),
    customerPhone: String(formData.get("customerPhone") || ""),
    city: String(formData.get("city") || ""),
    district: String(formData.get("district") || ""),
    street: String(formData.get("street") || ""),
    details: String(formData.get("details") || ""),
    notes: String(formData.get("notes") || ""),
    paymentMethod: String(formData.get("paymentMethod") || "COD"),
    items: JSON.parse(itemsRaw),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      errors[key] = issue.message;
    }
    return { errors };
  }

  const data = parsed.data;

  const store = await prisma.store.findUnique({
    where: { slug: data.storeSlug },
  });
  if (!store || store.status === "CLOSED") {
    return { message: "المتجر غير متوفر حالياً" };
  }

  // التحقق من المنتجات والأسعار من قاعدة البيانات (عدم الثقة بالعميل)
  const productIds = data.items.map((i) => i.productId);
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId: store.id, status: "ACTIVE" },
  });

  if (dbProducts.length !== data.items.length) {
    return { message: "بعض المنتجات لم تعد متوفرة. حدّث السلة وحاول مجدداً." };
  }

  let subtotal = 0;
  const orderItemsData: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
  }[] = [];
  for (const item of data.items) {
    const product = dbProducts.find((p) => p.id === item.productId)!;
    if (product.stock < item.quantity) {
      return {
        message: `الكمية المطلوبة من "${product.name}" غير متوفرة (المتاح: ${product.stock})`,
      };
    }
    const price = Number(product.price);
    subtotal += price * item.quantity;
    orderItemsData.push({
      productId: product.id,
      name: product.name,
      price,
      quantity: item.quantity,
      image: firstImage(product.images),
    });
  }

  // أجور شحن ثابتة مبدئياً (تُحسب لاحقاً حسب المدينة)
  const shipping = 0;
  const total = subtotal + shipping;

  // رقم طلب متسلسل
  const lastOrder = await prisma.order.findFirst({
    where: { storeId: store.id },
    orderBy: { number: "desc" },
  });
  const nextNum = (lastOrder ? parseInt(lastOrder.number.split("-")[1] || "0", 10) : 0) + 1;
  const orderNumber = `GH-${String(nextNum).padStart(4, "0")}`;

  // إنشاء أو تحديث العميل
  const customer = await prisma.customer.upsert({
    where: { storeId_phone: { storeId: store.id, phone: data.customerPhone } },
    update: { name: data.customerName },
    create: {
      storeId: store.id,
      name: data.customerName,
      phone: data.customerPhone,
    },
  });

  // إنشاء الطلب + الدفع + تحديث المخزون في معاملة واحدة
  // لمنع فساد البيانات عند فشل أي خطوة
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        storeId: store.id,
        number: orderNumber,
        customerId: customer.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        status: "PENDING",
        paymentStatus: data.paymentMethod === "COD" ? "COD" : "UNPAID",
        paymentMethod: data.paymentMethod,
        subtotal,
        shipping,
        discount: 0,
        total,
        notes: data.notes || null,
        shippingAddress: {
          fullName: data.customerName,
          phone: data.customerPhone,
          city: data.city,
          district: data.district || null,
          street: data.street || null,
          details: data.details || null,
        },
        items: { create: orderItemsData },
      },
    });

    await tx.payment.create({
      data: {
        orderId: created.id,
        storeId: store.id,
        gateway: data.paymentMethod === "COD" ? "cod" : "card",
        amount: total,
        status: data.paymentMethod === "COD" ? "COD" : "UNPAID",
      },
    });

    // إنقاص المخزون وعدّ المبيعات
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          salesCount: { increment: item.quantity },
        },
      });
    }

    return created;
  });

  revalidatePath("/dashboard");
  revalidatePath(`/preview/${data.storeSlug}`);

  return {
    ok: true,
    orderNumber,
    message:
      data.paymentMethod === "COD"
        ? "تم استلام طلبك! سنتواصل معك لتأكيد التوصيل والدفع عند الاستلام."
        : "تم إنشاء طلبك. سيتم تحويلك لبوابة الدفع.",
  };
}
