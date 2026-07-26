import reducer, {
  CheckoutStep,
  clearError,
  createTransaction,
  goBack,
  goToSummary,
  processPayment,
  resetCheckout,
  restoreCheckout,
  selectProduct,
  setCardData,
  setCustomerData,
  setDeliveryData,
  setError,
} from './checkoutSlice';
import type { CheckoutState } from './checkoutSlice';
import { DocumentType, TransactionStatus } from '../../../domain/enums';
import type { Product } from '../../../domain/models';

const product: Product = {
  id: 'p1',
  name: 'Shoes',
  description: 'Nice',
  priceInCents: 100_000,
  stock: 5,
  imageUrl: null,
};

const initial = (): CheckoutState =>
  reducer(undefined, { type: '@@INIT' }) as CheckoutState;

const transaction = {
  transactionId: 'tx-1',
  reference: 'TX-REF',
  status: TransactionStatus.APPROVED,
  paymentDescription: 'Shoes x1',
  quantity: 1,
  amounts: {
    productAmountInCents: 100_000,
    baseFeeInCents: 50_000,
    deliveryFeeInCents: 120_000,
    amountInCents: 270_000,
  },
  productId: 'p1',
  solicitedDate: '2026-07-26T00:00:00Z',
  cardBrand: 'VISA',
  cardLastFour: '4242',
  statusMessage: null,
};

describe('checkoutSlice', () => {
  beforeEach(() => localStorage.clear());

  it('starts on the product selection step', () => {
    expect(initial().step).toBe(CheckoutStep.PRODUCT_SELECTION);
  });

  it('selecting a product computes the amounts and advances the step', () => {
    const state = reducer(initial(), selectProduct({ product, quantity: 2 }));

    expect(state.step).toBe(CheckoutStep.CARD_DELIVERY);
    expect(state.quantity).toBe(2);
    expect(state.amounts?.productAmountInCents).toBe(200_000);
  });

  it('stores customer and delivery data', () => {
    let state = reducer(initial(), selectProduct({ product, quantity: 1 }));
    state = reducer(
      state,
      setCustomerData({
        email: 'a@b.com',
        fullName: 'Jane Doe',
        document: '123456',
        documentType: DocumentType.CC,
        phoneNumber: '3001234567',
      }),
    );
    state = reducer(
      state,
      setDeliveryData({
        recipientName: 'Jane Doe',
        address: 'Calle 100',
        city: 'Bucaramanga',
        region: 'Santander',
        country: 'CO',
        phoneNumber: '3001234567',
      }),
    );

    expect(state.customerData?.email).toBe('a@b.com');
    expect(state.deliveryData?.city).toBe('Bucaramanga');
  });

  it('never writes the card number to localStorage', () => {
    let state = reducer(initial(), selectProduct({ product, quantity: 1 }));
    state = reducer(
      state,
      setCardData({
        card: {
          number: '4242424242424242',
          cvc: '123',
          expMonth: '08',
          expYear: '29',
          cardHolder: 'JANE DOE',
        },
        cardNumber: '4242424242424242',
      }),
    );
    state = reducer(state, goToSummary());

    const persisted = localStorage.getItem('spa_checkout_state') ?? '';

    expect(state.cardNumber).toBe('4242424242424242');
    expect(persisted).not.toContain('4242424242424242');
    expect(persisted).not.toContain('"cvc"');
  });

  it('walks the steps backwards', () => {
    let state = reducer(initial(), selectProduct({ product, quantity: 1 }));
    state = reducer(state, goToSummary());
    expect(state.step).toBe(CheckoutStep.SUMMARY);

    state = reducer(state, goBack());
    expect(state.step).toBe(CheckoutStep.CARD_DELIVERY);

    state = reducer(state, goBack());
    expect(state.step).toBe(CheckoutStep.PRODUCT_SELECTION);
  });

  it('resets the checkout and clears the snapshot', () => {
    let state = reducer(initial(), selectProduct({ product, quantity: 1 }));
    state = reducer(state, resetCheckout());

    expect(state.step).toBe(CheckoutStep.PRODUCT_SELECTION);
    expect(state.selectedProduct).toBeNull();
    expect(localStorage.getItem('spa_checkout_state')).toBeNull();
  });

  it('restores a snapshot without any card data', () => {
    const state = reducer(
      initial(),
      restoreCheckout({
        step: CheckoutStep.SUMMARY,
        selectedProduct: product,
        quantity: 1,
      }),
    );

    expect(state.step).toBe(CheckoutStep.SUMMARY);
    expect(state.cardData).toBeNull();
    expect(state.cardNumber).toBe('');
  });

  it('sets and clears the error', () => {
    let state = reducer(initial(), setError('boom'));
    expect(state.error).toBe('boom');
    expect(state.processing).toBe(false);

    state = reducer(state, clearError());
    expect(state.error).toBeNull();
  });

  it('marks the checkout as processing while the transaction is created', () => {
    const state = reducer(initial(), { type: createTransaction.pending.type });

    expect(state.processing).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores the transaction and delivery once created', () => {
    const state = reducer(initial(), {
      type: createTransaction.fulfilled.type,
      payload: { transaction, delivery: { id: 'd1' } },
    });

    expect(state.transaction?.transactionId).toBe('tx-1');
    expect(state.amounts?.amountInCents).toBe(270_000);
  });

  it('surfaces a failure while creating the transaction', () => {
    const state = reducer(initial(), {
      type: createTransaction.rejected.type,
      error: { message: 'No stock' },
    });

    expect(state.error).toBe('No stock');
    expect(state.processing).toBe(false);
  });

  it('moves to the processing step while paying', () => {
    const state = reducer(initial(), { type: processPayment.pending.type });

    expect(state.step).toBe(CheckoutStep.PROCESSING);
  });

  it('lands on the result step once the payment resolves', () => {
    const state = reducer(initial(), {
      type: processPayment.fulfilled.type,
      payload: transaction,
    });

    expect(state.step).toBe(CheckoutStep.RESULT);
    expect(state.transaction?.status).toBe(TransactionStatus.APPROVED);
  });

  it('lands on the result step with the message when the payment fails', () => {
    const state = reducer(initial(), {
      type: processPayment.rejected.type,
      error: { message: 'Card declined' },
    });

    expect(state.step).toBe(CheckoutStep.RESULT);
    expect(state.error).toBe('Card declined');
  });
});
