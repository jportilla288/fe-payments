import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Product,
  TransactionResponse,
  DeliveryResponse,
  AmountBreakdown,
} from '../../../domain/models';
import type { CustomerInput } from '../../../domain/models/customer.model';
import type { DeliveryInput } from '../../../domain/models/delivery.model';
import type { CardInput } from '../../../domain/models/card.model';
import { paymentsApiAdapter } from '../../../infrastructure/api/payments-api.adapter';
import { localStorageAdapter } from '../../../infrastructure/persistence/local-storage.adapter';
import { AmountCalculatorService } from '../../../domain/services';

// ─── Step state machine ───────────────────────────────────────────────
export enum CheckoutStep {
  PRODUCT_SELECTION = 'PRODUCT_SELECTION',
  CARD_DELIVERY = 'CARD_DELIVERY',
  SUMMARY = 'SUMMARY',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export interface CheckoutState {
  step: CheckoutStep;
  selectedProduct: Product | null;
  quantity: number;
  customerData: CustomerInput | null;
  deliveryData: DeliveryInput | null;
  cardData: CardInput | null;
  /** Raw card number (never persisted to localStorage). */
  cardNumber: string;
  amounts: AmountBreakdown | null;
  transaction: TransactionResponse | null;
  delivery: DeliveryResponse | null;
  error: string | null;
  processing: boolean;
}

const initialState: CheckoutState = {
  step: CheckoutStep.PRODUCT_SELECTION,
  selectedProduct: null,
  quantity: 1,
  customerData: null,
  deliveryData: null,
  cardData: null,
  cardNumber: '',
  amounts: null,
  transaction: null,
  delivery: null,
  error: null,
  processing: false,
};

// ─── Async thunks ─────────────────────────────────────────────────────

export const createTransaction = createAsyncThunk(
  'checkout/createTransaction',
  async (_, { getState }) => {
    const state = (getState() as { checkout: CheckoutState }).checkout;

    if (!state.selectedProduct || !state.customerData || !state.deliveryData) {
      throw new Error('Incomplete checkout data');
    }

    return paymentsApiAdapter.createTransaction({
      productId: state.selectedProduct.id,
      quantity: state.quantity,
      customer: state.customerData,
      delivery: state.deliveryData,
      cardNumber: state.cardNumber,
    });
  },
);

export const processPayment = createAsyncThunk(
  'checkout/processPayment',
  async (_, { getState }) => {
    const state = (getState() as { checkout: CheckoutState }).checkout;

    if (!state.transaction || !state.cardData) {
      throw new Error('No transaction or card data');
    }

    return paymentsApiAdapter.processPayment(state.transaction.transactionId, {
      card: state.cardData,
      installments: 1,
    });
  },
);

export const pollTransaction = createAsyncThunk(
  'checkout/pollTransaction',
  async (transactionId: string) => {
    return paymentsApiAdapter.getTransaction(transactionId);
  },
);

// ─── Helper to persist (strips sensitive card data) ───────────────────

function persistState(state: CheckoutState) {
  const { cardData, cardNumber, ...safe } = state;
  void cardData;
  void cardNumber;
  localStorageAdapter.saveCheckout(safe);
}

// ─── Slice ────────────────────────────────────────────────────────────

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    selectProduct(
      state,
      action: PayloadAction<{ product: Product; quantity: number }>,
    ) {
      state.selectedProduct = action.payload.product;
      state.quantity = action.payload.quantity;
      state.amounts = AmountCalculatorService.calculate(
        action.payload.product,
        action.payload.quantity,
      );
      state.step = CheckoutStep.CARD_DELIVERY;
      state.error = null;
      persistState(state);
    },

    setCustomerData(state, action: PayloadAction<CustomerInput>) {
      state.customerData = action.payload;
      persistState(state);
    },

    setDeliveryData(state, action: PayloadAction<DeliveryInput>) {
      state.deliveryData = action.payload;
      persistState(state);
    },

    setCardData(
      state,
      action: PayloadAction<{ card: CardInput; cardNumber: string }>,
    ) {
      state.cardData = action.payload.card;
      state.cardNumber = action.payload.cardNumber;
      // Card data is NOT persisted to localStorage for security.
    },

    goToSummary(state) {
      state.step = CheckoutStep.SUMMARY;
      state.error = null;
      persistState(state);
    },

    goBack(state) {
      if (state.step === CheckoutStep.CARD_DELIVERY) {
        state.step = CheckoutStep.PRODUCT_SELECTION;
      } else if (state.step === CheckoutStep.SUMMARY) {
        state.step = CheckoutStep.CARD_DELIVERY;
      }
      persistState(state);
    },

    resetCheckout(state) {
      Object.assign(state, initialState);
      localStorageAdapter.clearCheckout();
    },

    restoreCheckout(_, action: PayloadAction<Partial<CheckoutState>>) {
      return {
        ...initialState,
        ...action.payload,
        // Sensitive data is never in localStorage
        cardData: null,
        cardNumber: '',
      };
    },

    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.processing = false;
    },

    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transaction = action.payload.transaction;
        state.delivery = action.payload.delivery;
        state.amounts = action.payload.transaction.amounts;
        persistState(state);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.processing = false;
        state.error = action.error.message ?? 'Failed to create transaction';
      });

    // Process payment
    builder
      .addCase(processPayment.pending, (state) => {
        state.processing = true;
        state.step = CheckoutStep.PROCESSING;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.processing = false;
        state.transaction = action.payload;
        state.step = CheckoutStep.RESULT;
        persistState(state);
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.processing = false;
        state.step = CheckoutStep.RESULT;
        state.error = action.error.message ?? 'Payment failed';
        persistState(state);
      });

    // Poll transaction
    builder
      .addCase(pollTransaction.fulfilled, (state, action) => {
        state.transaction = action.payload;
        persistState(state);
      });
  },
});

export const {
  selectProduct,
  setCustomerData,
  setDeliveryData,
  setCardData,
  goToSummary,
  goBack,
  resetCheckout,
  restoreCheckout,
  setError,
  clearError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
