"use client";

import React, { useEffect, useMemo, useState } from "react";


type TransactionItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
};

type Transaction = {
  id: string;
  date: string;
  items: TransactionItem[];
  total: number;
  status?: string;
  paymentMethod?: string;
  customerName?: string;
};

type Refund = {
  id: string;
  originalTransactionId: string;
  date: string;
  items: Array<{ id: string; name: string; quantity: number; refundAmount: number; reason: string }>;
  total: number;
  status: string;
  processedBy?: string;
  customerName?: string;
};

export default function RefundPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [checkedMap, setCheckedMap] = useState<Record<string, { checked: boolean; reason: string }>>({});
  const [recentRefunds, setRecentRefunds] = useState<Refund[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const tx = JSON.parse(localStorage.getItem("posTransactions") || "[]");
    setTransactions(Array.isArray(tx) ? tx : []);
    const rf = JSON.parse(localStorage.getItem("posRefunds") || "[]");
    setRecentRefunds(Array.isArray(rf) ? rf : []);
  }, []);

  useEffect(() => {
    if (!searchTerm) return setResults([]);
    const term = searchTerm.toLowerCase();
    const res = transactions.filter((t) => {
      if (!t) return false;
      if (String(t.id).toLowerCase().includes(term)) return true;
      if (t.customerName && t.customerName.toLowerCase().includes(term)) return true;
      return false;
    });
    setResults(res);
  }, [searchTerm, transactions]);

  const refundTotal = useMemo(() => {
    let total = 0;
    if (!selected) return 0;
    for (const item of selected.items) {
      const key = item.id;
      if (checkedMap[key]?.checked) {
        // refund the currently selected quantity for the item (default: full quantity)
        const qty = item.quantity || 0;
        total += (item.price || 0) * qty;
      }
    }
    return total;
  }, [checkedMap, selected]);

  function searchTransaction() {
    // run same filter as the search effect so the button triggers an immediate search
    if (!searchTerm) {
      setResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const res = transactions.filter((t) => {
      if (!t) return false;
      if (String(t.id).toLowerCase().includes(term)) return true;
      if (t.customerName && t.customerName.toLowerCase().includes(term)) return true;
      return false;
    });
    setResults(res);
  }

  function selectTransaction(id: string) {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    setSelected(tx);
    const map: Record<string, { checked: boolean; reason: string }> = {};
    tx.items.forEach((it) => (map[it.id] = { checked: false, reason: "customer-request" }));
    setCheckedMap(map);
    setTimeout(() => {
      const el = document.getElementById("refundItems");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  function toggleItem(id: string) {
    setCheckedMap((m) => ({ ...m, [id]: { checked: !m[id]?.checked, reason: m[id]?.reason || "customer-request" } }));
  }

  function setReason(id: string, reason: string) {
    setCheckedMap((m) => ({ ...m, [id]: { checked: m[id]?.checked ?? false, reason } }));
  }

  function openConfirm() {
    const any = Object.values(checkedMap).some((v) => v.checked);
    if (!any) return alert("Pilih minimal satu item untuk refund");
    setShowConfirm(true);
  }

  async function processRefund() {
    if (!selected) return;
    setProcessing(true);
    const refundItems = selected.items
      .filter((it) => checkedMap[it.id]?.checked)
      .map((it) => ({ id: it.id, name: it.name, quantity: it.quantity, refundAmount: (it.price || 0) * (it.quantity || 0), reason: checkedMap[it.id].reason }));

    const refund: Refund = {
      id: `R-${Date.now()}`,
      originalTransactionId: selected.id,
      date: new Date().toISOString(),
      items: refundItems,
      total: refundItems.reduce((s, r) => s + r.refundAmount, 0),
      status: "completed",
      processedBy: localStorage.getItem("posSessionUser") || "Unknown",
      customerName: selected.customerName || "Walk-in",
    };

    await new Promise((r) => setTimeout(r, 700));
    const rf = JSON.parse(localStorage.getItem("posRefunds") || "[]");
    rf.push(refund);
    localStorage.setItem("posRefunds", JSON.stringify(rf));
    setRecentRefunds(rf);

    // restore stock for refunded items
    const products: Array<{ id?: string | number; name?: string; stock?: number }> = JSON.parse(
      localStorage.getItem("posProducts") || "[]"
    );
    if (Array.isArray(products)) {
      refundItems.forEach((ri) => {
        const p = products.find((pp) => pp.name === ri.name || String(pp.id) === ri.id);
        if (p) p.stock = (p.stock || 0) + (ri.quantity || 0);
      });
      localStorage.setItem("posProducts", JSON.stringify(products));
    }

    // update the original transaction: reduce quantities or mark refunded
    try {
      const txs: Transaction[] = JSON.parse(localStorage.getItem("posTransactions") || "[]");
      const index = txs.findIndex((t) => t.id === selected.id);
      if (index !== -1) {
        const tx = txs[index];
        refundItems.forEach((ri) => {
          const itm = tx.items.find((x: TransactionItem) => String(x.id) === String(ri.id) || x.name === ri.name);
          if (itm) {
            itm.quantity = (itm.quantity || 0) - (ri.quantity || 0);
            if (itm.quantity <= 0) {
              // remove item
              tx.items = tx.items.filter((x: TransactionItem) => !(String(x.id) === String(ri.id) || x.name === ri.name));
            }
          }
        });
        // recalc total
        tx.total = (tx.items || []).reduce((s: number, x: TransactionItem) => s + ((x.price || 0) * (x.quantity || 0)), 0);
        tx.status = (tx.items && tx.items.length > 0) ? "partially_refunded" : "refunded";
        txs[index] = tx;
        localStorage.setItem("posTransactions", JSON.stringify(txs));
      }
    } catch (e) {
      // if anything goes wrong, keep going but log to console for debugging
      console.error("Failed to update original transaction during refund:", e);
    }

    setProcessing(false);
    setShowConfirm(false);
    alert("Refund berhasil diproses");
    setSelected(null);
    setCheckedMap({});
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="h3">Refund</h1>
          <p className="text-muted mb-0">Pengembalian dan pembatalan transaksi</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div id="refundResults">
            {results.length === 0 ? (
              <div className="card">
                <div className="card-body text-center text-muted">Tidak ada hasil. Silakan cari ID transaksi atau nama pelanggan.</div>
              </div>
            ) : (
              <>
                <h5 className="mb-3">Hasil Pencarian ({results.length} transaksi)</h5>
                <div className="row g-3">
                  {results.map((t) => (
                    <div key={t.id} className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">{t.id}</h6>
                            <span className="badge bg-secondary">{t.status || ""}</span>
                          </div>
                          <p className="mb-1 text-muted small">{new Date(t.date).toLocaleString()}</p>
                          <p className="mb-1">{t.items.length} item(s)</p>
                          <p className="mb-3">Rp {t.total}</p>
                          <div className="mt-auto">
                            <button className="btn btn-outline-primary w-100" onClick={() => selectTransaction(t.id)}>Pilih Transaksi</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {selected && (
            <div id="refundItems" className="mt-4">
              <div className="card">
                <div className="card-body">
                  <div className="mb-3 p-2 rounded" style={{ background: "#f8fafc", borderLeft: "4px solid #667eea" }}>
                    <h6 className="mb-1">Transaksi: {selected.id}</h6>
                    <div className="small text-muted">Tanggal: {new Date(selected.date).toLocaleString()}</div>
                    <div className="small text-muted">Total Asli: Rp {selected.total}</div>
                  </div>

                  <div className="row g-3">
                    {selected.items.map((it) => (
                      <div key={it.id} className="col-12">
                        <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                          <div>
                            <div className="fw-semibold">{it.name}</div>
                            <div className="small text-muted">Rp {it.price} x {it.quantity} = Rp {it.price * it.quantity}</div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" id={`chk-${it.id}`} checked={checkedMap[it.id]?.checked || false} onChange={() => toggleItem(it.id)} />
                            </div>
                            <select className="form-select form-select-sm" value={checkedMap[it.id]?.reason || "customer-request"} onChange={(e) => setReason(it.id, e.target.value)} style={{ minWidth: 160 }}>
                              <option value="customer-request">Permintaan Pelanggan</option>
                              <option value="damaged">Barang Rusak</option>
                              <option value="defective">Barang Cacat</option>
                              <option value="wrong-item">Barang Salah</option>
                              <option value="expired">Barang Kedaluwarsa</option>
                              <option value="other">Lainnya</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div><strong>Total Refund:</strong> Rp {refundTotal}</div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-danger" disabled={Object.values(checkedMap).every((v) => !v.checked)} onClick={openConfirm}>Proses Refund</button>
                      <button className="btn btn-outline-secondary" onClick={() => { setSelected(null); setCheckedMap({}); }}>Batal</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="col-lg-4">
          <div className="card mb-3">
            <div className="card-body">
              <h6>Cari Transaksi</h6>
              <div className="d-flex gap-2">
                <input className="form-control" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Masukkan ID transaksi atau nama pelanggan..." />
                <button className="btn btn-primary" onClick={searchTransaction}>Cari</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h6>Refund Terbaru</h6>
              <div className="list-group list-group-flush mt-2">
                {recentRefunds.length === 0 ? <div className="text-muted">Tidak ada refund</div> : (
                  recentRefunds.slice().reverse().slice(0, 6).map((r) => (
                    <div key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>{r.id}</div>
                      <div className="text-danger">Rp {r.total}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showConfirm && selected && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Konfirmasi Refund</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p><strong>ID:</strong> {selected.id}</p>
                <p><strong>Customer:</strong> {selected.customerName || "Walk-in"}</p>
                <p><strong>Total Refund:</strong> Rp {refundTotal}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={processRefund} disabled={processing}>{processing ? "Memproses..." : "Konfirmasi Refund"}</button>
                <button className="btn btn-outline-secondary" onClick={() => setShowConfirm(false)} disabled={processing}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
