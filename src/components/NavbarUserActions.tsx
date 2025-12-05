"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

interface NavbarUserActionsProps {
  name?: string | null;
  email?: string | null;
}

export default function NavbarUserActions({ name, email }: NavbarUserActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      signOut({ callbackUrl: "/login" });
    });
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <span className="text-white small">
        Hi, {name ?? email}
      </span>
      <button
        type="button"
        className="btn btn-outline-light btn-sm"
        onClick={handleLogout}
        disabled={isPending}
      >
        {isPending ? "Signing out..." : "Logout"}
      </button>
    </div>
  );
}
