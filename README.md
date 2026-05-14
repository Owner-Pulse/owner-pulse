# HCLC Leadership Dashboard

A single-page React dashboard for school leadership at **HCLC (Head of the Class Learning Center)**. Two role views: **Owner** (executive view, 11 tabs) and **Director · Asst. Principal** (combined operational view, 4 tabs). Fully responsive — works on desktop browsers, iPhone Safari, and Android Chrome.

> **Note for developer:** Owner has chosen "HCLC" as the working school name throughout the code. The final brand name for the app itself (e.g. "HCLCore", "Selene by HCLC", or another option) is to be confirmed by the Owner before launch. Find-and-replace will take 30 seconds when finalized.

---

## Quick start

Requires **Node.js 18+** and npm.

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. The dev server is configured with `host: true`, so when it starts it will print a "Network:" URL — open that on a phone connected to the same Wi-Fi to test on mobile.

## Production build

```bash
npm run build
npm run preview     # local preview of production build
```

Static output lands in `dist/`. Deploy that folder to any static host: Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront, GitHub Pages, or nginx.

---

## Tab structure

### Owner (11 tabs)
1. **Overview** — KPIs, Director Digest, payroll alerts, Needs My Input focused mode
2. **Enrollment** — targets, scholarships, at-risk students, discounts
3. **Classrooms** — per-classroom P&L, NWEA MAP scores (K-8), withdrawals (Preschool), YoY deltas
4. **Cash Flow** *(new)* — year-over-year by category with AI insights
5. **Compliance & Contracts** *(expanded)* — regulatory, insurance, vendor contracts
6. **Tasks** — split by Owner/Director assignee
7. **Maintenance** — work orders with priority
8. **Budget** — annual budget with category drill-down
9. **Scholarships** — Step Up FL approval pipeline
10. **Staff** — roster with attendance
11. **Waitlist** — inquiry to enrolled funnel

### Director · Asst. Principal (4 tabs)
1. **Daily Log** — unified entry point (expenses, PTO, incidents, removals, maintenance, waitlist, substitutes)
2. **Payroll** *(new)* — structured Payroll Ready form (replaces bi-weekly email)
3. **My Budget** — $9k discretionary spend tracker
4. **Waitlist** — view-only family pipeline

---

## Key feature flows

### Payroll Ready (Director → Owner handoff)

Director fills a structured form every two weeks instead of writing an email. Seven sections:

1. Child Care Deductions (staff + amount)
2. Other Deductions (loan/advance + amount, auto-tracks remaining balance)
3. PTO This Period (staff + date range, auto-counts days, auto-deducts from balance)
4. Birthday Time Off (separate from PTO, once-per-year auto-blocks duplicates)
5. Hours to Add in ADP (after-care hours, non-ADP staff — Owner enters manually in ADP)
6. Holiday Exceptions (conditional — only appears if pay period contains a holiday)
7. Notes by Division (Preschool / Elementary, 200 char cap each)

**On submit:**
- Sends Owner an auto-formatted email summary
- Triggers a **BIG red alert banner** at the top of Owner Overview ("Payroll Ready — Submit in ADP")
- Owner clicks "Done — submitted in ADP" to dismiss

**Critical design notes:**
- Every staff name is a dropdown from the roster. No typing names anywhere.
- Holiday Exceptions list staff who do **NOT** qualify (default is everyone gets it). Flipped from Director's previous email habit.
- PTO balance display uses color coding: green (>2 days), amber (≤2), red (≤0 with ⚠).

### Cash Flow — Year over Year

Owner-only tab showing spending by category across 5 years (2022-2026).

- **Source:** monthly CSV uploaded from QuickBooks (Owner or accountant). AI categorizes transactions into the buckets defined in `CASHFLOW_DATA`.
- **UI:** category pills to pick which lines to compare → bar chart of selected years → combined total line chart → 5-year detail table with YoY % change.
- **AI Insights panel:** auto-generated observations (e.g. "Insurance up 12% YoY — biggest jump in 5 years. Shop rates by May 2."). Filterable by tone (Up / Watch / Good).
- **Default selection:** the 5 biggest categories by latest full year.

### Compliance & Contracts

Three sections under one tab:
- **Regulatory:** fire, health, background checks, VPK, Step Up, CPR, playground
- **Insurance:** liability, property, workers comp, auto — with `shopReminder` dates auto-flagging "shop rates 60 days before renewal"
- **Vendor Contracts:** building lease, food service, cleaning, accounting, IT — with expiry dates

---

## Wiring to a real backend

Right now `App.jsx` manages all state with `useState` and seeds it with realistic sample data (`initial*` constants and `CASHFLOW_DATA`, `CASHFLOW_INSIGHTS`). To connect to a real backend:

1. Replace each `useState(initial*)` call with a data-fetching hook (TanStack Query recommended).
2. Replace the `setX` functions with mutation calls.
3. For Cash Flow: build an endpoint that accepts CSV uploads, runs AI categorization (could use Claude API, OpenAI, or a self-hosted classifier), and stores the rows.
4. For Payroll: when Director submits the form, the backend should (a) email the Owner the formatted summary, (b) update the `payrollReady` state visible to Owner's dashboard.

### Auto-balance tracking (one-time setup)

The PTO balance, Other Deductions balance, and Birthday-used tracking all need an initial state per staff member. Setup screens (not yet built) should let Owner enter once at start of year:
- Each staff member's PTO allowance (currently hardcoded at 10–12 days in `initialStaff`)
- Each loan/advance's starting balance (currently hardcoded in `initialOtherDeductions`)
- Birthday used resets each calendar year

---

## Mobile + PWA

The layout uses Tailwind's `md:` (≥768px) and `lg:` (≥1024px) breakpoints throughout. Tested visually for iPhone Safari and Android Chrome at standard widths (375px, 390px, 412px) and tablet/desktop.

To make it installable as a home-screen app on iOS/Android:

1. Generate icons (at least 192×192 and 512×512 PNGs) and add them to `public/icons/`.
2. Update `public/manifest.json` icons array:
   ```json
   "icons": [
     { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
     { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
   ]
   ```
3. (Optional) Add `vite-plugin-pwa` for service worker / offline support.

---

## Dependencies

- **react / react-dom** — UI framework
- **recharts** — all charts (donut, bar, line, pie)
- **lucide-react** — icon set
- **tailwindcss** — styling
- **vite** — dev server + build tool

No state management library (deliberate — `useState` is sufficient). No router (tab state is enough). No CSS-in-JS (Tailwind + inline styles for theme colors).

---

## File map

```
hclc-dashboard/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── public/manifest.json
└── src/
    ├── main.jsx           # Mounts <App /> into #root
    ├── App.jsx            # THE ENTIRE DASHBOARD — single file, ~3,170 lines
    └── index.css          # Tailwind directives + iOS input zoom prevention
```

---

## Design rules baked in (don't break these without discussing)

- **No teacher portal.** Two roles only: Owner and Director · Asst. Principal (combined).
- **No parent portal.** Out of scope for this build.
- **Staff log nothing.** All operational data entry flows through the Director's Daily Log + Payroll Ready form.
- **No free-text fields** beyond tightly-capped descriptions (40–200 chars). Everything else is dropdown/select/number/date.
- **Profitability is Owner-only** — never expose classroom P&L to the Director view.
- **Owner's school-wide budget includes Director's $9k as one category line** — don't separate them in the Owner view.
- **Holiday Exceptions list who is EXCLUDED, not who's included.** This is flipped from Director's previous email habit and must be coached on rollout.

---

## Sample data — what to swap when going to production

| Constant in `src/App.jsx` | What it is | When to swap |
|---|---|---|
| `initialStaff` | Teacher/aide roster with PTO allowance + used | Day 1 (real roster) |
| `initialOtherDeductions` | Active loans/advances per staff member | Day 1 (real loans) |
| `initialPeriodHolidays` | Holidays in current pay period | Auto-detect from calendar |
| `initialPayrollHistory` | Past submitted payroll periods | Empties on first real submit |
| `initialClassrooms` | Per-classroom data (capacity, enrolled, P&L) | Day 1 (real classrooms) |
| `initialCompliance` | Regulatory + insurance + contracts | Day 1 (real items + renewal dates) |
| `initialTasks` | Tasks split by Owner/Director assignee | Day 1 |
| `initialMaintenance` | Open work orders | Day 1 |
| `initialWaitlist` | Inquiry → enrolled funnel | Day 1 |
| `initialStepUpApprovals` | Step Up scholarship payments | Day 1 |
| `initialAtRisk` | Students whose families may leave | As they emerge |
| `initialDiscounts` | Students with tuition discounts | Day 1 |
| `initialSubstitutes` | Daily substitute call log | Daily |
| `initialDirectorLog` | Director's daily entries | Daily |
| `initialDirectorExpenses` | Director's $9k discretionary spend | As spent |
| `CASHFLOW_DATA` | 5-year category spending | Monthly CSV upload + AI categorization |
| `CASHFLOW_INSIGHTS` | AI observations on YoY trends | Auto-generated from CASHFLOW_DATA |
| `ENROLLMENT_TARGETS` | Annual enrollment goals | Once a year |
| `SCHOOL_BUDGET_TOTAL` / `SCHOOL_BUDGET_CATEGORIES` | Annual budget | Once a year |
| `NWEA_BENCHMARK` | Grade-level expected RIT scores | Once (or when school updates targets) |
| `NEXT_PAYROLL` | Next pay period end date | Bi-weekly |

---

## Questions for Owner before launch

1. **Final app brand name** (HCLCore, Selene by HCLC, another option) — for the header, manifest, and any marketing surface.
2. **PTO allowance per staff** — currently 10 days for teachers, 12 for front office. Confirm or override per person.
3. **Loan/advance starting balances** — replace placeholder values in `initialOtherDeductions`.
4. **Insurance shop-reminder window** — currently 60 days before renewal. Confirm this matches policy renewal cycle.
5. **CSV format from QuickBooks** — confirm export format with accountant so categorization rules can be tuned.
6. **App icon (192×192 and 512×512)** for the PWA manifest, when ready.
# -OwnerPulse-by-HCLC
# -OwnerPulse-by-HCLC
