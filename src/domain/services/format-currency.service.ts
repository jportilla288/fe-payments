import { CURRENCY } from '../constants/fees';

/**
 * Formats an amount in cents (COP) to a human-readable currency string.
 */
export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}
