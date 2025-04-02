// src/pages/HomePage.tsx - E-commerce site homepage
import { h, createResource, Suspense } from 'helix';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product } from '../types';
import { fetchFeaturedProducts } from '../api/products';

export default function HomePage() {
  // Load featured products with Suspense
  const [featuredProducts] = createResource<Product[], void>(
    () => undefined,
    fetchFeaturedProducts
  );
  
  // Mock navigation function for product cards
  const navigate = (path: string) => {
    window.location.href = path;
  };
  
  return h('div', { className: 'home-page' },
    // Hero section
    h('section', { className: 'hero' },
      h('div', { className: 'hero-content' },
        h('h1', {}, 'Welcome to HelixShop'),
        h('p', {}, 'Discover our premium collection of products'),
        h('a', { 
          className: 'cta-button',
          href: '/products',
          onClick: (e: Event) => {
            e.preventDefault();
            navigate('/products');
          }
        }, 'Shop Now')
      )
    ),
    
    // Featured products section
    h('section', { className: 'featured-products' },
      h('h2', { className: 'section-title' }, 'Featured Products'),
      
      h(Suspense, {
        fallback: h(LoadingSpinner, { message: 'Loading featured products...' })
      },
        h('div', { className: 'product-grid' },
          featuredProducts()?.map(product =>
            h(ProductCard, {
              key: product.id,
              product,
              navigate
            })
          )
        )
      )
    ),
    
    // Categories section
    h('section', { className: 'categories' },
      h('h2', { className: 'section-title' }, 'Shop by Category'),
      
      h('div', { className: 'category-grid' },
        // Electronics category
        h('div', { 
          className: 'category-card',
          onClick: () => navigate('/products?category=electronics')
        },
          h('div', { className: 'category-image electronics' }),
          h('h3', {}, 'Electronics')
        ),
        
        // Clothing category
        h('div', { 
          className: 'category-card',
          onClick: () => navigate('/products?category=clothing')
        },
          h('div', { className: 'category-image clothing' }),
          h('h3', {}, 'Clothing')
        ),
        
        // Home & Garden category
        h('div', { 
          className: 'category-card',
          onClick: () => navigate('/products?category=home')
        },
          h('div', { className: 'category-image home' }),
          h('h3', {}, 'Home & Garden')
        ),
        
        // Sports category
        h('div', { 
          className: 'category-card',
          onClick: () => navigate('/products?category=sports')
        },
          h('div', { className: 'category-image sports' }),
          h('h3', {}, 'Sports & Outdoors')
        )
      )
    ),
    
    // Newsletter signup
    h('section', { className: 'newsletter' },
      h('div', { className: 'newsletter-content' },
        h('h2', {}, 'Stay Updated'),
        h('p', {}, 'Subscribe to our newsletter for the latest products and exclusive offers.'),
        
        h('form', { 
          className: 'newsletter-form',
          onSubmit: (e: Event) => {
            e.preventDefault();
            // Form submission logic would go here
            alert('Thank you for subscribing!');
          }
        },
          h('input', {
            type: 'email',
            placeholder: 'Your email address',
            required: true
          }),
          h('button', { type: 'submit' }, 'Subscribe')
        )
      )
    )
  );
}