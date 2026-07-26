import { BASE_FEE_IN_CENTS, DELIVERY_FEE_IN_CENTS } from '../constants/fees';
import type { AmountBreakdown, Product } from '../models';

/**
 * Single source of truth for the price breakdown shown in the summary screen.
 * Mirrors the backend AmountCalculatorService.
 */
export class AmountCalculatorService {
  static calculate(product: Product, quantity: number): AmountBreakdown {
    const productAmountInCents = product.priceInCents * quantity;

    return {
      productAmountInCents,
      baseFeeInCents: BASE_FEE_IN_CENTS,
      deliveryFeeInCents: DELIVERY_FEE_IN_CENTS,
      amountInCents:
        productAmountInCents + BASE_FEE_IN_CENTS + DELIVERY_FEE_IN_CENTS,
    };
  }
}
