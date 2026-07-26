import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';
import type { Product } from '../../domain/models';

const product: Product = {
  id: 'p1',
  name: 'Pro Running Shoes',
  description: 'Lightweight training shoes',
  priceInCents: 25_900_000,
  stock: 5,
  imageUrl: 'https://example.com/shoes.jpg',
};

describe('ProductCard', () => {
  it('shows name, description, price and available stock', () => {
    render(<ProductCard product={product} onBuy={jest.fn()} />);

    expect(screen.getByText('Pro Running Shoes')).toBeInTheDocument();
    expect(screen.getByText('Lightweight training shoes')).toBeInTheDocument();
    expect(screen.getByText(/259\.000/)).toBeInTheDocument();
    expect(screen.getByText('5 disponibles')).toBeInTheDocument();
  });

  it('lazy-loads the image with an accessible name', () => {
    render(<ProductCard product={product} onBuy={jest.fn()} />);

    const image = screen.getByAltText('Pro Running Shoes');

    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('calls onBuy with the product', async () => {
    const onBuy = jest.fn();
    render(<ProductCard product={product} onBuy={onBuy} />);

    await userEvent.click(screen.getByRole('button', { name: /pagar con tarjeta/i }));

    expect(onBuy).toHaveBeenCalledWith(product);
  });

  it('disables the button when there is no stock', () => {
    render(<ProductCard product={{ ...product, stock: 0 }} onBuy={jest.fn()} />);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
  });

  it('renders a placeholder when the product has no image', () => {
    render(<ProductCard product={{ ...product, imageUrl: null }} onBuy={jest.fn()} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
