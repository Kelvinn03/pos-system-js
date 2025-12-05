"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

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
    <div className="d-flex align-items-center gap-3">
      <div className="d-flex align-items-center gap-2 text-slate-300" style={{ color: '#cbd5e1' }}>
        <div className="bg-white/10 p-1.5 rounded-circle d-flex align-items-center justify-content-center">
          <User size={16} className="text-white" />
        </div>
        <span className="small fw-medium">
          {name ?? email}
        </span>
      </div>
      <div className="vr bg-white/10 mx-1" style={{ height: '20px', opacity: 0.2 }}></div>
      <button
        type="button"
        className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 text-danger opacity-75 hover-opacity-100"
        onClick={handleLogout}
        disabled={isPending}
        style={{ transition: 'opacity 0.2s' }}
      >
        <span className="small fw-medium">{isPending ? "Signing out..." : "Logout"}</span>
        {!isPending && <LogOut size={16} />}
      </button>
    </div>
  );
}
