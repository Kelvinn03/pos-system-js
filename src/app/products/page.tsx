import prisma from "@/lib/prisma";

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="mb-1">Products</h1>
          <p className="text-muted mb-0">
            Manage all items available in your POS. Data shown below is loaded directly from SQLite via Prisma.
          </p>
        </div>
        <button className="btn btn-primary" disabled>
          + New Product (coming soon)
        </button>
      </div>

      {products.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No products yet. After we add a product form or seed script, new items will appear here.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">SKU</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Created</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.category?.name ?? "Uncategorized"}</td>
                  <td>{formatCurrency(product.priceCents)}</td>
                  <td>{product.stock}</td>
                  <td>{product.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
