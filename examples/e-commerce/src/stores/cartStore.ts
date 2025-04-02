// src/stores/cartStore.ts - Cart state management
import { createStore } from 'helix';
import { CartItem, Product } from '../types';

// Cart store state
interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// Initialize cart store with empty state
const initialState: CartState = {
  items: [],
  isOpen: false
};

// Create and export the cart store
const cartStore = createStore<CartState>({
  name: 'cart',
  state: initialState,
  
  // Optional debugging options
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logActions: true
  }
});

// Hook to access cart functionality
export function useCart() {
  const { getState, setState } = cartStore;
  
  // Cart actions
  const actions = {
    // Add item to cart
    addItem(product: Product, quantity = 1) {
      const items = getState('items');
      const existingItem = items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        setState('items', items.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        ));
      } else {
        // Add new item
        setState('items', [...items, { product, quantity }]);
      }
    },
    
    // Update item quantity
    updateQuantity(productId: string, quantity: number) {
      const items = getState('items');
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        setState('items', items.filter(item => item.product.id !== productId));
      } else {
        // Update quantity
        setState('items', items.map(item => 
          item.product.id === productId 
            ? { ...item, quantity } 
            : item
        ));
      }
    },
    
    // Remove item from cart
    removeItem(productId: string) {
      const items = getState('items');
      setState('items', items.filter(item => item.product.id !== productId));
    },
    
    // Clear the cart
    clearCart() {
      setState('items', []);
    },
    
    // Toggle cart sidebar
    toggleCart() {
      const isOpen = getState('isOpen');
      setState('isOpen', !isOpen);
    }
  };
  
  // Computed values
  const computed = {
    // Total quantity of items
    totalItems() {
      return getState('items').reduce((sum, item) => sum + item.quantity, 0);
    },
    
    // Subtotal price
    subtotal() {
      return getState('items').reduce(
        (sum, item) => sum + (item.product.price * item.quantity), 
        0
      );
    }
  };
  
  return {
    getState,
    setState,
    actions,
    computed
  };
}