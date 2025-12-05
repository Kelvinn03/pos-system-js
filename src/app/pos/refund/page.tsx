"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

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
        total += (checkedMap[key]?.reason ? item.price * item.quantity : item.price * item.quantity) || 0;
      }
    }
    return total;
  }, [checkedMap, selected]);

  function searchTransaction() {
    if (!searchTerm) setResults([]);
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
      .map((it) => ({ id: it.id, name: it.name, quantity: it.quantity, refundAmount: it.price * it.quantity, reason: checkedMap[it.id].reason }));

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

    const products = JSON.parse(localStorage.getItem("posProducts") || "[]");
    if (Array.isArray(products)) {
      refundItems.forEach((ri) => {
        const p = products.find((pp: any) => pp.name === ri.name || String(pp.id) === ri.id);
        if (p) p.stock = (p.stock || 0) + ri.quantity;
      });
      localStorage.setItem("posProducts", JSON.stringify(products));
    }

    setProcessing(false);
    setShowConfirm(false);
    alert("Refund berhasil diproses");
    setSelected(null);
    setCheckedMap({});
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Refund</h1>
        <p>Pengembalian dan pembatalan transaksi</p>
      </div>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div id="refundResults">
            {results.length === 0 ? (
              <div className={styles.noResults}>
                <div>Tidak ada hasil. Silakan cari ID transaksi atau nama pelanggan.</div>
              </div>
            ) : (
              <div>
                <h4>Hasil Pencarian ({results.length} transaksi)</h4>
                <div className={styles.resultsGrid}>
                  {results.map((t) => (
                    <div key={t.id} className={styles.resultCard}>
                      <div className={styles.cardHeader}>
                        <h5>{t.id}</h5>
                        <span className={styles.status}>{t.status || ""}</span>
                      </div>
                      <div className={styles.cardBody}>
                        <p>{new Date(t.date).toLocaleString()}</p>
                        <p>{t.items.length} item(s)</p>
                        <p>Rp {t.total}</p>
                        <p>{t.paymentMethod || "-"}</p>
                      </div>
                      <div className={styles.cardFooter}>
                        <button className={styles.selectBtn} onClick={() => selectTransaction(t.id)}>
                          Pilih Transaksi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selected && (
            <div id="refundItems" className={styles.itemsSection}>
              <div className={styles.selectedInfo}>
                <h4>Transaksi: {selected.id}</h4>
                <p>Tanggal: {new Date(selected.date).toLocaleString()}</p>
                <p>Total Asli: Rp {selected.total}</p>
              </div>

              <div className={styles.itemsGrid}>
                {selected.items.map((it) => (
                  <div className={styles.itemCard} key={it.id}>
                    <div className={styles.itemInfo}>
                      <h5>{it.name}</h5>
                      <p>{`Rp ${it.price} x ${it.quantity} = Rp ${it.price * it.quantity}`}</p>
                    </div>
                    <div className={styles.itemControls}>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" checked={checkedMap[it.id]?.checked || false} onChange={() => toggleItem(it.id)} /> Pilih
                      </label>
                      <select value={checkedMap[it.id]?.reason || "customer-request"} onChange={(e) => setReason(it.id, e.target.value)}>
                        <option value="customer-request">Permintaan Pelanggan</option>
                        <option value="damaged">Barang Rusak</option>
                        <option value="defective">Barang Cacat</option>
                        <option value="wrong-item">Barang Salah</option>
                        <option value="expired">Barang Kedaluwarsa</option>
                        <option value="other">Lainnya</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.summaryBar}>
                <div>Total Refund: Rp {refundTotal}</div>
                <div className={styles.actions}>
                  <button className={styles.processBtn} disabled={Object.values(checkedMap).every((v) => !v.checked)} onClick={openConfirm}>
                    Proses Refund
                  </button>
                  <button className={styles.cancelBtn} onClick={() => { setSelected(null); setCheckedMap({}); }}>
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className={styles.rightColumn}>
          <div className={styles.searchCard}>
            <h3>Cari Transaksi</h3>
            <div className={styles.searchRow}>
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Masukkan ID transaksi atau nama pelanggan..." />
              <button onClick={searchTransaction}>Cari</button>
            </div>
          </div>

          <div className={styles.recentCard}>
            <h3>Refund Terbaru</h3>
            <div>
              {recentRefunds.length === 0 ? <div>Tidak ada refund</div> : (
                recentRefunds.slice().reverse().slice(0, 6).map((r) => (
                  <div key={r.id} className={styles.recentItem}>
                    <div>{r.id}</div>
                    <div>Rp {r.total}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {showConfirm && selected && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Konfirmasi Refund</h3>
            <div>
              <p><strong>ID:</strong> {selected.id}</p>
              <p><strong>Customer:</strong> {selected.customerName || "Walk-in"}</p>
              <p><strong>Total Refund:</strong> Rp {refundTotal}</p>
              <div className={styles.modalActions}>
                <button onClick={processRefund} disabled={processing}>{processing ? "Memproses..." : "Konfirmasi Refund"}</button>
                <button onClick={() => setShowConfirm(false)} disabled={processing}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
