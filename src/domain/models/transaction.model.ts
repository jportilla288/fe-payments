export interface AmountBreakdown {
  readonly productAmountInCents: number;
  readonly baseFeeInCents: number;
  readonly deliveryFeeInCents: number;
  readonly amountInCents: number;
}

export interface TransactionResponse {
  readonly transactionId: string;
  readonly reference: string;
  readonly status: string;
  readonly paymentDescription: string;
  readonly quantity: number;
  readonly amounts: AmountBreakdown;
  readonly productId: string;
  readonly solicitedDate: string;
  readonly cardBrand: string | null;
  readonly cardLastFour: string | null;
  readonly statusMessage: string | null;
}

export interface DeliveryResponse {
  readonly id: string;
  readonly recipientName: string;
  readonly address: string;
  readonly city: string;
  readonly region: string;
  readonly country: string;
  readonly status: string;
}

export interface CheckoutResponse {
  readonly transaction: TransactionResponse;
  readonly delivery: DeliveryResponse;
}
