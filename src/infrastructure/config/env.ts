/**
 * Build-time configuration.
 *
 * Isolated in its own module so tests can stub it: `import.meta` is ESM-only
 * syntax and would break under the CommonJS transform Jest uses.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
