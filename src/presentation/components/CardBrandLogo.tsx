import { CardBrand } from '../../domain/enums';

interface Props {
  readonly brand: CardBrand;
}

/** Inline SVG badges so the brand renders instantly, with no network request. */
export function CardBrandLogo({ brand }: Props) {
  if (brand === CardBrand.VISA) {
    return (
      <svg viewBox="0 0 48 16" className="brand-logo" role="img" aria-label="Visa">
        <title>Visa</title>
        <text x="0" y="13" className="brand-visa">
          VISA
        </text>
      </svg>
    );
  }

  if (brand === CardBrand.MASTERCARD) {
    return (
      <svg viewBox="0 0 48 30" className="brand-logo" role="img" aria-label="Mastercard">
        <title>Mastercard</title>
        <circle cx="18" cy="15" r="11" className="mc-left" />
        <circle cx="30" cy="15" r="11" className="mc-right" />
      </svg>
    );
  }

  return null;
}
