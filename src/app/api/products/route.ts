import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: products,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, sku, priceCents, stock, categoryId } = body;

  if (!name || !sku) {
    return NextResponse.json(
      { error: "Name and SKU are required" },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      sku,
      priceCents,
      stock,
      categoryId,
    },
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
