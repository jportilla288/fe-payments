import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../application/hooks';
import { fetchProducts } from '../../application/store/products/productsSlice';
import {
  CheckoutStep,
  createTransaction,
  goBack,
  goToSummary,
  processPayment,
  resetCheckout,
  restoreCheckout,
  selectProduct,
  setCardData,
  setCustomerData,
  setDeliveryData,
  setError,
} from '../../application/store/checkout/checkoutSlice';
import type { CheckoutState } from '../../application/store/checkout/checkoutSlice';
import { localStorageAdapter } from '../../infrastructure/persistence/local-storage.adapter';
import { CardBrandService } from '../../domain/services';
import type { Product } from '../../domain/models';
import { ProductCard } from '../components/ProductCard';
import { StoreLogo } from '../components/StoreLogo';
import { PaymentModal } from '../components/PaymentModal';
import { SummaryBackdrop } from '../components/SummaryBackdrop';
import { ProcessingScreen } from '../components/ProcessingScreen';
import { ResultScreen } from '../components/ResultScreen';

export function CheckoutPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error: productsError } = useAppSelector((s) => s.products);
  const checkout = useAppSelector((s) => s.checkout);

  // Resilience: rebuild the checkout the user had in flight before a refresh.
  useEffect(() => {
    const saved = localStorageAdapter.loadCheckout<Partial<CheckoutState>>();
    if (saved && saved.step && saved.step !== CheckoutStep.PRODUCT_SELECTION) {
      dispatch(restoreCheckout(saved));
    }
    void dispatch(fetchProducts());
  }, [dispatch]);

  const handleBuy = useCallback(
    (product: Product) => {
      dispatch(selectProduct({ product, quantity: 1 }));
    },
    [dispatch],
  );

  const handlePay = useCallback(async () => {
    try {
      await dispatch(createTransaction()).unwrap();
      await dispatch(processPayment()).unwrap();
    } catch (cause) {
      dispatch(setError((cause as Error).message ?? 'No se pudo completar el pago'));
    }
  }, [dispatch]);

  const handleFinish = useCallback(() => {
    dispatch(resetCheckout());
    void dispatch(fetchProducts());
  }, [dispatch]);

  if (checkout.step === CheckoutStep.PROCESSING) {
    return <ProcessingScreen />;
  }

  if (checkout.step === CheckoutStep.RESULT) {
    return (
      <ResultScreen
        transaction={checkout.transaction}
        error={checkout.error}
        onBackToProducts={handleFinish}
      />
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <StoreLogo />
        <div>
          <h1>Tienda Virtual JAPL</h1>
          <p className="muted">Elige un producto y paga con tarjeta.</p>
        </div>
      </header>

      {loading && <p className="muted">Cargando productos…</p>}
      {productsError && <p className="banner-error">{productsError}</p>}

      <div className="product-grid">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} onBuy={handleBuy} />
        ))}
      </div>

      {checkout.step === CheckoutStep.CARD_DELIVERY && (
        <PaymentModal
          onClose={() => dispatch(goBack())}
          onSubmit={({ card, cardNumber, customer, delivery }) => {
            dispatch(setCustomerData(customer));
            dispatch(setDeliveryData(delivery));
            dispatch(setCardData({ card, cardNumber }));
            dispatch(goToSummary());
          }}
        />
      )}

      {checkout.step === CheckoutStep.SUMMARY &&
        checkout.selectedProduct &&
        checkout.amounts && (
          <SummaryBackdrop
            product={checkout.selectedProduct}
            quantity={checkout.quantity}
            amounts={checkout.amounts}
            cardBrand={CardBrandService.detectBrand(checkout.cardNumber)}
            cardLastFour={CardBrandService.lastFour(checkout.cardNumber)}
            processing={checkout.processing}
            onPay={() => void handlePay()}
            onBack={() => dispatch(goBack())}
          />
        )}
    </main>
  );
}
