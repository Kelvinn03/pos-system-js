"use client";

import { useTransition, useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

interface NavbarUserActionsProps {
  name?: string | null;
  email?: string | null;
}

export default function NavbarUserActions({ name, email }: NavbarUserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [remoteName, setRemoteName] = useState<string | null>(null);
  const [remoteEmail, setRemoteEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setRemoteName(data.name ?? null);
        setRemoteEmail(data.email ?? null);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    startTransition(() => {
      signOut({ callbackUrl: "/login" });
    });
  };

  return (
    <div className="d-flex align-items-center gap-3">
      <Link href="/profile/edit" className="d-flex align-items-center gap-2 text-decoration-none" style={{ color: '#cbd5e1' }}>
        <div className="bg-white/10 p-1.5 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
          <User size={16} className="text-white" />
        </div>
        <span className="small fw-medium" style={{ cursor: 'pointer' }}>
          {remoteName ?? name ?? remoteEmail ?? email}
        </span>
      </Link>
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
