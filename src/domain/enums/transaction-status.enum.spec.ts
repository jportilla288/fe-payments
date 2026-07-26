import { TransactionStatus, isFinalStatus } from './transaction-status.enum';

describe('isFinalStatus', () => {
  it.each([
    [TransactionStatus.APPROVED, true],
    [TransactionStatus.DECLINED, true],
    [TransactionStatus.VOIDED, true],
    [TransactionStatus.ERROR, true],
    [TransactionStatus.PENDING, false],
  ])('reports %s as final=%s', (status, expected) => {
    expect(isFinalStatus(status)).toBe(expected);
  });
});
