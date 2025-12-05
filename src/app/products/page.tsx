/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Container, Table, Button, Modal, Form, Spinner, Alert, Row, Col, Badge, InputGroup } from "react-bootstrap";
import type { Category, Product } from "@/types";

const initialFormState = {
  name: "",
  sku: "",
  price: "",
  stock: "",
  image: "",
  categoryId: "",
};

export default function ProductsPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortOption, setSortOption] = useState("newest"); // Default: Terbaru

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ]);
      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      setProducts(dataProd);
      setCategories(dataCat);
    } catch (err) {
      console.error("Gagal ambil data", err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerTerm) || 
        p.sku.toLowerCase().includes(lowerTerm)
      );
    }

    if (filterCategory) {
      result = result.filter(p => p.categoryId === parseInt(filterCategory));
    }

    switch (sortOption) {
      case "price_asc": // Termurah
        result.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price_desc": // Termahal
        result.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "name_asc": // Nama A-Z
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc": // Nama Z-A
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest": // Default (ID terbesar biasanya terbaru)
      default:
        result.sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [products, searchTerm, filterCategory, sortOption]);

  // --- HANDLERS ---
  const bukaModal = (product?: Product) => {
    setErrorMsg("");
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        price: (product.priceCents / 100).toString(),
        stock: product.stock.toString(),
        image: product.image || "",
        categoryId: product.categoryId ? product.categoryId.toString() : "",
      });
    } else {
      setEditingProduct(null);
      setFormData(initialFormState);
    }
    setShowModal(true);
  };

  const tutupModal = () => {
    setShowModal(false);
    setFormData(initialFormState);
    setEditingProduct(null);
  };

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSimpan() {
    setErrorMsg("");
    const isEditMode = !!editingProduct;
    const method = isEditMode ? "PUT" : "POST";
    const payload = isEditMode ? { ...formData, id: editingProduct.id } : formData;

    try {
      const res = await fetch("/api/products", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorMsg(errorData.error);
        return;
      }
      tutupModal();
      refreshProducts();
      alert(`Produk berhasil ${isEditMode ? "diupdate" : "ditambahkan"}!`);
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    }
  }

  async function handleHapus(product: Product) {
    if (!confirm(`Hapus produk "${product.name}"?`)) return;
    await fetch(`/api/products?id=${product.id}`, { method: "DELETE" });
    refreshProducts();
  }

  const toRupiah = (cents: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(cents / 100);
  };

  // --- RENDER ---
  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Katalog Produk</h2>
            <p className="text-muted">Kelola inventory, harga, dan kategori menu.</p>
          </div>
          <Button variant="primary" onClick={() => bukaModal()}>
            + Tambah Produk
          </Button>
        </div>

        {/* --- TOOLBAR: SEARCH & FILTER --- */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <Row className="g-3">
              {/* Search Box */}
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    🔍
                  </InputGroup.Text>
                  <Form.Control 
                    type="text" 
                    placeholder="Cari nama produk / SKU..." 
                    className="border-start-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>

              {/* Filter Kategori */}
              <Col md={4}>
                <Form.Select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Form.Select>
              </Col>

              {/* Sorting */}
              <Col md={4}>
                <Form.Select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="newest">Urutkan: Terbaru</option>
                  <option value="price_asc">Harga: Termurah</option>
                  <option value="price_desc">Harga: Termahal</option>
                  <option value="name_asc">Nama: A - Z</option>
                  <option value="name_desc">Nama: Z - A</option>
                </Form.Select>
              </Col>
            </Row>
          </div>
        </div>

        {/* --- TABEL DATA --- */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Memuat data...</p>
              </div>
            ) : (
              <Table responsive hover striped className="mb-0 align-middle">
                <thead className="table-dark">
                  <tr>
                    <th className="py-3 ps-4" style={{ width: "80px" }}>Foto</th>
                    <th className="py-3">Info Produk</th>
                    <th className="py-3">Kategori</th>
                    <th className="py-3">Harga</th>
                    <th className="py-3">Stok</th>
                    <th className="py-3 text-end pe-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">
                      {searchTerm || filterCategory ? "Produk tidak ditemukan." : "Belum ada data produk."}
                    </td></tr>
                  ) : (
                    filteredProducts.map((item) => (
                      <tr key={item.id}>
                        <td className="ps-4">
                          <div style={{ 
                            width: "50px", height: "50px", 
                            backgroundColor: "#eee", borderRadius: "8px", 
                            overflow: "hidden" 
                          }}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span className="d-flex h-100 align-items-center justify-content-center text-muted small">Img</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold">{item.name}</div>
                          <div className="text-muted small font-monospace">SKU: {item.sku}</div>
                        </td>
                        <td>
                          {item.category ? (
                            <Badge bg="info" className="text-dark">{item.category.name}</Badge>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                        <td className="text-success fw-bold">{toRupiah(item.priceCents)}</td>
                        <td>
                          {item.stock > 0 
                            ? <Badge bg="success" className="bg-opacity-10 text-success fw-normal border border-success">
                                {item.stock} Unit
                              </Badge>
                            : <Badge bg="danger">Habis</Badge>
                          }
                        </td>
                        <td className="text-end pe-4">
                          <Button 
                            variant="outline-primary" size="sm" className="me-2"
                            onClick={() => bukaModal(item)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" size="sm"
                            onClick={() => handleHapus(item)}
                          >
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      </Container>

      {/* --- MODAL FORM --- */}
      <Modal show={showModal} onHide={tutupModal} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMsg && <Alert variant="danger" className="py-2">{errorMsg}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Kode SKU</Form.Label>
              <Form.Control type="text" name="sku" placeholder="K-001" value={formData.sku} onChange={handleInput} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nama Produk</Form.Label>
              <Form.Control type="text" name="name" placeholder="Nasi Goreng" value={formData.name} onChange={handleInput} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select name="categoryId" value={formData.categoryId} onChange={handleInput}>
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>URL Gambar</Form.Label>
              <Form.Control type="text" name="image" placeholder="https://..." value={formData.image} onChange={handleInput} />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Harga (Rp)</Form.Label>
                  <Form.Control type="number" name="price" placeholder="15000" value={formData.price} onChange={handleInput} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Stok</Form.Label>
                  <Form.Control type="number" name="stock" placeholder="100" value={formData.stock} onChange={handleInput} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={tutupModal}>Batal</Button>
          <Button variant="primary" onClick={handleSimpan}>
            {editingProduct ? "Simpan Perubahan" : "Simpan Produk"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}