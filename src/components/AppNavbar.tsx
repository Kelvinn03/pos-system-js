import Link from "next/link";
import type { Session } from "next-auth";

interface AppNavbarProps {
  session: Session | null;
}

export default function AppNavbar({ session }: AppNavbarProps) {
  const user = session?.user;

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
          </ul>
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="text-white small">
                  Hi, {user.name ?? user.email}
                </span>
                <form action="/api/auth/signout" method="post">
                  <button type="submit" className="btn btn-outline-light btn-sm">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" href="/login">
                  Login
                </Link>
                <Link className="btn btn-primary btn-sm" href="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
