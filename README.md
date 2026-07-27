# spa-checkout

Single page application for a one-product credit-card checkout. Built with
**React 19 + TypeScript + Vite**, state managed with **Redux Toolkit** following
Flux principles, and a hexagonal folder structure that mirrors the backend.

> **Live app: <https://fe-payments.onrender.com>**
> Backend API: [`ms-payments`](https://github.com/jportilla288/ms-payments) —
> live at <https://ms-payments-1.onrender.com/api>
> ([Swagger](https://ms-payments-1.onrender.com/api/docs))

---

## The 5-step flow

1. **Product page** — catalogue with live stock, description and price.
2. **Card and delivery** — modal with card validation and shipping details.
3. **Summary** — Material-style backdrop with the amount breakdown.
4. **Processing / result** — outcome of the transaction.
5. **Back to the product page** with the stock already updated.

The flow is a state machine inside the `checkout` slice, so the UI never holds
navigation logic of its own.

## Architecture

```
src/
├── domain/            # Pure business rules: models, enums, services
│   ├── models/
│   ├── enums/
│   ├── constants/
│   └── services/      # Luhn, brand detection, fee breakdown, currency
│
├── application/       # Flux layer
│   ├── store/         # Redux Toolkit slices and thunks
│   ├── ports/         # Outbound contract with the API
│   └── hooks/         # Typed useDispatch / useSelector
│
├── infrastructure/    # Adapters
│   ├── api/           # Axios adapter + response envelope
│   ├── persistence/   # localStorage adapter
│   └── config/        # Build-time environment
│
└── presentation/      # React components, pages and styles
```

## Resilience and security

- The checkout state is persisted to `localStorage` on every step, so a browser
  refresh restores the customer's progress.
- **Card number and CVC are never persisted.** `persistState` strips them before
  writing, and there is a unit test asserting that they never reach storage.
- Card data lives in memory only for the duration of the payment request.

## Responsive design

Mobile-first, built with CSS Grid and Flexbox, no CSS framework.

| Breakpoint | Layout            |
| ---------- | ----------------- |
| < 640px    | single column     |
| ≥ 640px    | two columns       |
| ≥ 960px    | three columns     |

Reference device: iPhone SE (375 CSS px wide). Inputs use `font-size: 16px` to
prevent iOS zoom-on-focus, and every interactive target is at least 44px tall.

## Getting started

```bash
npm install
cp .env.example .env    # point VITE_API_BASE_URL at your API
npm run dev             # http://localhost:5173
```

| Variable            | Description                          |
| ------------------- | ------------------------------------ |
| `VITE_API_BASE_URL` | Base URL of the API, no trailing slash |

## Testing

```bash
npm test          # unit tests
npm run test:cov  # coverage report
```

**Result: 96 tests across 16 suites, all passing.**

| Metric     | Coverage | Threshold |
| ---------- | -------- | --------- |
| Statements | 92.89%   | 80%       |
| Branches   | 85.87%   | 70%       |
| Functions  | 90.21%   | 80%       |
| Lines      | 92.47%   | 80%       |

Jest enforces these thresholds, so the pipeline fails if coverage drops.

Covered: domain services (Luhn, brand detection, fees), the Redux slices
including every thunk state, the API adapter and its error mapping, the
localStorage adapter, and the components through Testing Library — including a
full happy path from catalogue to approved payment.

## Deployment

| Component | Provider | URL                                           |
| --------- | -------- | --------------------------------------------- |
| SPA       | Render   | <https://fe-payments.onrender.com>            |
| API       | Render   | <https://ms-payments-1.onrender.com/api>      |
| Swagger   | Render   | <https://ms-payments-1.onrender.com/api/docs> |

Built with `npm ci && npm run build`, published from `dist`, with a
`/* → /index.html` rewrite so client-side routes survive a page refresh.
`VITE_API_BASE_URL` is injected at build time.

### Notes for reviewers

- **Cold start.** The API runs on Render's free tier and sleeps after 15 minutes
  idle. The first load of a session may take ~50 seconds while it wakes up; the
  catalogue will appear once it does.
- **Test cards.** `4242 4242 4242 4242` (VISA) and `5555 5555 5555 4444`
  (Mastercard). The brand logo appears as you type. A random number is rejected
  by the Luhn checksum.
- **Mobile first.** Best viewed at 375px wide (iPhone SE). Use the browser's
  device toolbar to check the responsive behaviour.
- **Refresh resilience.** Start a checkout, reload the page mid-flow, and the
  progress is restored from `localStorage` — without the card data.
