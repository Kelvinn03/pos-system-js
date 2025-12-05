export type Category = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: number;
  name: string;
  sku: string;
  priceCents: number;
  stock: number;
  image: string | null;
  categoryId: number | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
};

export type TransactionItem = {
  id: number;
  name: string;
  quantity: number;
  priceCents: number;
  subtotalCents: number;
  transactionId: number;
};

export type Transaction = {
  id: number;
  createdAt: string;
  totalCents: number;
  items?: TransactionItem[];
  cashierId?: number | null;
  cashier?: User | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  transactions?: Transaction[];
};

export type Role = "ADMIN" | "CASHIER";

export type CartItem = {
  id: number;
  name: string;
  priceCents: number;
  quantity: number;
};
