import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SummaryBackdrop } from './SummaryBackdrop';
import { CardBrand } from '../../domain/enums';
import type { Product } from '../../domain/models';

const product: Product = {
  id: 'p1',
  name: 'Pro Running Shoes',
  description: 'Nice',
  priceInCents: 100_000,
  stock: 5,
  imageUrl: null,
};

const amounts = {
  productAmountInCents: 100_000,
  baseFeeInCents: 50_000,
  deliveryFeeInCents: 120_000,
  amountInCents: 270_000,
};

const renderBackdrop = (overrides: Partial<Parameters<typeof SummaryBackdrop>[0]> = {}) =>
  render(
    <SummaryBackdrop
      product={product}
      quantity={1}
      amounts={amounts}
      cardBrand={CardBrand.VISA}
      cardLastFour="4242"
      processing={false}
      onPay={jest.fn()}
      onBack={jest.fn()}
      {...overrides}
    />,
  );

describe('SummaryBackdrop', () => {
  it('breaks the total down into product, base fee and delivery', () => {
    renderBackdrop();

    expect(screen.getByText(/tarifa base/i)).toBeInTheDocument();
    expect(screen.getByText(/env[íi]o/i)).toBeInTheDocument();
    expect(screen.getByText(/^Total$/)).toBeInTheDocument();
    expect(screen.getByText(/2\.700/)).toBeInTheDocument();
  });

  it('shows the masked card', () => {
    renderBackdrop();

    expect(screen.getByText('•••• 4242')).toBeInTheDocument();
    expect(screen.getByLabelText('Visa')).toBeInTheDocument();
  });

  it('triggers the payment', async () => {
    const onPay = jest.fn();
    renderBackdrop({ onPay });

    await userEvent.click(screen.getByRole('button', { name: /pagar/i }));

    expect(onPay).toHaveBeenCalled();
  });

  it('locks both buttons while processing', () => {
    renderBackdrop({ processing: true });

    expect(screen.getByRole('button', { name: /procesando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /volver/i })).toBeDisabled();
  });

  it('goes back to the form', async () => {
    const onBack = jest.fn();
    renderBackdrop({ onBack });

    await userEvent.click(screen.getByRole('button', { name: /volver/i }));

    expect(onBack).toHaveBeenCalled();
  });
});
