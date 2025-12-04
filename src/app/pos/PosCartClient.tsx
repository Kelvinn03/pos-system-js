"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import type { Product, CartItem } from "@/types";

export default function PosCartClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (showAddModal && products.length === 0) {
      fetchProducts();
    }
  }, [showAddModal, products]);

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(term) || (p.sku || "").toLowerCase().includes(term)
    );
  }, [products, search]);

  function addProduct(p: Product) {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === p.id);
      if (exists) {
        return prev.map((c) => (c.id === p.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { id: p.id, name: p.name, priceCents: p.priceCents, quantity: 1 }];
    });
    setShowAddModal(false);
    setSearch("");
  }

  function closeModal() {
    setShowAddModal(false);
    setSearch("");
  }

  const subtotalCents = cart.reduce((s, it) => s + it.priceCents * it.quantity, 0);
  const taxCents = Math.round(subtotalCents * 0.11);
  const grandTotalCents = subtotalCents + taxCents;

  const formatCents = (cents: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(cents / 100);

  const router = useRouter();

  function proceedToPayment() {
    if (cart.length === 0) return;
    localStorage.setItem("pos_cart", JSON.stringify(cart));
    router.push("/pos/payment");
  }

  return (
    <>
      <div className="row gx-4">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Cart Items</h5>
                <div>
                  <Button variant="outline-danger" size="sm" className="me-2" onClick={() => setShowConfirmReset(true)}>
                    Reset
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                    + Add Item
                  </Button>
                </div>
              </div>
              <div className="table-responsive" style={{ maxHeight: 320, overflowY: "auto" }}>
                <table className="table table-striped mb-0" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: '50%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '5%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Total</th>
                      <th className="text-end"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          Cart is empty. Add items to begin the sale.
                        </td>
                      </tr>
                    ) : (
                      cart.map((it) => (
                        <tr key={it.id}>
                          <td>{it.name}</td>
                          <td className="text-end">{formatCents(it.priceCents)}</td>
                          <td className="text-end" style={{ width: 110 }}>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={it.quantity}
                              min={1}
                              onChange={(e) => {
                                const v = parseInt(e.target.value || "0", 10);
                                setCart((prev) => prev.map((c) => (c.id === it.id ? { ...c, quantity: isNaN(v) ? 1 : Math.max(1, v) } : c)));
                              }}
                              className="text-end"
                            />
                          </td>
                          <td className="text-end">{formatCents(it.priceCents * it.quantity)}</td>
                          <td className="text-end">
                            <Button variant="outline-danger" size="sm" onClick={() => {
                              setCart((prev) => prev.filter((c) => c.id !== it.id));
                            }}>
                              x
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Transaction Summary</h5>
              <div className="d-flex justify-content-between">
                <div>Subtotal</div>
                <div>{formatCents(subtotalCents)}</div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <div>Tax (11%)</div>
                <div>{formatCents(taxCents)}</div>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <div>Grand Total</div>
                <div>{formatCents(grandTotalCents)}</div>
              </div>
              <Button variant="success" className="w-100 mt-3" onClick={proceedToPayment} disabled={cart.length === 0}>
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showAddModal} onHide={closeModal} centered>
        <Modal.Header>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text className="bg-white">🔍</InputGroup.Text>
            <Form.Control
              placeholder="Search product by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {loadingProducts ? (
              <div className="text-center text-muted py-3">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted py-3">No products found.</div>
            ) : (
              <table className="table table-sm mb-0" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: '65%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="fw-bold">{p.name}</div>
                        <div className="text-muted small font-monospace">SKU: {p.sku}</div>
                      </td>
                      <td className="text-end">{formatCents(p.priceCents)}</td>
                      <td className="text-end">
                        <Button size="sm" variant="success" onClick={() => addProduct(p)}>
                          Add
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmReset} onHide={() => setShowConfirmReset(false)} centered>
        <Modal.Header>
          <Modal.Title>Clear Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove all items from the cart? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmReset(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => { setCart([]); setShowConfirmReset(false); }}>
            Clear Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
