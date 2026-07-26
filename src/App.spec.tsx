jest.mock('./presentation/pages/CheckoutPage', () => ({
  CheckoutPage: () => <div>checkout</div>,
}));

import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the checkout page', () => {
    render(<App />);

    expect(screen.getByText('checkout')).toBeInTheDocument();
  });
});
