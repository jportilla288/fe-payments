import reducer, { fetchProducts } from './productsSlice';
import type { Product } from '../../../domain/models';

const product: Product = {
  id: 'p1',
  name: 'Shoes',
  description: 'Nice',
  priceInCents: 100_000,
  stock: 5,
  imageUrl: null,
};

const initial = () => reducer(undefined, { type: '@@INIT' });

describe('productsSlice', () => {
  it('starts empty', () => {
    expect(initial()).toEqual({ items: [], loading: false, error: null });
  });

  it('flags loading while fetching', () => {
    expect(reducer(initial(), { type: fetchProducts.pending.type }).loading).toBe(true);
  });

  it('stores the catalogue on success', () => {
    const state = reducer(initial(), {
      type: fetchProducts.fulfilled.type,
      payload: [product],
    });

    expect(state.items).toHaveLength(1);
    expect(state.loading).toBe(false);
  });

  it('stores the message on failure', () => {
    const state = reducer(initial(), {
      type: fetchProducts.rejected.type,
      error: { message: 'Network Error' },
    });

    expect(state.error).toBe('Network Error');
    expect(state.loading).toBe(false);
  });
});
