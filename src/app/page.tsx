/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useTransition } from "react";
import { Container, Row, Col, Card, Spinner, Table, ProgressBar, Button } from "react-bootstrap";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

type Product = {
  id: number;
  name: string;
  sku: string;
  stock: number;
  priceCents: number;
  image: string | null;
  category?: { name: string };
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    stock: 0,
    transactions: 0
  });
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    startTransition(() => {
      signOut({ callbackUrl: "/login" });
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();

      if (res.ok) {
        setStats(data.summary);
        setLowStock(data.lowStock);
        setRecentProducts(data.recentProducts);
      }
    } catch (err) {
      console.error("Gagal ambil data dashboard", err);
    } finally {
      setLoading(false);
    }
  }

  // Format Rupiah
  const toRupiah = (cents: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(cents / 100);
  };

  // Komponen Kecil untuk Kartu Statistik (Biar kodenya rapi)
  const StatCard = ({ title, value, icon, colorBg, colorText }: any) => (
    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
      <Card.Body className="d-flex align-items-center p-4">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle me-3"
          style={{ width: '64px', height: '64px', backgroundColor: colorBg, color: colorText, fontSize: '28px' }}
        >
          {icon}
        </div>
        <div>
          <p className="text-muted mb-1 small text-uppercase fw-bold" style={{ letterSpacing: "0.5px" }}>{title}</p>
          <h3 className="mb-0 fw-bold text-dark">
            {loading ? <Spinner animation="border" size="sm" /> : value}
          </h3>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#f3f4f6" }}>
      <Container>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold text-dark mb-1">Dashboard</h2>
            <p className="text-muted mb-0">
              {session?.user ? (
                <>Selamat datang, <strong>{session.user.name ?? session.user.email}</strong>!</>
              ) : (
                "Selamat datang di Panel Admin POS System."
              )}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            {status === "loading" ? (
              <Spinner animation="border" size="sm" />
            ) : (
              !session?.user && (
                <>
                  <Link href="/login" className="btn btn-outline-primary btn-sm">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-primary btn-sm">
                    Register
                  </Link>
                </>
              )
            )}
          </div>
        </div>



        {/* --- BAGIAN 1: KARTU RINGKASAN (Target Hari Ini) --- */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row className="g-4 mb-5">
            {/* Kartu 1: Total Produk */}
            <Col md={6} xl={3}>
              <StatCard
                title="Total Produk"
                value={stats.products}
                icon="📦"
                color="#3b82f6" // Biru
              />
            </Col>

            {/* Kartu 2: Total Kategori */}
            <Col md={6} xl={3}>
              <StatCard
                title="Total Kategori"
                value={stats.categories}
                icon="🏷️"
                color="#8b5cf6" // Ungu
              />
            </Col>

            {/* Kartu 3: Total Stok */}
            <Col md={6} xl={3}>
              <StatCard
                title="Stok Fisik"
                value={stats.stock}
                icon="📊"
                color="#10b981" // Hijau
              />
            </Col>

            {/* Kartu 4: Transaksi */}
            <Col md={6} xl={3}>
              <StatCard
                title="Transaksi Hari Ini"
                value={stats.transactions}
                icon="💰"
                color="#f59e0b" // Kuning
              />
            </Col>
          </Row>
        )}

        {/* --- BAGIAN 2: DETAIL --- */}
        <Row className="g-4">

          {/* KOLOM KIRI: TABEL PERINGATAN STOK MENIPIS */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0 text-dark">⚠️ Peringatan Stok Menipis</h6>
                <Link href="/products" className="text-decoration-none small text-primary fw-bold">Kelola Stok &rarr;</Link>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 text-muted small border-0">Produk</th>
                      <th className="text-muted small border-0">SKU</th>
                      <th className="text-muted small border-0">Status Stok</th>
                      <th className="text-end pe-4 text-muted small border-0">Sisa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-4"><Spinner animation="border" size="sm" /></td></tr>
                    ) : lowStock.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">Aman! Tidak ada stok yang menipis (di bawah 10).</td></tr>
                    ) : (
                      lowStock.map(item => (
                        <tr key={item.id}>
                          <td className="ps-4 fw-bold text-dark">
                            <div className="d-flex align-items-center">
                              <div style={{ width: '32px', height: '32px', background: '#eee', borderRadius: '4px', overflow: 'hidden', marginRight: '10px' }}>
                                {item.image ? (
                                  <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <span className="d-flex align-items-center justify-content-center h-100 small text-muted">Img</span>
                                )}
                              </div>
                              {item.name}
                            </div>
                          </td>
                          <td className="text-muted small font-monospace">{item.sku}</td>
                          <td style={{ minWidth: '150px' }}>
                            {/* Progress Bar Visual */}
                            <ProgressBar
                              now={(item.stock / 10) * 100}
                              variant={item.stock === 0 ? "danger" : "warning"}
                              style={{ height: "6px", borderRadius: "10px" }}
                            />
                            <div className="d-flex justify-content-between mt-1">
                              <small className={item.stock === 0 ? "text-danger fw-bold" : "text-warning fw-bold"} style={{ fontSize: "10px" }}>
                                {item.stock === 0 ? "HABIS" : "KRITIS"}
                              </small>
                            </div>
                          </td>
                          <td className="text-end pe-4 fw-bold text-dark">{item.stock}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* KOLOM KANAN: LIST PRODUK TERBARU */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 py-3">
                <h6 className="fw-bold mb-0 text-dark">🆕 Baru Ditambahkan</h6>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" size="sm" /></div>
                ) : recentProducts.length === 0 ? (
                  <p className="text-muted text-center py-3">Belum ada data.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {recentProducts.map(item => (
                      <li key={item.id} className="list-group-item border-0 px-0 d-flex align-items-center mb-3">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: "48px", height: "48px",
                            backgroundColor: "#f1f5f9",
                            overflow: "hidden"
                          }}
                        >
                          {item.image ? (
                            <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span className="text-muted" style={{ fontSize: "20px" }}>📦</span>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: "14px" }}>{item.name}</h6>
                          <small className="text-muted d-block" style={{ fontSize: "12px" }}>
                            {item.category ? item.category.name : "Tanpa Kategori"}
                          </small>
                        </div>
                        <div className="text-end">
                          <span className="d-block fw-bold text-primary" style={{ fontSize: "13px" }}>
                            {toRupiah(item.priceCents)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="d-grid mt-3">
                  <Link href="/products" className="btn btn-light btn-sm fw-bold text-dark">
                    Lihat Semua Produk
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
