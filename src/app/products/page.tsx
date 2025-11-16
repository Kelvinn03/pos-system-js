export default function ProductsPage() {
  return (
    <div className="container py-5">
      <h1 className="mb-4">Products</h1>
      <p className="text-muted mb-4">
        This page will list and manage all products in the POS system.
      </p>
      <div className="alert alert-info" role="alert">
        Backend integration with SQLite + Prisma will be added later.
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Product List</h5>
          <p className="card-text mb-0">
            In the next steps, this section will show a table of products loaded from the database.
          </p>
        </div>
      </div>
    </div>
  );
}
