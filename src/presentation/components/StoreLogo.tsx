/**
 * Inline SVG logo: renders instantly with no network request, and scales to any
 * size without losing sharpness.
 */
export function StoreLogo() {
  return (
    <svg
      className="store-logo"
      viewBox="0 0 56 56"
      role="img"
      aria-label="Logo de Tienda Virtual JAPL"
    >
      <title>Tienda Virtual JAPL</title>
      <rect x="2" y="2" width="52" height="52" rx="14" className="logo-plate" />
      <path
        d="M17 20h22l-2.6 15.4a4 4 0 0 1-3.95 3.35h-8.9a4 4 0 0 1-3.95-3.35L17 20Z"
        className="logo-bag"
      />
      <path
        d="M23 22v-3a5 5 0 0 1 10 0v3"
        className="logo-handle"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <text x="28" y="34" textAnchor="middle" className="logo-text">
        JAPL
      </text>
    </svg>
  );
}
