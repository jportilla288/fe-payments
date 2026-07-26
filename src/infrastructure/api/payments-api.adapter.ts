import axios, { AxiosError } from 'axios';
import type {
  PaymentsApiPort,
  CreateTransactionInput,
  ProcessPaymentInput,
} from '../../application/ports/payments-api.port';
import type {
  Product,
  CheckoutResponse,
  TransactionResponse,
} from '../../domain/models';
import { ApiRequestError, type ApiEnvelope } from './api-response';
import { API_BASE_URL } from '../config/env';

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Unwraps the API envelope.
 *
 * The backend answers `{ result, errors, isSuccess, hasErrors, ... }` for both
 * successes and failures, so the failure path is read from `errors` rather than
 * from the HTTP status alone.
 */
function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.isSuccess || envelope.result === null) {
    const [first] = envelope.errors;
    throw new ApiRequestError(
      first?.message ?? 'The request could not be completed.',
      first?.code ?? 'UNKNOWN_ERROR',
      first?.details ?? null,
    );
  }
  return envelope.result;
}

/** Turns an Axios failure into the same ApiRequestError shape. */
function toApiError(error: unknown): never {
  if (error instanceof ApiRequestError) {
    throw error;
  }

  const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
  const envelope = axiosError.response?.data;
  const [first] = envelope?.errors ?? [];

  throw new ApiRequestError(
    first?.message ?? axiosError.message ?? 'Network error.',
    first?.code ?? 'NETWORK_ERROR',
    first?.details ?? null,
  );
}

export const paymentsApiAdapter: PaymentsApiPort = {
  async listProducts(): Promise<Product[]> {
    try {
      const { data } = await http.get<ApiEnvelope<Product[]>>('/products');
      return unwrap(data);
    } catch (error) {
      return toApiError(error);
    }
  },

  async getProduct(id: string): Promise<Product> {
    try {
      const { data } = await http.get<ApiEnvelope<Product>>(`/products/${id}`);
      return unwrap(data);
    } catch (error) {
      return toApiError(error);
    }
  },

  async createTransaction(
    input: CreateTransactionInput,
  ): Promise<CheckoutResponse> {
    try {
      const { data } = await http.post<ApiEnvelope<CheckoutResponse>>(
        '/transactions',
        input,
      );
      return unwrap(data);
    } catch (error) {
      return toApiError(error);
    }
  },

  async processPayment(
    transactionId: string,
    input: ProcessPaymentInput,
  ): Promise<TransactionResponse> {
    try {
      const { data } = await http.post<ApiEnvelope<TransactionResponse>>(
        `/transactions/${transactionId}/payment`,
        input,
      );
      return unwrap(data);
    } catch (error) {
      return toApiError(error);
    }
  },

  async getTransaction(id: string): Promise<TransactionResponse> {
    try {
      const { data } = await http.get<ApiEnvelope<TransactionResponse>>(
        `/transactions/${id}`,
      );
      return unwrap(data);
    } catch (error) {
      return toApiError(error);
    }
  },
};
