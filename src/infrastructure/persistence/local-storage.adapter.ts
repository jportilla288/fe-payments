const CHECKOUT_STATE_KEY = 'spa_checkout_state';

export const localStorageAdapter = {
  saveCheckout<T>(state: T): void {
    try {
      localStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — fail silently.
    }
  },

  loadCheckout<T>(): T | null {
    try {
      const raw = localStorage.getItem(CHECKOUT_STATE_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  clearCheckout(): void {
    try {
      localStorage.removeItem(CHECKOUT_STATE_KEY);
    } catch {
      // Fail silently.
    }
  },
};
