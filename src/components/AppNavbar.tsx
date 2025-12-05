"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Monitor,
  Receipt,
  Users,
  Menu
} from "lucide-react";
import NavbarUserActions from "./NavbarUserActions";
import styles from "./AppNavbar.module.css";

interface AppNavbarProps {
  session: Session | null;
}

export default function AppNavbar({ session }: AppNavbarProps) {
  const user = session?.user;
  const pathname = usePathname();
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(pathname);

  if (isAuthPage) return null;

  return (
    <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
      <div className="container-fluid px-4">
        <Link className={`navbar-brand ${styles.brand}`} href="/">
          POS System
        </Link>
        <button
          className={`navbar-toggler ${styles.toggler}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <Menu size={24} />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto gap-2">
            {user && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${styles.navLink} ${pathname === "/" ? styles.navLinkActive : ""}`}
                    href="/"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${styles.navLink} ${pathname === "/products" ? styles.navLinkActive : ""}`}
                    href="/products"
                  >
                    <Package size={18} />
                    Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${styles.navLink} ${pathname === "/pos" ? styles.navLinkActive : ""}`}
                    href="/pos"
                  >
                    <Monitor size={18} />
                    POS Terminal
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${styles.navLink} ${pathname === "/transactions" ? styles.navLinkActive : ""}`}
                    href="/transactions"
                  >
                    <Receipt size={18} />
                    Transactions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${styles.navLink} ${pathname === "/contact" ? styles.navLinkActive : ""}`}
                    href="/contact"
                  >
                    <Receipt size={18} />
                    Contact
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${styles.navLink} ${pathname === "/support" ? styles.navLinkActive : ""}`}
                    href="/support"
                  >
                    <Receipt size={18} />
                    Support
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${styles.navLink} ${pathname === "/customers" ? styles.navLinkActive : ""}`}
                    href="/customers"
                  >
                    <Users size={18} />
                    Customers
                  </Link>
                </li>
              </>
            )}
          </ul>
          {user ? (
            <NavbarUserActions name={user.name} email={user.email} />
          ) : (
            <div className="d-flex align-items-center gap-3">
              <Link className={`btn ${styles.navLink}`} href="/login">
                Login
              </Link>
              <Link className="btn btn-primary" href="/register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
