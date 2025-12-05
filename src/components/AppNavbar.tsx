"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";
import NavbarUserActions from "./NavbarUserActions";

interface AppNavbarProps {
  session: Session | null;
}

export default function AppNavbar({ session }: AppNavbarProps) {
  const user = session?.user;
  const pathname = usePathname();
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(pathname);

  if (isAuthPage) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          POS System
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/products">
                    Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/pos">
                    POS Terminal
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/transactions">
                    Transactions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/customers">
                    Customers
                  </Link>
                </li>
              </>
            )}
          </ul>
          {user ? (
            <NavbarUserActions name={user.name} email={user.email} />
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link className="btn btn-outline-light btn-sm" href="/login">
                Login
              </Link>
              <Link className="btn btn-primary btn-sm" href="/register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
