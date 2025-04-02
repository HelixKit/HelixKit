// src/types.ts - Type definitions for the e-commerce app

// Product type
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  features?: string[];
  stock: number;
  rating: number;
}

// Cart item type
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order type
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: CustomerInfo;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

// Customer information
export interface CustomerInfo {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}