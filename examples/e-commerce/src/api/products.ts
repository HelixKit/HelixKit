// src/api/products.ts - Mock API for product data
import { Product, PaginatedResponse } from '../types';

// Mock product data
const products: Product[] = [
  {
    id: '1',
    name: 'Helix Smart Watch',
    description: 'Premium smartwatch with health tracking features and long battery life.',
    price: 199.99,
    image: '/images/products/smartwatch.jpg',
    category: 'electronics',
    features: ['Heart rate monitor', 'Sleep tracking', '7-day battery life', 'Water resistant'],
    stock: 15,
    rating: 4.5
  },
  {
    id: '2',
    name: 'Ergonomic Office Chair',
    description: 'Comfortable office chair with lumbar support and adjustable height.',
    price: 249.99,
    image: '/images/products/chair.jpg',
    category: 'home',
    features: ['Adjustable height', 'Lumbar support', 'Breathable mesh', 'Swivel base'],
    stock: 8,
    rating: 4.2
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    description: 'Noise cancelling headphones with premium sound quality.',
    price: 149.99,
    image: '/images/products/headphones.jpg',
    category: 'electronics',
    features: ['Noise cancellation', '30-hour battery', 'Bluetooth 5.0', 'Foldable design'],
    stock: 20,
    rating: 4.8
  },
  {
    id: '4',
    name: 'Cotton T-Shirt',
    description: 'Premium cotton t-shirt available in multiple colors.',
    price: 24.99,
    image: '/images/products/tshirt.jpg',
    category: 'clothing',
    features: ['100% cotton', 'Machine washable', 'Sizes S-XXL', 'Multiple colors'],
    stock: 50,
    rating: 4.0
  },
  {
    id: '5',
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat ideal for home workouts.',
    price: 39.99,
    image: '/images/products/yogamat.jpg',
    category: 'sports',
    features: ['6mm thickness', 'Non-slip surface', 'Eco-friendly materials', 'Carrying strap'],
    stock: 25,
    rating: 4.3
  },
  {
    id: '6',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe.',
    price: 79.99,
    image: '/images/products/coffeemaker.jpg',
    category: 'home',
    features: ['10-cup capacity', 'Programmable timer', 'Auto shut-off', 'Thermal carafe'],
    stock: 12,
    rating: 4.6
  }
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all products with optional filtering and pagination
 */
export async function fetchProducts(
  options: {
    category?: string;
    page?: number;
    pageSize?: number;
    sortBy?: 'price' | 'name' | 'rating';
    order?: 'asc' | 'desc';
  } = {}
): Promise<PaginatedResponse<Product>> {
  // Simulate API call delay
  await delay(800);
  
  const {
    category,
    page = 1,
    pageSize = 10,
    sortBy = 'name',
    order = 'asc'
  } = options;
  
  // Filter by category if provided
  let filtered = category 
    ? products.filter(product => product.category === category)
    : [...products];
    
  // Sort results
  filtered.sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return order === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // Numeric comparison
    return order === 'asc'
      ? Number(valueA) - Number(valueB)
      : Number(valueB) - Number(valueA);
  });
  
  // Calculate pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = filtered.slice(start, end);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages
  };
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product> {
  // Simulate API call delay
  await delay(600);
  
  const product = products.find(p => p.id === id);
  
  if (!product) {
    throw new Error(`Product with ID ${id} not found`);
  }
  
  return product;
}

/**
 * Fetch featured products
 */
export async function fetchFeaturedProducts(): Promise<Product[]> {
  // Simulate API call delay
  await delay(500);
  
  // Return top rated products as featured
  return products
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
}

/**
 * Fetch product categories
 */
export async function fetchCategories(): Promise<string[]> {
  // Simulate API call delay
  await delay(300);
  
  // Extract unique categories
  const categories = new Set(products.map(product => product.category));
  return Array.from(categories);
}

/**
 * Search products by name or description
 */
export async function searchProducts(query: string): Promise<Product[]> {
  // Simulate API call delay
  await delay(600);
  
  if (!query.trim()) {
    return [];
  }
  
  const searchTerms = query.toLowerCase().split(' ');
  
  return products.filter(product => {
    const searchText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return searchTerms.some(term => searchText.includes(term));
  });
}