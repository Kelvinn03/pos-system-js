export type Category = {
  id: number;
  name: string;
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
};

export type CartItem = {
  id: number;
  name: string;
  priceCents: number;
  quantity: number;
};
