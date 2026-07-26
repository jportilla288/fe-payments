jest.mock('../../infrastructure/api/payments-api.adapter', () => ({
  paymentsApiAdapter: {
    listProducts: jest.fn(),
    getProduct: jest.fn(),
    createTransaction: jest.fn(),
    processPayment: jest.fn(),
    getTransaction: jest.fn(),
  },
}));

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutPage } from './CheckoutPage';
import { paymentsApiAdapter } from '../../infrastructure/api/payments-api.adapter';
import { renderWithStore } from '../../test-support/render-with-store';
import { TransactionStatus } from '../../domain/enums';
import type { Product } from '../../domain/models';

const api = paymentsApiAdapter as jest.Mocked<typeof paymentsApiAdapter>;

const product: Product = {
  id: 'p1',
  name: 'Pro Running Shoes',
  description: 'Lightweight training shoes',
  priceInCents: 100_000,
  stock: 5,
  imageUrl: null,
};

const transaction = (status: string) => ({
  transactionId: 'tx-1',
  reference: 'TX-REF-1',
  status,
  paymentDescription: 'Pro Running Shoes x1',
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
});

const fillForm = async () => {
  await userEvent.type(screen.getByLabelText(/número de tarjeta/i), '4242424242424242');
  await userEvent.type(screen.getByLabelText(/titular/i), 'Jenny Portilla');
  await userEvent.type(screen.getByLabelText(/^mes$/i), '10');
  await userEvent.type(screen.getByLabelText(/^año$/i), '29');
  await userEvent.type(screen.getByLabelText(/^cvc$/i), '153');
  await userEvent.type(screen.getByLabelText(/nombre completo/i), 'Jenny Portilla');
  await userEvent.type(screen.getByLabelText(/correo/i), 'jenny@example.com');
  await userEvent.type(screen.getByLabelText(/^documento$/i), '1098765432');
  await userEvent.type(screen.getByLabelText(/teléfono/i), '3153710623');
  await userEvent.type(screen.getByLabelText(/dirección/i), 'Diagonal 7 #19a-18');
  await userEvent.type(screen.getByLabelText(/ciudad/i), 'Bucaramanga');
  await userEvent.type(screen.getByLabelText(/departamento/i), 'Santander');
  await userEvent.click(screen.getByRole('button', { name: /continuar al resumen/i }));
};

describe('CheckoutPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    api.listProducts.mockResolvedValue([product]);
  });

  it('loads and lists the catalogue', async () => {
    renderWithStore(<CheckoutPage />);

    expect(await screen.findByText('Pro Running Shoes')).toBeInTheDocument();
    expect(api.listProducts).toHaveBeenCalled();
  });

  it('shows the error banner when the catalogue cannot be loaded', async () => {
    api.listProducts.mockRejectedValue(new Error('Network Error'));

    renderWithStore(<CheckoutPage />);

    expect(await screen.findByText('Network Error')).toBeInTheDocument();
  });

  it('opens the payment modal from a product', async () => {
    renderWithStore(<CheckoutPage />);

    await userEvent.click(
      await screen.findByRole('button', { name: /pagar con tarjeta/i }),
    );

    expect(screen.getByRole('dialog', { name: /datos de pago/i })).toBeInTheDocument();
  });

  it('walks the whole happy path down to an approved payment', async () => {
    api.createTransaction.mockResolvedValue({
      transaction: transaction(TransactionStatus.PENDING),
      delivery: {
        id: 'd1',
        recipientName: 'Jenny Portilla',
        address: 'Diagonal 7',
        city: 'Bucaramanga',
        region: 'Santander',
        country: 'CO',
        status: 'PENDING',
      },
    });
    api.processPayment.mockResolvedValue(transaction(TransactionStatus.APPROVED));

    renderWithStore(<CheckoutPage />);

    await userEvent.click(
      await screen.findByRole('button', { name: /pagar con tarjeta/i }),
    );
    await fillForm();

    expect(await screen.findByText(/resumen del pago/i)).toBeInTheDocument();
    expect(screen.getByText(/tarifa base/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^pagar \$/i }));

    expect(await screen.findByText(/pago aprobado/i)).toBeInTheDocument();
    expect(api.createTransaction).toHaveBeenCalledTimes(1);
    expect(api.processPayment).toHaveBeenCalledTimes(1);
  });

  it('shows the failure on the result screen when the gateway rejects', async () => {
    api.createTransaction.mockResolvedValue({
      transaction: transaction(TransactionStatus.PENDING),
      delivery: {
        id: 'd1',
        recipientName: 'Jenny Portilla',
        address: 'Diagonal 7',
        city: 'Bucaramanga',
        region: 'Santander',
        country: 'CO',
        status: 'PENDING',
      },
    });
    api.processPayment.mockRejectedValue(new Error('Card declined'));

    renderWithStore(<CheckoutPage />);

    await userEvent.click(
      await screen.findByRole('button', { name: /pagar con tarjeta/i }),
    );
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /^pagar \$/i }));

    expect(await screen.findByText('Card declined')).toBeInTheDocument();
  });

  it('closes the modal and returns to the catalogue', async () => {
    renderWithStore(<CheckoutPage />);

    await userEvent.click(
      await screen.findByRole('button', { name: /pagar con tarjeta/i }),
    );
    await userEvent.click(screen.getByRole('button', { name: /cerrar/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('restores an in-flight checkout after a refresh', async () => {
    localStorage.setItem(
      'spa_checkout_state',
      JSON.stringify({
        step: 'SUMMARY',
        selectedProduct: product,
        quantity: 1,
        amounts: {
          productAmountInCents: 100_000,
          baseFeeInCents: 50_000,
          deliveryFeeInCents: 120_000,
          amountInCents: 270_000,
        },
      }),
    );

    renderWithStore(<CheckoutPage />);

    expect(await screen.findByText(/resumen del pago/i)).toBeInTheDocument();
  });

  it('reloads the catalogue when returning from the result screen', async () => {
    api.createTransaction.mockResolvedValue({
      transaction: transaction(TransactionStatus.PENDING),
      delivery: {
        id: 'd1',
        recipientName: 'Jenny Portilla',
        address: 'Diagonal 7',
        city: 'Bucaramanga',
        region: 'Santander',
        country: 'CO',
        status: 'PENDING',
      },
    });
    api.processPayment.mockResolvedValue(transaction(TransactionStatus.APPROVED));

    renderWithStore(<CheckoutPage />);

    await userEvent.click(
      await screen.findByRole('button', { name: /pagar con tarjeta/i }),
    );
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /^pagar \$/i }));
    await screen.findByText(/pago aprobado/i);

    await userEvent.click(screen.getByRole('button', { name: /volver a la tienda/i }));

    await waitFor(() => {
      expect(api.listProducts).toHaveBeenCalledTimes(2);
    });
  });
});
