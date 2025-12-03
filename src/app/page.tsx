/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
// Note: Navbar sudah ada di layout.tsx

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    stock: 0,
    transactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Komponen Kecil untuk Kartu Statistik (Biar kodenya rapi)
  const StatCard = ({ title, value, icon, color }: any) => (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="d-flex align-items-center p-4">
        <div 
          className={`d-flex align-items-center justify-content-center rounded-circle me-3`}
          style={{ width: '60px', height: '60px', backgroundColor: `${color}20` }} // Opacity 20%
        >
          <span style={{ fontSize: '24px' }}>{icon}</span>
        </div>
        <div>
          <p className="text-muted mb-1 small text-uppercase fw-bold">{title}</p>
          <h3 className="mb-0 fw-bold text-dark">{loading ? "-" : value}</h3>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#f3f4f6" }}> 
      <Container>
        {/* Header Section */}
        <div className="mb-5">
          <h2 className="fw-bold text-dark">Dashboard</h2>
          <p className="text-muted">Selamat datang di Panel Admin POS System.</p>
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

        {/* --- BAGIAN 2: DETAIL (AKAN DIKERJAKAN BESOK) --- */}
        <Row>
          <Col md={12}>
            <div className="p-5 text-center text-muted border border-dashed rounded-3" style={{ backgroundColor: "#fff" }}>
              🚧 Bagian Tabel & Detail akan ditambahkan pada update berikutnya.
            </div>
          </Col>
        </Row>

      </Container>
    </div>
  );
}