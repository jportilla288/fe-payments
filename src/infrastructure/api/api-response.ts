/** Envelope every endpoint of the payments API responds with. */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details: Record<string, unknown> | null;
}

export interface ApiEnvelope<T> {
  readonly result: T | null;
  readonly totalItemsReturned: number;
  readonly totalItemsInDataBase: number;
  readonly errors: ApiError[];
  readonly isSuccess: boolean;
  readonly hasErrors: boolean;
}

/** Error carrying the backend's domain code, so the UI can react to it. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}
