export interface Product {
  id: string;              // uuid
  name: string;            // obrigatório
  description?: string;    // opcional
  sku?: string;            // opcional, único
  price: number;           // obrigatório
  stock: number;           // default 0
  created_at: string;      // timestamp
  updated_at: string;      // timestamp
}
