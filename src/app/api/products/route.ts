import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//Mengambil semua produk pada database
export async function GET() {
  try {
    const listProduk = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
    return NextResponse.json(listProduk);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// Menyimpan produk baru ke database
export async function POST(req: Request) {
  try {
    const dataInput = await req.json();

    // Validasi input
    if (!dataInput.name || !dataInput.sku || !dataInput.price) {
      return NextResponse.json(
        { error: "Nama, SKU, dan Harga wajib diisi" },
        { status: 400 }
      );
    }

    //Pengecekan SKU agar produk unik
    const cekSku = await prisma.product.findUnique({
      where: { sku: dataInput.sku },
    });

    if (cekSku) {
      return NextResponse.json(
        { error: "SKU sudah digunakan produk lain" },
        { status: 400 }
      );
    }

    // Hitung harga ke format cents dulu
    const hargaDalamSen = parseInt(dataInput.price) * 100;

    // Simpan produk(dengan konversi harga)
    const produkBaru = await prisma.product.create({
      data: {
        name: dataInput.name,
        sku: dataInput.sku,
        priceCents: hargaDalamSen, // Dikali 100
        stock: parseInt(dataInput.stock) || 0,
        image: dataInput.image || null,
        categoryId: dataInput.categoryId ? parseInt(dataInput.categoryId) : null,
      },
    });

    return NextResponse.json(produkBaru, { status: 201 });
  } catch (err) {
    console.error("Error creating product:", err);
    return NextResponse.json({ error: "Gagal menyimpan produk" }, { status: 500 });
  }
}

// Menghapus produk pada database
export async function DELETE(req: Request) {
  const urlParams = new URL(req.url);
  const idProduk = urlParams.searchParams.get("id");

  if (!idProduk) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.product.delete({
      where: { id: parseInt(idProduk) },
    });
    return NextResponse.json({ message: "Product deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}

// Mengupdate data produk pada database
export async function PUT(req: Request) {
  try {
    const dataEdit = await req.json();

    // Validasi ID untuk tahu produk mana yang diedit
    if (!dataEdit.id) {
      return NextResponse.json({ error: "ID Produk wajib dikirim" }, { status: 400 });
    }

    // Cek duplikasi SKU
    if (dataEdit.sku) {
      const skuKembar = await prisma.product.findFirst({
        where: {
          sku: dataEdit.sku,
          NOT: {
            id: dataEdit.id // Kecualikan produk ini sendiri
          }
        }
      });
      
      if (skuKembar) {
        return NextResponse.json({ error: "SKU sudah digunakan produk lain" }, { status: 400 });
      }
    }

    // Data update
    // Undefined jika field tidak dikirim, agar Prisma tidak update null
    const dataYangMauDiupdate = {
        name: dataEdit.name,
        sku: dataEdit.sku,
        priceCents: dataEdit.price ? parseInt(dataEdit.price) * 100 : undefined,
        stock: dataEdit.stock !== undefined ? parseInt(dataEdit.stock) : undefined,
        image: dataEdit.image || null,
        categoryId: dataEdit.categoryId ? parseInt(dataEdit.categoryId) : undefined,
    };

    const hasilUpdate = await prisma.product.update({
      where: { id: dataEdit.id },
      data: dataYangMauDiupdate,
    });

    return NextResponse.json(hasilUpdate);
  } catch (err) {
    console.error("Error updating product:", err);
    return NextResponse.json({ error: "Gagal mengupdate produk" }, { status: 500 });
  }
}