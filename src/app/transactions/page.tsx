export default function TransactionsPage() {
  return (
    <div className="container py-5">
      <h1 className="mb-4">Transactions</h1>
      <p className="text-muted mb-4">
        This page will show the history of completed sales and basic reporting.
      </p>
      <div className="alert alert-info" role="alert">
        Later we will load transaction data from the SQLite database via Prisma.
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Transaction List</h5>
          <p className="card-text mb-0">
            In future steps, this section will contain a table or list of past transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
