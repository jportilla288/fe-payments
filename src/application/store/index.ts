import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './products/productsSlice';
import checkoutReducer from './checkout/checkoutSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
