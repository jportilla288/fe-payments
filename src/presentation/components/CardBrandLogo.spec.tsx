import { render, screen } from '@testing-library/react';
import { CardBrandLogo } from './CardBrandLogo';
import { CardBrand } from '../../domain/enums';

describe('CardBrandLogo', () => {
  it('renders the Visa badge', () => {
    render(<CardBrandLogo brand={CardBrand.VISA} />);

    expect(screen.getByLabelText('Visa')).toBeInTheDocument();
  });

  it('renders the Mastercard badge', () => {
    render(<CardBrandLogo brand={CardBrand.MASTERCARD} />);

    expect(screen.getByLabelText('Mastercard')).toBeInTheDocument();
  });

  it('renders nothing for an unknown brand', () => {
    const { container } = render(<CardBrandLogo brand={CardBrand.UNKNOWN} />);

    expect(container).toBeEmptyDOMElement();
  });
});
