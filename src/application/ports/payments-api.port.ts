import type {
  Product,
  CheckoutResponse,
  TransactionResponse,
} from '../../domain/models';
import type { CustomerInput } from '../../domain/models/customer.model';
import type { DeliveryInput } from '../../domain/models/delivery.model';
import type { CardInput } from '../../domain/models/card.model';

/**
 * Outbound port — defines how the application talks to the payments API.
 * Any adapter (Axios, fetch, mock) can satisfy this contract.
 */
export interface CreateTransactionInput {
  readonly productId: string;
  readonly quantity: number;
  readonly customer: CustomerInput;
  readonly delivery: DeliveryInput;
  readonly cardNumber: string;
}

export interface ProcessPaymentInput {
  readonly card: CardInput;
  readonly installments: number;
}

export interface PaymentsApiPort {
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product>;
  createTransaction(input: CreateTransactionInput): Promise<CheckoutResponse>;
  processPayment(
    transactionId: string,
    input: ProcessPaymentInput,
  ): Promise<TransactionResponse>;
  getTransaction(id: string): Promise<TransactionResponse>;
}
