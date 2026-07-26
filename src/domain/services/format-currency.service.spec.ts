import { formatCurrency } from './format-currency.service';

describe('formatCurrency', () => {
  it('renders cents as Colombian pesos without decimals', () => {
    const formatted = formatCurrency(25_900_000);

    expect(formatted).toContain('259.000');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });
});
