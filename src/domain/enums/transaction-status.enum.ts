export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  VOIDED = 'VOIDED',
  ERROR = 'ERROR',
}

export const FINAL_STATUSES: ReadonlySet<string> = new Set([
  TransactionStatus.APPROVED,
  TransactionStatus.DECLINED,
  TransactionStatus.VOIDED,
  TransactionStatus.ERROR,
]);

export const isFinalStatus = (status: string): boolean =>
  FINAL_STATUSES.has(status);
