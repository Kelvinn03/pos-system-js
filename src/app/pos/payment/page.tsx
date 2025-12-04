import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PaymentClient from "./PaymentClient";

export default async function PaymentPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Payment</h1>
      <p className="text-muted mb-4">
        This page will handle payment processing and payment method selection.
      </p>
      <PaymentClient />
    </div>
  );
}
