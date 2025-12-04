import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

type IncomingItem = {
  id: number;
  quantity: number;
  priceCents: number;
  subtotalCents?: number;
};

export async function GET() {
  try {
    // require authentication for reading transactions
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, cashier: true },
    });
    return NextResponse.json(transactions);
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    return NextResponse.json({ error: "Gagal mengambil transaksi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const incoming: IncomingItem[] = rawItems.map((it: unknown) => {
      const obj = it as Record<string, unknown>;
      const id = typeof obj.id === "string" ? parseInt(obj.id, 10) : (obj.id as number);
      const quantity = typeof obj.quantity === "string" ? parseInt(obj.quantity as string, 10) : (obj.quantity as number);
      const priceCents = typeof obj.priceCents === "string" ? parseInt(obj.priceCents as string, 10) : (obj.priceCents as number);
      return { id, quantity, priceCents } as IncomingItem;
    });

    const ids: number[] = Array.from(new Set(incoming.map((i: IncomingItem) => i.id)));
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    const productMap = new Map<number, typeof products[0]>();
    for (const p of products) productMap.set(p.id, p);

    for (const it of incoming) {
      const p = productMap.get(it.id);
      if (!p) {
        return NextResponse.json({ error: `Product not found (id=${it.id})` }, { status: 400 });
      }
      if (typeof it.priceCents === "number" && it.priceCents !== p.priceCents) {
        return NextResponse.json({ error: `Price mismatch for product id=${it.id}` }, { status: 400 });
      }
    }

    const totalCents = incoming.reduce((s: number, it: IncomingItem) => {
      const p = productMap.get(it.id)!;
      return s + p.priceCents * it.quantity;
    }, 0);

    // require authenticated user (cashier) to create transactions
    let session;
    try {
      session = await auth();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const cashierId = parseInt(session.user.id as string, 10);

    const created = await prisma.transaction.create({
      data: {
        totalCents,
        cashierId: cashierId ?? undefined,
        items: {
          create: incoming.map((it: IncomingItem) => {
            const p = productMap.get(it.id)!;
            return {
              quantity: it.quantity,
              name: p.name,
              priceCents: p.priceCents,
              subtotalCents: p.priceCents * it.quantity,
            };
          }),
        },
      },
      include: { items: true, cashier: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    return NextResponse.json({ error: "Gagal membuat transaksi" }, { status: 500 });
  }
}
