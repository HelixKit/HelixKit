// Core module exports

export * from './reactivity';
export * from './component';
export * from './render';
export * from './lifecycle';
export * from './store';
export * from './router';
// Export resource functions individually to avoid conflicts
import { 
  createResource, 
  createResourcePool as createResourceFactory,
  createPaginatedResource
} from './resource';
export { 
  createResource, 
  createResourceFactory,
  createPaginatedResource
};
export * from './types';
export * from './scheduler';
export * from './diff';
