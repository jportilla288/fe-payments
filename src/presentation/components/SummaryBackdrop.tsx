import type { AmountBreakdown, Product } from '../../domain/models';
import { formatCurrency } from '../../domain/services';
import { CardBrandLogo } from './CardBrandLogo';
import type { CardBrand } from '../../domain/enums';

interface Props {
  readonly product: Product;
  readonly quantity: number;
  readonly amounts: AmountBreakdown;
  readonly cardBrand: CardBrand;
  readonly cardLastFour: string;
  readonly processing: boolean;
  readonly onPay: () => void;
  readonly onBack: () => void;
}

/**
 * Material backdrop: the summary rises over the catalogue as a front layer
 * while the product stays visible behind it.
 */
export function SummaryBackdrop({
  product,
  quantity,
  amounts,
  cardBrand,
  cardLastFour,
  processing,
  onPay,
  onBack,
}: Props) {
  return (
    <div className="backdrop">
      <div className="backdrop-back">
        <p className="backdrop-eyebrow">Tu compra</p>
        <p className="backdrop-title">{product.name}</p>
      </div>

      <section className="backdrop-front" aria-label="Resumen del pago">
        <div className="drag-handle" aria-hidden="true" />
        <h2>Resumen del pago</h2>

        <div className="summary-line">
          <span>
            {product.name} × {quantity}
          </span>
          <span>{formatCurrency(amounts.productAmountInCents)}</span>
        </div>
        <div className="summary-line">
          <span>Tarifa base</span>
          <span>{formatCurrency(amounts.baseFeeInCents)}</span>
        </div>
        <div className="summary-line">
          <span>Envío</span>
          <span>{formatCurrency(amounts.deliveryFeeInCents)}</span>
        </div>

        <div className="summary-line summary-total">
          <span>Total</span>
          <span>{formatCurrency(amounts.amountInCents)}</span>
        </div>

        <div className="summary-card">
          <CardBrandLogo brand={cardBrand} />
          <span>•••• {cardLastFour}</span>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onPay}
          disabled={processing}
        >
          {processing ? 'Procesando…' : `Pagar ${formatCurrency(amounts.amountInCents)}`}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={onBack}
          disabled={processing}
        >
          Volver
        </button>
      </section>
    </div>
  );
}
