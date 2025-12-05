"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/types";
import { Button, Form } from "react-bootstrap";
import Image from "next/image";

export default function PaymentClient() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [method, setMethod] = useState<"cash" | "debit" | "qris" | null>(null);
  const [cashPaid, setCashPaid] = useState<string>("");
  const [debitPin, setDebitPin] = useState<string>("");
  const [qrisChecked, setQrisChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pos_cart");
      if (!raw) {
        router.replace("/pos");
        return;
      }
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        router.replace("/pos");
        return;
      }
      Promise.resolve().then(() => setItems(parsed));
    } catch {
      router.replace("/pos");
    }
  }, [router]);

  if (!items) return null;

  const subtotalCents = items.reduce((s, it) => s + it.priceCents * it.quantity, 0);
  const taxCents = Math.round(subtotalCents * 0.11);
  const grandTotalCents = subtotalCents + taxCents;

  const formatCents = (cents: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(cents / 100);

  const cashPaidCents = Math.round((parseFloat(cashPaid || "0") || 0) * 100);
  const cashChangeCents = cashPaidCents - grandTotalCents;

  function resetSelection() {
    setMethod(null);
    setCashPaid("");
    setDebitPin("");
    setQrisChecked(false);
  }

  function handlePurchase() {
    if (method === "cash") {
      if (cashPaidCents < grandTotalCents) return;
    } else if (method === "debit") {
      if (!debitPin || debitPin.trim().length < 4) return;
    } else if (method === "qris") {
      if (!qrisChecked) return;
    }

    if (!items) return;
    const payloadItems = items.map((it) => ({ id: it.id, quantity: it.quantity, priceCents: it.priceCents }));

    (async () => {
      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: payloadItems }),
        });

        const data = await res.json();
        if (!res.ok) {
          const message = data?.error ?? "Failed to create transaction";
          alert(message);
          return;
        }
        try {
          localStorage.removeItem("pos_cart");
        } catch {}
        const txId = data?.id;
        router.replace(`/pos/invoice?tx=${txId}`);
      } catch {
        alert("Network error creating transaction");
      }
    })();
  }

  return (
    <div className="container py-3">
      {!method ? (
        <div className="d-flex gap-3">
          <div role="button" className="card p-3 text-center flex-fill" onClick={() => setMethod("cash")}> 
            <div className="h5">Cash</div>
            <Image src="/cash.svg" alt="Cash payment" width={48} height={48} style={{ objectFit: "contain", display: "block", margin: "8px auto" }} />
            <div className="text-muted">Pay with cash</div>
          </div>
          <div role="button" className="card p-3 text-center flex-fill" onClick={() => setMethod("debit")}>
            <div className="h5">Debit</div>
            <img src="/debit.jpg" alt="Debit card" width={48} height={48} style={{ objectFit: "contain", display: "block", margin: "8px auto" }} />
            <div className="text-muted">Card payment</div>
          </div>
          <div role="button" className="card p-3 text-center flex-fill" onClick={() => setMethod("qris")}>
            <div className="h5">QRIS</div>
            <img src="/qris.png" alt="QRIS" width={48} height={48} style={{ objectFit: "contain", display: "block", margin: "8px auto" }} />
            <div className="text-muted">Scan QR</div>
          </div>
        </div>
      ) : (
        <div className="row gx-4">
          <div className="col-md-8">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Order Summary</h5>
                <div className="table-responsive" style={{ maxHeight: 360, overflowY: "auto" }}>
                  <table className="table table-sm mb-0" style={{ tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: "40%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "20%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">Qty</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.id}>
                          <td className="text-truncate" style={{ maxWidth: 240 }}>{it.name}</td>
                          <td className="text-end">{formatCents(it.priceCents)}</td>
                          <td className="text-end">{it.quantity}</td>
                          <td className="text-end">{formatCents(it.priceCents * it.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="text-end">Subtotal</td>
                        <td className="text-end">{formatCents(subtotalCents)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-end">Tax (11%)</td>
                        <td className="text-end">{formatCents(taxCents)}</td>
                      </tr>
                      <tr className="fw-bold">
                        <td colSpan={3} className="text-end">Grand Total</td>
                        <td className="text-end">{formatCents(grandTotalCents)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Payment - {method?.toUpperCase()}</h5>
                  <Button variant="link" size="sm" onClick={resetSelection}>Change</Button>
                </div>

                {method === "cash" && (
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount Paid (IDR)</Form.Label>
                      <Form.Control
                        type="number"
                        value={cashPaid}
                        onChange={(e) => setCashPaid(e.target.value)}
                        min={0}
                        step="1"
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-between">
                      <div>Change</div>
                      <div className={cashChangeCents < 0 ? "text-danger" : ""}>{formatCents(Math.max(0, cashChangeCents))}</div>
                    </div>
                  </div>
                )}

                {method === "debit" && (
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label>Enter PIN</Form.Label>
                      <Form.Control type="password" value={debitPin} onChange={(e) => setDebitPin(e.target.value)} maxLength={6} />
                    </Form.Group>
                  </div>
                )}

                {method === "qris" && (
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label>QRIS</Form.Label>
                      <div className="d-flex align-items-center gap-2">
                        <Button variant={qrisChecked ? "success" : "outline-secondary"} onClick={() => setQrisChecked((s) => !s)}>
                          <Image src="/qris_code.jpg" alt="QRIS code" width={200} height={200} style={{ objectFit: "contain", display: "block" }} />
                          {qrisChecked ? "Checked" : "Check"}
                        </Button>
                        <div className="text-muted small">Toggle to simulate QR scan</div>
                      </div>
                    </Form.Group>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handlePurchase}
                    disabled={
                      method === "cash" ? cashPaidCents < grandTotalCents : method === "debit" ? debitPin.trim().length < 4 : method === "qris" ? !qrisChecked : true
                    }
                  >
                    Confirm Purchase
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
