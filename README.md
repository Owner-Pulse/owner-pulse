# Owner Pulse

Owner Pulse is a role-based web dashboard for childcare and school operations. It provides distinct Owner and Director workspaces for operational oversight, enrollment, staff, payroll, compliance, maintenance, waitlists, and financial reporting.

The application is a React single-page application backed by REST APIs and supports desktop and mobile browsers, plus Android delivery through Capacitor.

## Features

### Owner workspace

- Executive overview and operational KPIs
- Enrollment, classroom economics, and cash-flow reporting
- QuickBooks connection status and authorization flow
- Compliance and insurance-shopping workflows
- Tasks, maintenance, budget, payroll, scholarships, staff, and waitlist oversight
- Director account creation and management

### Director workspace

- Daily operational overview and daily-log review
- Student enrollment, incidents, removals, and at-risk workflows
- Staff, PTO, and substitute management
- Compliance, tasks, maintenance, budget, payroll, and waitlist management

### Shared functionality

- Owner and Director authentication with protected role-based routes
- Profile and password management
- In-app notification retrieval and read-state actions
- Responsive dashboard layout and PWA build output

For the full route-by-route API handover, see [PROJECT_DELIVERY_API_DOCUMENTATION.md](PROJECT_DELIVERY_API_DOCUMENTATION.md).

## Technology

- React 18 and Vite
- React Router
- TanStack React Query
- Axios
- Tailwind CSS and shadcn-style UI components
- Recharts
- Capacitor Android

## Prerequisites

- Node.js 18 or later
- npm
- A reachable API server

## Installation

```bash
git clone <repository-url>
cd owner-pulse
npm install
```

Create a `.env` file in the project root:

```dotenv
VITE_BASE_URL=https://your-api.example.com
VITE_AUTH_TOKEN_NAME=pulse_token
VITE_TIME_OUT=15000
```

`VITE_BASE_URL` must not include `/api`; the app adds that segment automatically. `VITE_AUTH_TOKEN_NAME` and `VITE_TIME_OUT` are optional and fall back to `pulse_token` and the Axios default timeout respectively.

## Run locally

```bash
npm run dev
```

Vite serves the application locally, normally at `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`. Deploy this directory to a static host such as Vercel, Netlify, Cloudflare Pages, S3/CloudFront, or nginx.

## Application routes

| Role | Main routes |
|---|---|
| Public | `/`, `/forget-password`, `/reset-password` |
| Owner | `/owner/overview`, `/owner/enrollment`, `/owner/classrooms`, `/owner/cashflow`, `/owner/compliance`, `/owner/tasks`, `/owner/maintenance`, `/owner/budget`, `/owner/payroll`, `/owner/scholarships`, `/owner/staff`, `/owner/waitlist`, `/owner/director-management`, `/owner/profile`, `/owner/settings` |
| Director | `/director/overview`, `/director/daily-log`, `/director/staff`, `/director/students`, `/director/compliance`, `/director/tasks`, `/director/maintenance`, `/director/budget`, `/director/payroll`, `/director/waitlist`, `/director/profile`, `/director/settings` |

All dashboard routes require an authenticated user. Role guards prevent users from opening the other role’s workspace.

## API and authentication

The API base URL is `${VITE_BASE_URL}/api`.

- Public requests are used for sign-in.
- Authenticated requests send `Authorization: Bearer <token>`.
- The token is stored in `localStorage` under `VITE_AUTH_TOKEN_NAME` (default: `pulse_token`).
- File and attachment submissions use `multipart/form-data` where required.

The frontend expects the API to provide login, session (`/me`), role-specific dashboard APIs, and the endpoints listed in the delivery document.

## Project structure

```text
src/
├── components/     # Reusable UI and dashboard widgets
├── hooks/          # React Query queries and mutations
├── layouts/        # Authentication and dashboard layouts
├── lib/            # Axios clients, token helpers, utilities
├── pages/          # Owner, Director, shared, and auth pages
├── providers/      # Query client and toast providers
├── routes/         # Protected and role-specific route guards
├── services/       # API service definitions
└── router/         # Application route configuration
```

## Android (Capacitor)

The Android Capacitor project is in `android/`. Build the web app before syncing changes into the native project:

```bash
npm run build
npx cap sync android
```

Open or build the Android project using your normal Capacitor/Android Studio workflow.

## Delivery notes

- The currently integrated QuickBooks flow supports connection URL retrieval and connection-status checks.
- The current frontend service layer does not contain a dedicated QuickBooks disconnect request or CSV import request. If these are backend-only or external workflows, document their contracts before release.
- `npm run build` is the primary production validation command.

## Documentation

- [API Delivery Matrix](PROJECT_DELIVERY_API_DOCUMENTATION.md) — role-by-role API integration inventory.

## License

Private project. All rights reserved.
