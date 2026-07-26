import { localStorageAdapter } from './local-storage.adapter';

describe('localStorageAdapter', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a checkout snapshot', () => {
    localStorageAdapter.saveCheckout({ step: 'SUMMARY', quantity: 2 });

    expect(localStorageAdapter.loadCheckout()).toEqual({
      step: 'SUMMARY',
      quantity: 2,
    });
  });

  it('returns null when nothing was stored', () => {
    expect(localStorageAdapter.loadCheckout()).toBeNull();
  });

  it('returns null when the stored value is corrupted', () => {
    localStorage.setItem('spa_checkout_state', '{not json');

    expect(localStorageAdapter.loadCheckout()).toBeNull();
  });

  it('clears the snapshot', () => {
    localStorageAdapter.saveCheckout({ step: 'SUMMARY' });
    localStorageAdapter.clearCheckout();

    expect(localStorageAdapter.loadCheckout()).toBeNull();
  });

  it('fails silently when storage throws', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(() => localStorageAdapter.saveCheckout({ a: 1 })).not.toThrow();

    spy.mockRestore();
  });
});
