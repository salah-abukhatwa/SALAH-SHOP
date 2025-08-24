export interface Product {
  id: number;
  name: string;
  price: number;
  color: string;
  category: string;
  image: string;
  description: string;
  quantity?: number;
  discount?: number;
}

export interface Cart {
  id?: number;
  productId: number;
  userId: number;
  quantity: number;

  product?: Product;
}
export interface order {
  email: string;
  address: string;
  contact: string;
  totalPrice: number;
  userId: number;
  id?: number;
}
