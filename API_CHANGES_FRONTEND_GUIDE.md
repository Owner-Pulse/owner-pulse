# Frontend Integration Guide: New & Modified Backend APIs

> **Document Version:** 1.0  
> **Target Audience:** Frontend Web & Mobile Developers  
> **Base URL:** `/api`  
> **Headers:**
> ```http
> Authorization: Bearer <JWT_TOKEN>
> Accept: application/json
> Content-Type: application/json
> ```

---

## 📋 Table of Contents

1. [Overview of Changes](#overview-of-changes)
2. [Newly Created Endpoints](#newly-created-endpoints)
   - [1. Owner Maintenance — Mark Complete](#1-owner-maintenance--mark-complete)
   - [2. Owner Maintenance — Update Ticket](#2-owner-maintenance--update-ticket)
   - [3. Owner Maintenance — Delete Ticket](#3-owner-maintenance--delete-ticket)
   - [4. Director Expenses — Reset Test Data](#4-director-expenses--reset-test-data)
3. [Modified Endpoints](#modified-endpoints)
   - [5. Director Payroll — Submit Payroll (Single-Date PTO Support)](#5-director-payroll--submit-payroll-single-date-pto-support)
   - [6. Director Payroll — Show Submission Details](#6-director-payroll--show-submission-details)
   - [7. Staff PTO Balances & Roster](#7-staff-pto-balances--roster)
   - [8. Staff Dashboard Tabs](#8-staff-dashboard-tabs)
   - [9. Classroom Operations Detail](#9-classroom-operations-detail)
   - [10. Director Overview Metrics](#10-director-overview-metrics)
   - [11. Compliance Items Timeline & Expiry](#11-compliance-items-timeline--expiry)
4. [Frontend Action Checklist](#frontend-action-checklist)

---

## 1. Overview of Changes

This document outlines all backend enhancements, bug fixes, and new endpoints implemented to satisfy the **FINAL Acceptance List**:

- **Single-Date PTO Breakdown:** Payroll PTO submissions now break down multi-day date selections into individual single-date records (eliminating date range bugs like `0002-09-20`) and synchronize directly with staff PTO logs.
- **Maintenance Actions:** Complete, update, and delete actions are now fully persistent in the database.
- **Classroom Utilization & Sorting:** Students are sorted newest-first (`created_at DESC`), capacity display shows `--` instead of hardcoded `47%` when unconfigured, and dummy mock data arrays have been removed.
- **Compliance Timeline:** Expired items now return `time_progress_percentage: 100.0` pinned at the end of the timeline bar with `#AE4A3E` red indicator.
- **Budget Test Reset:** Added an endpoint to reset test expense data during evaluation.

---

## 2. Newly Created Endpoints

### 1. Owner Maintenance — Mark Complete

Transitions an open or in-progress maintenance ticket to `'done'` and persists resolution metadata.

- **Method:** `POST`
- **URL:** `/api/owner/maintenance/complete/{id}`
- **Permissions:** Owner / Director
- **URL Parameter:** `id` (integer, Maintenance Request ID)

#### Request Body (Optional)
```json
{
  "notes": "Replaced HVAC filter and verified cooling."
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Maintenance request marked as completed.",
  "data": {
    "id": 14,
    "title": "Air Conditioner Leaking in Room 3",
    "status": "done",
    "is_resolved": true,
    "resolved_at": "2026-09-17T11:40:00+00:00",
    "priority": "high",
    "category": "HVAC",
    "created_at": "2026-09-10T08:00:00+00:00"
  }
}
```

---

### 2. Owner Maintenance — Update Ticket

Updates the details (title, description, priority, category, cost) of an existing maintenance request.

- **Method:** `POST` (or `PUT`)
- **URL:** `/api/owner/maintenance/update/{id}`
- **Permissions:** Owner / Director
- **URL Parameter:** `id` (integer, Maintenance Request ID)

#### Request Body
```json
{
  "title": "Air Conditioner Repair in Room 3",
  "description": "Technician contacted; parts arriving Friday.",
  "priority": "high",
  "category": "HVAC",
  "status": "in_progress",
  "estimated_cost": 250.00
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Maintenance request updated successfully.",
  "data": {
    "id": 14,
    "title": "Air Conditioner Repair in Room 3",
    "description": "Technician contacted; parts arriving Friday.",
    "priority": "high",
    "category": "HVAC",
    "status": "in_progress",
    "estimated_cost": 250.0,
    "updated_at": "2026-09-17T11:45:00+00:00"
  }
}
```

---

### 3. Owner Maintenance — Delete Ticket

Permanently removes a maintenance ticket.

- **Method:** `DELETE`
- **URL:** `/api/owner/maintenance/delete/{id}`
- **Permissions:** Owner / Director
- **URL Parameter:** `id` (integer, Maintenance Request ID)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Maintenance request deleted successfully.",
  "data": null
}
```

---

### 4. Director Expenses — Reset Test Data

Cleans up test/dummy expenses created during director budget evaluation without impacting verified system records.

- **Method:** `POST`
- **URL:** `/api/director/expense/reset`
- **Permissions:** Director / Owner

#### Request Body
*None (Empty body `{}`)*

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Test expense data reset successfully. (4 records cleaned).",
  "data": {
    "deleted_count": 4
  }
}
```

---

## 3. Modified Endpoints

### 5. Director Payroll — Submit Payroll (Single-Date PTO Support)

Submits the 7-step payroll entry form.

- **Method:** `POST`
- **URL:** `/api/director/payroll/submit`
- **Permissions:** Director / Owner

#### ✨ Key Upgrade in Payload: Single-Date PTO Support
You can now supply dates for PTO or line items in multiple flexible ways. The backend will **automatically break them down into separate single-date items** with `start_date = end_date = date` and divide total hours evenly (default `8.0` hrs per day).

#### Request Body (Example with Multiple Single Dates)
```json
{
  "payroll_cycle_id": 4,
  "staff_count": 35,
  "pto_used_ytd_percentage": 14.5,
  "preschool_notes": "Preschool payroll completed smoothly.",
  "elementary_notes": "Elementary substitute coverage verified.",
  "status": "submitted",
  "items": [
    {
      "staff_id": 412,
      "item_type": "pto",
      "hours": 32,
      "dates": [
        "2026-09-14",
        "2026-09-16",
        "2026-09-19",
        "2026-09-20"
      ],
      "category_tag": "Sick",
      "notes": "Medical leave single days"
    },
    {
      "staff_id": 305,
      "item_type": "child_care_deduction",
      "amount": 150.00,
      "category_tag": "Preschool Tuition",
      "notes": "Staff child discount deduction"
    },
    {
      "staff_id": 210,
      "item_type": "birthday_extra_off",
      "date": "2026-09-18",
      "hours": 8,
      "notes": "Birthday comp day"
    }
  ]
}
```

#### Valid `item_type` Values:
- `pto` (Expands to individual single-date records and logs to `staff_pto_logs`)
- `child_care_deduction`
- `other_deduction`
- `birthday_extra_off`
- `adp_hours`
- `holiday_exception`

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Payroll report submitted successfully.",
  "data": {
    "id": 12,
    "payroll_cycle_id": 4,
    "staff_count": 35,
    "pto_used_ytd_percentage": 14.5,
    "preschool_notes": "Preschool payroll completed smoothly.",
    "elementary_notes": "Elementary substitute coverage verified.",
    "status": "submitted",
    "submitted_at": "2026-09-17T11:58:00+00:00",
    "items": [
      {
        "id": 45,
        "payroll_submission_id": 12,
        "staff_id": 412,
        "procare_employee_id": 412,
        "staff_name": "Olivia Diaz",
        "item_type": "pto",
        "amount": null,
        "hours": 8.0,
        "date": "2026-09-14",
        "start_date": "2026-09-14",
        "end_date": "2026-09-14",
        "category_tag": "Sick",
        "notes": "Medical leave single days",
        "created_at": "2026-09-17T11:58:00+00:00"
      },
      {
        "id": 46,
        "payroll_submission_id": 12,
        "staff_id": 412,
        "procare_employee_id": 412,
        "staff_name": "Olivia Diaz",
        "item_type": "pto",
        "amount": null,
        "hours": 8.0,
        "date": "2026-09-16",
        "start_date": "2026-09-16",
        "end_date": "2026-09-16",
        "category_tag": "Sick",
        "notes": "Medical leave single days",
        "created_at": "2026-09-17T11:58:00+00:00"
      },
      {
        "id": 47,
        "payroll_submission_id": 12,
        "staff_id": 412,
        "procare_employee_id": 412,
        "staff_name": "Olivia Diaz",
        "item_type": "pto",
        "amount": null,
        "hours": 8.0,
        "date": "2026-09-19",
        "start_date": "2026-09-19",
        "end_date": "2026-09-19",
        "category_tag": "Sick",
        "notes": "Medical leave single days",
        "created_at": "2026-09-17T11:58:00+00:00"
      },
      {
        "id": 48,
        "payroll_submission_id": 12,
        "staff_id": 412,
        "procare_employee_id": 412,
        "staff_name": "Olivia Diaz",
        "item_type": "pto",
        "amount": null,
        "hours": 8.0,
        "date": "2026-09-20",
        "start_date": "2026-09-20",
        "end_date": "2026-09-20",
        "category_tag": "Sick",
        "notes": "Medical leave single days",
        "created_at": "2026-09-17T11:58:00+00:00"
      },
      {
        "id": 49,
        "payroll_submission_id": 12,
        "staff_id": 305,
        "procare_employee_id": 305,
        "staff_name": "Marcus Vance",
        "item_type": "child_care_deduction",
        "amount": 150.0,
        "hours": null,
        "date": null,
        "start_date": null,
        "end_date": null,
        "category_tag": "Preschool Tuition",
        "notes": "Staff child discount deduction",
        "created_at": "2026-09-17T11:58:00+00:00"
      }
    ]
  }
}
```

---

### 6. Director Payroll — Show Submission Details

Retrieves detailed breakdown of a previous payroll submission with itemized single-date lines.

- **Method:** `GET`
- **URL:** `/api/director/payroll/history/{id}`
- **Permissions:** Director / Owner
- **URL Parameter:** `id` (integer, Payroll Submission ID)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Payroll submission detail retrieved successfully.",
  "data": {
    "id": 12,
    "payroll_cycle_id": 4,
    "payroll_cycle": {
      "id": 4,
      "start_date": "2026-09-01",
      "end_date": "2026-09-14",
      "submission_due_date": "2026-09-15",
      "status": "submitted"
    },
    "submitted_by": {
      "id": 2,
      "name": "Sarah Jenkins",
      "email": "director@school.com"
    },
    "staff_count": 35,
    "pto_used_ytd_percentage": 14.5,
    "status": "submitted",
    "submitted_at": "2026-09-17T11:58:00+00:00",
    "items": [
      {
        "id": 45,
        "payroll_submission_id": 12,
        "staff_id": 412,
        "procare_employee_id": 412,
        "staff_name": "Olivia Diaz",
        "item_type": "pto",
        "amount": null,
        "hours": 8.0,
        "date": "2026-09-14",
        "start_date": "2026-09-14",
        "end_date": "2026-09-14",
        "category_tag": "Sick",
        "notes": "Medical leave single days"
      }
    ]
  }
}
```

---

### 7. Staff PTO Balances & Roster

Fetches the centralized PTO allowance and usage roster.

- **Method:** `GET`
- **URL:** `/api/procare/staff/pto-balances?year=2026&page=1&per_page=15`
- **Query Parameters:**
  - `year` (optional integer, e.g. `2026`)
  - `page` (optional integer, default `1`)
  - `per_page` (optional integer, default `15`)
  - `search` (optional string)

#### ✨ Key Upgrades:
1. Staff items are strictly sorted newest-first (`created_at DESC, id DESC`).
2. Provides a unified `pto_summary` object for dashboard KPI cards.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Staff PTO balances retrieved successfully.",
  "year": 2026,
  "pto_summary": {
    "total_staff": 38,
    "total_pto_allowance_days": 380.0,
    "total_pto_used_days": 42.5,
    "overall_pto_percentage": 11.2,
    "high_usage_count": 2,
    "high_usage_threshold_percentage": 70.0
  },
  "staff_list": {
    "current_page": 1,
    "data": [
      {
        "id": 412,
        "first_name": "Olivia",
        "last_name": "Diaz",
        "full_name": "Olivia Diaz",
        "category_description": "Lead Teacher",
        "profile_image": null,
        "pto_allowance": 10.0,
        "pto_used": 4.0,
        "pto_remaining": 6.0,
        "pto_used_percentage": 40.0,
        "has_high_usage": false,
        "created_at": "2026-09-15T10:30:00+00:00",
        "recent_logs": [
          {
            "id": 101,
            "date": "2026-09-14",
            "day_type": "Sick",
            "days": 1.0
          }
        ]
      }
    ],
    "total": 38,
    "per_page": 15,
    "last_page": 3
  }
}
```

---

### 8. Staff Dashboard Tabs

Returns tab overview counts and roster metrics.

- **Method:** `GET`
- **URL:** `/api/procare/dashboard/staff/tabs`

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Staff tabs data retrieved successfully.",
  "data": {
    "total_staff": 38,
    "active_staff": 36,
    "on_pto_today": 2,
    "pto_summary": {
      "total_allowance_days": 380.0,
      "total_used_days": 42.5,
      "used_percentage": 11.2,
      "high_usage_staff_count": 2
    }
  }
}
```

---

### 9. Classroom Operations Detail

Retrieves detailed operations, staffing, and enrollment for a classroom.

- **Method:** `GET`
- **URL:** `/api/director/classrooms/{id}/operations`
- **URL Parameter:** `id` (integer, Classroom ID)

#### ✨ Key Upgrades:
1. **Newest Students First:** Enrolled children are ordered by `created_at DESC, id DESC`.
2. **Real Capacity:** When capacity is 0 or unconfigured in database, returns `--` instead of hardcoded `47%`.
3. **No Mock Data:** Dummy allergies/incidents arrays have been stripped.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "classroom": {
      "id": 5,
      "name": "Toddler Explorers",
      "program_category": "Preschool",
      "capacity": 16,
      "enrolled_count": 14,
      "classroom_space_utilization": "87.5%",
      "utilization_percentage": 87.5,
      "staff_student_ratio": "1:7",
      "teacher_name": "Maria Hernandez",
      "students": [
        {
          "id": 142,
          "first_name": "Leo",
          "last_name": "Martinez",
          "enrollment_status": "enrolled",
          "created_at": "2026-09-16T14:00:00+00:00"
        },
        {
          "id": 141,
          "first_name": "Sophia",
          "last_name": "Chen",
          "enrollment_status": "enrolled",
          "created_at": "2026-09-12T09:30:00+00:00"
        }
      ]
    }
  }
}
```

---

### 10. Director Overview Metrics

Returns top-level KPI metrics for the director dashboard.

- **Method:** `GET`
- **URL:** `/api/director/overview`

#### ✨ Key Upgrades:
- `open_maintenance_count` strictly aggregates tickets with `status IN ('open', 'pending', 'in_progress')` (completed `'done'` items are excluded).

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "active_enrollment": 185,
    "staff_count": 38,
    "open_maintenance_count": 3,
    "compliance_status": {
      "total_items": 24,
      "expired_count": 1,
      "critical_count": 2,
      "good_standing_percentage": 91.7
    },
    "budget_ytd": {
      "revenue": 450200.00,
      "expenses": 312450.00,
      "margin_percentage": 30.6
    }
  }
}
```

---

### 11. Compliance Items Timeline & Expiry

Lists compliance items with expiration timelines.

- **Method:** `GET`
- **URL:** `/api/director/compliance/items` (or `/api/owner/compliance/items`)
- **Query Parameters:** `status` (`expired`, `warning`, `good`), `role`, `search`

#### ✨ Key Upgrades:
- When `status === "expired"`, `time_progress_percentage` is guaranteed to return `100.0` (for pinning the progress bar to the end with `#AE4A3E` red indicator).

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "title": "Annual Fire Safety Certification",
      "role": "Director",
      "frequency": "annual",
      "status": "expired",
      "due_date": "2026-08-30",
      "days_until_due": -18,
      "time_progress_percentage": 100.0,
      "status_color": "#AE4A3E",
      "checklist_completed_count": 2,
      "checklist_total_count": 3
    }
  ]
}
```

---

## 4. Frontend Action Checklist

| Area / Page | Action Needed by Frontend | Target Endpoint |
|---|---|---|
| **Maintenance Modal / Card** | Bind "Mark Complete" button | `POST /api/owner/maintenance/complete/{id}` |
| **Maintenance Modal / Edit** | Bind "Edit Request" submit | `POST /api/owner/maintenance/update/{id}` |
| **Maintenance Card** | Bind "Delete" action | `DELETE /api/owner/maintenance/delete/{id}` |
| **Director Budget Page** | Bind "Reset Test Data" button | `POST /api/director/expense/reset` |
| **Payroll Submit Step 4 (PTO)** | Send multiple individual dates in `dates: ["YYYY-MM-DD", ...]` | `POST /api/director/payroll/submit` |
| **Classroom Space Utilization** | Read `classroom_space_utilization` or `utilization_percentage` (displays `--` if unconfigured) | `GET /api/director/classrooms/{id}/operations` |
| **Compliance Timeline** | Use `time_progress_percentage` (returns `100.0` for expired) | `GET /api/director/compliance/items` |
| **Staff PTO Balances Roster** | Read `pto_summary` for top counters; render `staff_list.data` (sorted newest first) | `GET /api/procare/staff/pto-balances` |
