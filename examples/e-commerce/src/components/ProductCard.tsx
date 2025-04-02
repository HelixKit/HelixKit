// src/components/ProductCard.tsx - Product card for listings
import { h } from 'helix';
import { useCart } from '../stores/cartStore';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export default function ProductCard({ product, navigate }: ProductCardProps) {
  const { actions } = useCart();
  
  const handleAddToCart = (e: Event) => {
    e.stopPropagation();
    actions.addItem(product, 1);
  };
  
  const goToProduct = () => {
    navigate(`/products/${product.id}`);
  };
  
  return h('div', { 
    className: 'product-card',
    onClick: goToProduct
  },
    // Product image
    h('div', { className: 'product-card-image' },
      h('img', { 
        src: product.image,
        alt: product.name,
        loading: 'lazy'
      })
    ),
    
    // Product info
    h('div', { className: 'product-card-content' },
      h('h3', { className: 'product-card-title' }, product.name),
      h('p', { className: 'product-card-category' }, product.category),
      h('p', { className: 'product-card-price' }, formatCurrency(product.price))
    ),
    
    // Actions
    h('div', { className: 'product-card-actions' },
      h('button', { 
        className: 'add-to-cart-button',
        onClick: handleAddToCart,
        'aria-label': `Add ${product.name} to cart`
      }, 'Add to Cart')
    )
  );
}