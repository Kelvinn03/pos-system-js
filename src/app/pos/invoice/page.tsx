import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PrintButton from "./PrintButton";

type Props = {
  searchParams?: { tx?: string } | Promise<{ tx?: string }>;
};

export default async function InvoicePage({ searchParams }: Props) {
  const resolvedSearch = await Promise.resolve(searchParams);
  
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const txParam = resolvedSearch?.tx;
  if (!txParam) {
    return (
      <div className="container py-5">
        <h1 className="mb-4">Invoice</h1>
        <div className="alert alert-warning">No transaction id provided.</div>
      </div>
    );
  }

  const txId = parseInt(txParam, 10);
  if (Number.isNaN(txId)) {
    return (
      <div className="container py-5">
        <h1 className="mb-4">Invoice</h1>
        <div className="alert alert-danger">Invalid transaction id.</div>
      </div>
    );
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: txId },
    include: { items: true, cashier: true },
  });

  if (!transaction) {
    return (
      <div className="container py-5">
        <h1 className="mb-4">Invoice</h1>
        <div className="alert alert-danger">Transaction not found.</div>
      </div>
    );
  }

  const subtotalCents = transaction.items.reduce((s, it) => s + it.subtotalCents, 0);
  const taxCents = Math.round(subtotalCents * 0.11);
  const grandTotalCents = subtotalCents + taxCents;

  const formatCents = (cents: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(cents / 100);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="mb-1">Invoice</h1>
          <div className="text-muted">Transaction #{transaction.id} - {new Date(transaction.createdAt).toLocaleString()}</div>
          <div className="text-muted">Cashier: {transaction.cashier?.name ?? "-"}</div>
        </div>
        <div>
          <PrintButton />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Items</h5>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-end">Qty</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.name}</td>
                    <td className="text-end">{it.quantity}</td>
                    <td className="text-end">{formatCents(it.subtotalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 d-flex justify-content-end">
            <div style={{ width: 320 }}>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
