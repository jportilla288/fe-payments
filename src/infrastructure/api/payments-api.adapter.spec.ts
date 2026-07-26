jest.mock('axios', () => {
  const instance = { get: jest.fn(), post: jest.fn() };
  return {
    __esModule: true,
    default: { create: jest.fn(() => instance) },
    AxiosError: class AxiosErrorMock extends Error {},
    __instance: instance,
  };
});

import * as axiosModule from 'axios';
import { paymentsApiAdapter } from './payments-api.adapter';
import { ApiRequestError, type ApiEnvelope } from './api-response';
import type { Product } from '../../domain/models';

const { __instance: http } = axiosModule as unknown as {
  __instance: { get: jest.Mock; post: jest.Mock };
};

const product: Product = {
  id: 'p1',
  name: 'Shoes',
  description: 'Nice',
  priceInCents: 100_000,
  stock: 5,
  imageUrl: null,
};

const success = <T>(result: T): { data: ApiEnvelope<T> } => ({
  data: {
    result,
    totalItemsReturned: Array.isArray(result) ? result.length : 1,
    totalItemsInDataBase: 1,
    errors: [],
    isSuccess: true,
    hasErrors: false,
  },
});

const failure = (code: string, message: string) => ({
  data: {
    result: null,
    totalItemsReturned: 0,
    totalItemsInDataBase: 0,
    errors: [{ code, message, details: null }],
    isSuccess: false,
    hasErrors: true,
  },
});

describe('paymentsApiAdapter', () => {
  beforeEach(() => {
    http.get.mockReset();
    http.post.mockReset();
  });

  it('unwraps the result field of the envelope', async () => {
    http.get.mockResolvedValue(success([product]));

    await expect(paymentsApiAdapter.listProducts()).resolves.toEqual([product]);
    expect(http.get).toHaveBeenCalledWith('/products');
  });

  it('reads a single product', async () => {
    http.get.mockResolvedValue(success(product));

    await expect(paymentsApiAdapter.getProduct('p1')).resolves.toEqual(product);
    expect(http.get).toHaveBeenCalledWith('/products/p1');
  });

  it('turns an unsuccessful envelope into an ApiRequestError', async () => {
    http.get.mockResolvedValue(failure('PRODUCT_NOT_FOUND', 'Product missing'));

    await expect(paymentsApiAdapter.getProduct('nope')).rejects.toBeInstanceOf(
      ApiRequestError,
    );
  });

  it('keeps the domain code of the failure', async () => {
    http.get.mockResolvedValue(failure('INSUFFICIENT_STOCK', 'No stock'));

    await expect(paymentsApiAdapter.listProducts()).rejects.toMatchObject({
      code: 'INSUFFICIENT_STOCK',
      message: 'No stock',
    });
  });

  it('reads the error out of an HTTP failure response', async () => {
    http.post.mockRejectedValue({
      message: 'Request failed',
      response: failure('INVALID_CARD', 'Card rejected'),
    });

    await expect(
      paymentsApiAdapter.createTransaction({
        productId: 'p1',
        quantity: 1,
        customer: {} as never,
        delivery: {} as never,
        cardNumber: '4242424242424242',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_CARD' });
  });

  it('falls back to NETWORK_ERROR when there is no response body', async () => {
    http.get.mockRejectedValue({ message: 'Network Error' });

    await expect(paymentsApiAdapter.listProducts()).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });

  it('posts the payment to the transaction endpoint', async () => {
    const transaction = { transactionId: 'tx-1', status: 'APPROVED' };
    http.post.mockResolvedValue(success(transaction));

    await expect(
      paymentsApiAdapter.processPayment('tx-1', {
        card: {
          number: '4242424242424242',
          cvc: '123',
          expMonth: '08',
          expYear: '29',
          cardHolder: 'JANE DOE',
        },
        installments: 1,
      }),
    ).resolves.toEqual(transaction);

    expect(http.post).toHaveBeenCalledWith(
      '/transactions/tx-1/payment',
      expect.objectContaining({ installments: 1 }),
    );
  });

  it('reads a transaction by id', async () => {
    http.get.mockResolvedValue(success({ transactionId: 'tx-1' }));

    await expect(paymentsApiAdapter.getTransaction('tx-1')).resolves.toEqual({
      transactionId: 'tx-1',
    });
    expect(http.get).toHaveBeenCalledWith('/transactions/tx-1');
  });
});
