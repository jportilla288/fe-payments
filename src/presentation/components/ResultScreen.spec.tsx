import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultScreen } from './ResultScreen';
import { TransactionStatus } from '../../domain/enums';
import type { TransactionResponse } from '../../domain/models';

const transaction = (status: string): TransactionResponse => ({
  transactionId: 'tx-1',
  reference: 'TX-REF-1',
  status,
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
});

describe('ResultScreen', () => {
  it('celebrates an approved payment and shows the reference', () => {
    render(
      <ResultScreen
        transaction={transaction(TransactionStatus.APPROVED)}
        error={null}
        onBackToProducts={jest.fn()}
      />,
    );

    expect(screen.getByText(/pago aprobado/i)).toBeInTheDocument();
    expect(screen.getByText('TX-REF-1')).toBeInTheDocument();
    expect(screen.getByText(/4242/)).toBeInTheDocument();
  });

  it('explains a declined payment', () => {
    render(
      <ResultScreen
        transaction={transaction(TransactionStatus.DECLINED)}
        error={null}
        onBackToProducts={jest.fn()}
      />,
    );

    expect(screen.getByText(/pago rechazado/i)).toBeInTheDocument();
  });

  it('shows the pending copy while the bank confirms', () => {
    render(
      <ResultScreen
        transaction={transaction(TransactionStatus.PENDING)}
        error={null}
        onBackToProducts={jest.fn()}
      />,
    );

    expect(screen.getByText(/en proceso/i)).toBeInTheDocument();
  });

  it('prefers the explicit error message when there is one', () => {
    render(
      <ResultScreen
        transaction={null}
        error="La pasarela no respondió"
        onBackToProducts={jest.fn()}
      />,
    );

    expect(screen.getByText('La pasarela no respondió')).toBeInTheDocument();
  });

  it('returns to the catalogue', async () => {
    const onBack = jest.fn();
    render(
      <ResultScreen
        transaction={transaction(TransactionStatus.APPROVED)}
        error={null}
        onBackToProducts={onBack}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /volver a la tienda/i }));

    expect(onBack).toHaveBeenCalled();
  });
});
