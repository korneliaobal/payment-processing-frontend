# ObalFlow — Payment Operations

A portfolio application that simulates a bank employee's payment workspace. Operators create a batch payment, review the recipients and amounts, and inspect real validation results from an event-driven backend.

The interface is in Polish. Documentation, identifiers, and code comments are in English. This is a demonstration system: it validates payment data and does not execute bank transfers.

## Local development

Requirements:

- Node.js supported by Angular 22: 22.22.3+, 24.15.0+, or 26.0.0+.
- npm.
- Docker Desktop and the backend services running alongside this repository.

Start the backend from the sibling `payment-api-service` directory:

```bash
cd ../payment-api-service
docker compose up -d --build
```

Start the frontend in a separate terminal:

```bash
cd payment-processing-frontend
npm ci
npm start
```

If you use nvm, run `nvm use` in the frontend directory to select the version pinned in `.nvmrc`. The package also declares the supported Node.js range.

The frontend path above is relative to the workspace root. Open http://localhost:4200. The application opens on the operator dashboard. Start a new payment to open the form; its example-data button fills the fields with demonstration data.

## Payment workflow

1. Enter a sender, currency, and one to five recipients. Sender and recipient accounts require valid Polish IBAN/NRB format and a MOD-97 checksum; spaces and lowercase input are accepted. National NRB values are converted to `PL` IBAN for upload.
2. Review the payment before submitting it.
3. The frontend calculates the transaction count and total using integer minor units, builds a JSON document, and uploads it as `payment.json` through the existing multipart API.
4. The backend validates the input and starts processing through Kafka.
5. The frontend polls the orchestrator every 1.5 seconds for up to 90 seconds. A retry resumes status checks without uploading the payment again.

Amounts greater than zero and at most five pass the frontend and API input validation but fail Transaction Checker business validation. Use this to demonstrate a real `NOT_OK` result.

A successful upload confirms acceptance for processing, not successful validation. Statuses and rejection codes are read from the backend. The UI translates known reason codes and displays unknown codes explicitly. Older rejected records without saved reasons show that the details are unavailable.

## Routes

| Route                  | View                                                  |
| ---------------------- | ----------------------------------------------------- |
| `/home`                | Operator dashboard and recent payments                |
| `/payments/new`        | Payment form                                          |
| `/payments/review`     | Review before submission                              |
| `/payments/history`    | Database history with status filtering and pagination |
| `/payments/:paymentId` | Payment and transaction validation results            |
| `/` and unknown routes | Redirect to the operator dashboard                    |

Pages and feature routes are loaded on demand. Review requires a valid draft. After submission, returning to previous steps redirects to the accepted payment, preventing accidental resubmission. The new-payment action starts a fresh draft.

Drafts and accepted payment details are stored in the current tab's `sessionStorage`, so refresh preserves the workflow. Storage entries are validated before use, with an in-memory fallback when browser storage is unavailable.

Direct result links work without a local draft. The status endpoint returns persisted recipient names, amounts, currency, and rejection reasons for new payments. Cached upload details remain a fallback while processing. Legacy rows without stored metadata use explicit placeholders. History comes from PostgreSQL and survives closing the browser or restarting containers while the database volume remains intact.

## Source structure

```text
src/app/
├── app.*                         # Workspace shell and root routes
├── config/                       # Workspace routes and page headings
├── models/                       # Workspace presentation types
├── core/
│   ├── models/                   # Generic async resource contracts
│   ├── services/                 # Generic browser storage
│   └── state/                    # Shared async loading and cancellation
├── shared/
│   ├── components/               # Panel, alert, stepper, status badge, metric card
│   ├── directives/               # Bank account form validator
│   ├── models/                   # Shared UI types
│   └── utils/                    # General-purpose helpers
└── features/
    ├── home/
    │   ├── config/               # Dashboard metric definitions
    │   ├── models/               # Dashboard data and presentation types
    │   ├── pages/                # Operator dashboard
    │   ├── services/             # Database overview loading
    │   └── testing/              # Dashboard fixtures and tests
    └── payments/
        ├── components/           # Recipient editor, summary, result banner, validation row
        ├── config/               # Limits, endpoints, messages, status presentation
        ├── data/                 # Demonstration data
        ├── guards/               # Workflow navigation rules
        ├── models/               # Draft, API contracts, and view models
        ├── pages/                # Form, review, result, and history pages
        ├── services/             # Draft state, API, submission, session, status tracking
        ├── testing/              # Typed fixtures and workflow tests
        └── utils/                # Validation, mapping, storage checks
```

`PaymentDraftStore` manages editable state. `PaymentApiService` defines HTTP calls. `PaymentFlowService` coordinates submission and navigation. `PaymentTrackerService` owns polling and result state. `PaymentSessionService` persists payment data using the generic `SessionStorageService`. `PaymentHistoryStore` owns filters, pagination, and history loading, keeping the history page focused on rendering.

Reusable components receive typed inputs and emit events; they do not inject payment services. Component styles stay with their components. Global styles contain theme tokens, typography, form controls, and layout primitives.

## Backend connection

The development proxy is defined in `src/proxy.conf.json`:

| Frontend path            | Backend target          |
| ------------------------ | ----------------------- |
| `/api/payments/**`       | `http://localhost:8080` |
| `/api/payment-status/**` | `http://localhost:8082` |
| `/api/payment-history`   | `http://localhost:8082` |

`GET /api/payment-status/{paymentId}` returns the payment status, payment-level validation status, rejection codes, and persisted payment and transaction details. A temporary `404` is expected before the orchestrator consumes the creation event and persists the payment.

Restart `npm start` after changing proxy settings or `angular.json`. Browser refresh does not reload the development proxy. Avoid running separate servers on `127.0.0.1:4200` and `[::1]:4200`; `localhost` may reach a different process.

For production hosting, configure a reverse proxy for both API paths and serve `index.html` for application routes. The Angular development proxy is not included in a production build.

## Verification

```bash
npm run build
npm run lint
npm run format:check
npm test -- --watch=false
```

Tests cover required fields, multipart JSON generation, totals, backend rejection, upload errors, guarded routes, restored drafts, and direct result URLs. Validation and mapping utilities have focused tests for amount precision and input consistency.

## History and rejection examples

Open the payment history page to browse database records, filter their status, and follow a details link. Refresh reads the latest backend state; history does not automatically poll. A new-payment action resets the draft without deleting history.

To demonstrate rejection, fill the example form and change one amount to `3`. After processing, the corresponding transaction displays the backend `AMOUNT_BELOW_MINIMUM` explanation. Invalid account checksums are blocked before review and remain enforced by backend checkers for direct JSON uploads.

The account validator checks format and checksum, not account ownership or existence. It supports Polish accounts in any currency offered by this demo; foreign IBAN formats are outside the current scope.

## Operator dashboard

The home page displays all-time payment counts and the five most recent database entries, with links to their validation results. Counts come from `totalElements` on filtered history requests, so they represent the full database rather than the displayed page. Data loads on entry and on manual refresh; the dashboard is not a live feed. The last successful read time is displayed.

The new-payment shortcut starts a fresh draft, including after an earlier submission. History remains available from both the dashboard and navigation. Loading, empty database, and backend error states are shown explicitly; unavailable counts use a dash instead of a fabricated zero.

## Code conventions

TypeScript strict mode and strict Angular template checks are enabled. ESLint enforces type-only imports. Service signals exposed to views are read-only; changes go through service methods.

Home and history use a shared async resource for loading, errors, timestamps, and cancellation. A newer request cancels the previous one, and page-scoped stores clean up subscriptions on navigation. API query options, data mapping, messages, and models live in separate files. HTTP error messages are validated before display, including Spring ProblemDetail responses.
