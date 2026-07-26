import { AmountCalculatorService } from './amount-calculator.service';
import { BASE_FEE_IN_CENTS, DELIVERY_FEE_IN_CENTS } from '../constants/fees';
import type { Product } from '../models';

const product: Product = {
  id: 'p1',
  name: 'Shoes',
  description: 'Nice',
  priceInCents: 100_000,
  stock: 10,
  imageUrl: null,
};

describe('AmountCalculatorService', () => {
  it('adds both fees to the product amount', () => {
    const amounts = AmountCalculatorService.calculate(product, 1);

    expect(amounts.productAmountInCents).toBe(100_000);
    expect(amounts.baseFeeInCents).toBe(BASE_FEE_IN_CENTS);
    expect(amounts.deliveryFeeInCents).toBe(DELIVERY_FEE_IN_CENTS);
    expect(amounts.amountInCents).toBe(
      100_000 + BASE_FEE_IN_CENTS + DELIVERY_FEE_IN_CENTS,
    );
  });

  it('multiplies by quantity but charges the fees once', () => {
    const amounts = AmountCalculatorService.calculate(product, 3);

    expect(amounts.productAmountInCents).toBe(300_000);
    expect(amounts.baseFeeInCents).toBe(BASE_FEE_IN_CENTS);
  });
});
