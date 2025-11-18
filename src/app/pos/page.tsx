import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PosTerminalPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">POS Terminal</h1>
      <p className="text-muted mb-4">
        This page will be used by the cashier to select products, manage the cart, and process payments.
      </p>
      <div className="alert alert-info" role="alert">
        The interactive cart and checkout flow will be implemented in a later milestone.
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Sale Session</h5>
          <p className="card-text mb-0">
            Here we will show the list of selected items, quantities, totals, and payment actions.
          </p>
        </div>
      </div>
    </div>
  );
}
