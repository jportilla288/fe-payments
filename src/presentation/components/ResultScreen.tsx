import { TransactionStatus } from '../../domain/enums';
import type { TransactionResponse } from '../../domain/models';
import { formatCurrency } from '../../domain/services';

interface Props {
  readonly transaction: TransactionResponse | null;
  readonly error: string | null;
  readonly onBackToProducts: () => void;
}

const COPY: Record<string, { title: string; detail: string; tone: string }> = {
  [TransactionStatus.APPROVED]: {
    title: '¡Pago aprobado!',
    detail: 'Tu pedido fue confirmado y ya está en preparación.',
    tone: 'ok',
  },
  [TransactionStatus.DECLINED]: {
    title: 'Pago rechazado',
    detail: 'Tu banco no autorizó la transacción. Intenta con otra tarjeta.',
    tone: 'bad',
  },
  [TransactionStatus.VOIDED]: {
    title: 'Pago anulado',
    detail: 'La transacción fue cancelada antes de completarse.',
    tone: 'bad',
  },
  [TransactionStatus.ERROR]: {
    title: 'No pudimos procesar el pago',
    detail: 'Ocurrió un problema con la pasarela. No se realizó ningún cobro.',
    tone: 'bad',
  },
  [TransactionStatus.PENDING]: {
    title: 'Pago en proceso',
    detail: 'Estamos esperando la confirmación de tu banco.',
    tone: 'pending',
  },
};

export function ResultScreen({ transaction, error, onBackToProducts }: Props) {
  const status = transaction?.status ?? TransactionStatus.ERROR;
  const copy = COPY[status] ?? COPY[TransactionStatus.ERROR];

  return (
    <section className={`centered-state result-${copy.tone}`}>
      <div className="result-icon" aria-hidden="true">
        {copy.tone === 'ok' ? '✓' : copy.tone === 'pending' ? '…' : '✕'}
      </div>

      <h2>{copy.title}</h2>
      <p className="muted">{error ?? copy.detail}</p>

      {transaction && (
        <dl className="result-details">
          <div>
            <dt>Referencia</dt>
            <dd>{transaction.reference}</dd>
          </div>
          <div>
            <dt>Producto</dt>
            <dd>{transaction.paymentDescription}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatCurrency(transaction.amounts.amountInCents)}</dd>
          </div>
          {transaction.cardLastFour && (
            <div>
              <dt>Tarjeta</dt>
              <dd>
                {transaction.cardBrand} •••• {transaction.cardLastFour}
              </dd>
            </div>
          )}
        </dl>
      )}

      <button type="button" className="btn btn-primary" onClick={onBackToProducts}>
        Volver a la tienda
      </button>
    </section>
  );
}
