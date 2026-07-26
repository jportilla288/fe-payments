import type { Product } from '../../domain/models';
import { formatCurrency } from '../../domain/services';

interface Props {
  readonly product: Product;
  readonly onBuy: (product: Product) => void;
}

export function ProductCard({ product, onBuy }: Props) {
  const soldOut = product.stock <= 0;

  return (
    <article className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            width={400}
            height={260}
          />
        ) : (
          <div className="product-image-fallback" aria-hidden="true" />
        )}
        <span className={soldOut ? 'stock-badge out' : 'stock-badge'}>
          {soldOut ? 'Sin stock' : `${product.stock} disponibles`}
        </span>
      </div>

      <div className="product-body">
        <h2 className="product-name">{product.name}</h2>
        <p className="product-description">{product.description}</p>
        <p className="product-price">{formatCurrency(product.priceInCents)}</p>

        <button
          type="button"
          className="btn btn-primary"
          disabled={soldOut}
          onClick={() => onBuy(product)}
        >
          Pagar con tarjeta de crédito
        </button>
      </div>
    </article>
  );
}
