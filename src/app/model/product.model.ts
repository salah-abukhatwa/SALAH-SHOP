export interface Product {
  id: string;
  name: string;
  price: number;
  color: string;
  category: string;
  image: string;
  description: string;
  discount?: number;
  isPopular?: boolean;
  isTrendy?: boolean;
  isAvailable?: boolean;
  isPrime?: boolean;
  sellerId?: string;
}

export interface Cart {
  id?: string;
  productId: string;
  userId: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
}

export interface Order {
  email: string;
  address: string;
  contact: string;
  totalPrice: number;
  userId: string;
  id?: string;
  items?: Cart[];
}
