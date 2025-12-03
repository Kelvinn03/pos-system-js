import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [totalProducts, totalCategories, stockStats, totalTransactions] = await Promise.all([
      // 1. Hitung Total Produk
      prisma.product.count(),
      
      // 2. Hitung Total Kategori
      prisma.category.count(),
      
      // 3. Hitung Total Stok Fisik
      prisma.product.aggregate({
        _sum: { stock: true }
      }),

      // 4. Hitung Total Transaksi (Sementara tabel transaction masih kosong/belum ada di fitur ini)
      prisma.transaction.count()
    ]);

    return NextResponse.json({
      products: totalProducts,
      categories: totalCategories,
      stock: stockStats._sum.stock || 0,
      transactions: totalTransactions
    });

  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data dashboard" }, { status: 500 });
  }
}