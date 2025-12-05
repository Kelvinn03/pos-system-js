import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PosCartClient from "./PosCartClient";
import Link from "next/link";

export default async function PosTerminalPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">POS Terminal</h1>
      <PosCartClient />
      <div className="mb-3">
      <Link href="/pos/refund" className="btn btn-outline-secondary me-2">
              Refund
            </Link>
      </div>
    </div>
  );
}
