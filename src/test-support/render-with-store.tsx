import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactElement } from 'react';
import productsReducer from '../application/store/products/productsSlice';
import checkoutReducer from '../application/store/checkout/checkoutSlice';

/** Builds a fresh store per test so state never leaks between cases. */
export const makeStore = () =>
  configureStore({
    reducer: { products: productsReducer, checkout: checkoutReducer },
  });

export const renderWithStore = (
  ui: ReactElement,
  store: ReturnType<typeof makeStore> = makeStore(),
) => ({
  store,
  ...render(<Provider store={store}>{ui}</Provider>),
});
