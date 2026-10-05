# OwnerPulse by HCLC — Comprehensive Master Project Specification

> **Platform:** OwnerPulse (Leadership Dashboard for Hope Community Learning Center — HCLC)  
> **Roles:** Owner (Executive & Financial) & Director / Assistant Principal (Operational & Floor Management)  
> **Status:** 100% Complete Production Specification  
> **Master Overview Document:** [PROJECT_OVERVIEW.md](file:///home/sifat/Projects/owner-pulse/PROJECT_OVERVIEW.md)

---

## 1. System Overview & Purpose

**OwnerPulse** provides distinct, synchronized workspaces for childcare and private academy leadership:
- **Owner Workspace (`/owner/*`):** Executive financial management, QuickBooks integration, classroom unit economics (P&L per room), strategic compliance & insurance shopping, state scholarship reimbursements (Step Up, FES-EO, VPK), staff roster & callout analytics, Director oversight, and bi-weekly payroll approval.
- **Director Workspace (`/director/*`):** Floor operations, daily operational diary, student enrollment & incident tracking, at-risk student intervention, staff attendance & substitute dispatch, bi-weekly payroll building, compliance checklist execution, discretionary budget ($9,000) pace tracking, waitlist lead conversion, and maintenance work orders.
- **Pulse Health Score Engine (`BPM`):** Translates all operational data into a real-time BPM metric (55-160 BPM) across 9 mathematical sub-scores with simulated resolution impact deltas.
- **Real-Time Reverb WebSockets:** Instant notifications for emergencies, payroll submissions, escalations, and incident reports.

---

## 2. Master Route & Feature Directory

| Route | Role | Core Capabilities & Components |
| :--- | :--- | :--- |
| `/` | Public / Auth | Login, Forgot Password, Reset Password, JWT session restoration. |
| `/owner/overview` | Owner | Executive BPM gauge, top 3 recommendations, QuickStats, Budget vs Actual, Cashflow card, Latest Payroll card, CSV import. |
| `/owner/enrollment` | Owner | Capacity utilization by tier, strategic enrollment targets, YoY trend chart, at-risk student exposure, waitlist summary. |
| `/owner/classrooms` | Owner | P&L per classroom, unit margin analysis, ratio compliance, add/edit classroom modal, classroom economics deep dive (`/owner/classrooms/:id`). |
| `/owner/cashflow` | Owner | QuickBooks Online OAuth connection, live bank balance, full year cash flow table, margin trends, budget variance. |
| `/owner/compliance` | Owner | Strategic compliance rollup, urgency timeline (14d/30d/60d), multi-carrier insurance shopping workflow (quotes, comparison, binder). |
| `/owner/scholarships` | Owner | Step Up For Students, FES-EO, PEP, VPK pipeline, aging reimbursement tracker ($>30\text{d}$), award recording. |
| `/owner/staff` | Owner | Full employee roster, unplanned callouts vs. planned PTO analytics, substitute utilization, credential tracking. |
| `/owner/director-management` | Owner | Provision Director accounts, reset credentials, activity audit logging, campus operational health review. |
| `/owner/payroll` | Owner | Bi-weekly payroll submission queue, line-by-line audit modal (hours, PTO, childcare discounts, bonuses), schedule generator. |
| `/owner/discounts` | Owner | Tuition discount policy category management, approval pipeline, annual liability financial modeling. |
| `/owner/pending-decisions` | Owner | Structured Director escalation inbox (Approve/Reject, Vendor decisions, Parent mediation, Document authorizations). |
| `/director/overview` | Director | Operational BPM, daily staff coverage bar, morning action checklist, quick escalation launch. |
| `/director/daily-log` | Director | Chronological event stream, category filtering (Ops, Medical, Facility, Staff, Incident), multi-photo attachment logging. |
| `/director/students` | Director | Student roster, classroom assignment, incident reports (severity, witnesses, photos), at-risk intervention, formal withdrawal. |
| `/director/staff` | Director | Morning callout dispatcher, substitute teacher assignment & hours log, planned PTO requests. |
| `/director/payroll` | Director | Bi-weekly payroll builder (extra hours, PTO hours, childcare deductions, holiday exceptions, notes to Owner). |
| `/director/compliance` | Director | Operational inspection checklists (daily/weekly/monthly), credential renewal warnings, photo evidence upload. |
| `/director/budget` | Director | Discretionary \$9k petty cash pace tracking against academic calendar, expense logger with receipt photo upload. |
| `/director/waitlist` | Director | Waitlist funnel (Inquiry ➔ Tour ➔ Applied ➔ Offered ➔ Enrolled ➔ Lost), stale lead detector ($>14\text{d}$), spot offer manager. |
| `/director/maintenance` | Director | Facility work order ticket creation (priority, vendor, photos), real-time status updates, auto-escalation. |
| `/owner/tasks` / `/director/tasks` | Shared | Collaborative task delegation, status tracking, threaded comments. |
| `/owner/profile` / `/director/profile` | Shared | User profile details, bio, avatar, contact information. |
| `/owner/settings` / `/director/settings` | Shared | Password management, account settings, school budget limits. |

---

## 3. Reference Documentation
For the full architectural specification, mathematical formulas, state machine diagrams, and component catalogs, see [PROJECT_OVERVIEW.md](file:///home/sifat/Projects/owner-pulse/PROJECT_OVERVIEW.md).
