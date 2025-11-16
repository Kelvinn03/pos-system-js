import Link from "next/link";

export default function Home() {
  return (
    <div className="min-vh-100 bg-light">
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
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" href="/">
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
          </div>
        </div>
      </nav>

      <main className="container py-5">
        <div className="row mb-4">
          <div className="col-12 col-lg-8">
            <h1 className="mb-3">Welcome to the POS System</h1>
            <p className="text-muted">
              Manage products, process sales, and view transactions in one place.
            </p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-4" id="products">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Products</h5>
                <p className="card-text">
                  Create and manage the products available for sale in your store.
                </p>
                <button className="btn btn-primary" disabled>
                  Go to Products
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4" id="pos">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">POS Terminal</h5>
                <p className="card-text">
                  Open the cashier screen to add items to the cart and process payments.
                </p>
                <button className="btn btn-success" disabled>
                  Open POS
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4" id="transactions">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Transactions</h5>
                <p className="card-text">
                  View transaction history, totals, and basic reporting.
                </p>
                <button className="btn btn-outline-secondary" disabled>
                  View Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
