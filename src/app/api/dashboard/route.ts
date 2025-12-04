import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      totalProduk, 
      totalKategori, 
      statistikStok, 
      totalTransaksi,
      stokMenipis,
      produkTerbaru
    ] = await Promise.all([
      // 1. Hitung Total Produk
      prisma.product.count(),
      
      // 2. Hitung Total Kategori
      prisma.category.count(),
      
      // 3. Hitung Total Stok Fisik
      prisma.product.aggregate({
        _sum: { stock: true }
      }),

      // 4. Hitung Total Transaksi (Sementara tabel transaction masih kosong/belum ada di fitur ini)
      prisma.transaction.count(),

      prisma.product.findMany({
        where: { stock: { lte: 10 } }, 
        orderBy: { stock: 'asc' }, // Urutkan dari yang paling sedikit
        take: 5, // Ambil 5 saja
        include: { category: true }
      }),

      prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { category: true }
      })
    ]);

    return NextResponse.json({
      summary: {
        products: totalProduk,
        categories: totalKategori,
        stock: statistikStok._sum.stock || 0,
        transactions: totalTransaksi
      },
      lowStock: stokMenipis,
      recentProducts: produkTerbaru
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Gagal memuat data dashboard" }, { status: 500 });
  }
}