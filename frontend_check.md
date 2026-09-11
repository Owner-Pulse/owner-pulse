Viewed DirectorAtRiskController.php:1-120
Viewed DirectorDailyLogController.php:1-140
Viewed ProcareDataController.php:90-160
Searched for "function logPto"
Searched for "logPto"
Viewed ProcareDataController.php:2330-2450
Viewed ProcareDataController.php:2451-2570
Viewed ProcareDataController.php:2570-2650
Viewed ProcareDataController.php:2730-2830
Viewed DirectorComplianceController.php:1-140
Viewed DirectorComplianceController.php:265-340
Viewed DirectorTuitionDiscountController.php:1-150
Viewed OwnerOverviewService.php:1-100

Here is the complete, comprehensive API reference guide covering all modified and related backend endpoints. 

You can copy and paste this guide to verify all request payloads, query parameters, full JSON responses, and frontend state bindings.

---

# 1. At-Risk Student Retention & Status Management

### 1.1 Retain At-Risk Student (Persist to Database)
* **Endpoint:** `POST /api/director/at-risk/retain/{id}` *(Also available at `POST /api/at-risk/retain/{id}`)*
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **URL Parameter:** `id` (Integer — AtRisk record ID)
* **Request Body (JSON):**
```json
{
  "notes": "Met with parents, issue resolved. Student retained." // Optional
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Student successfully marked as retained.",
  "data": {
    "at_risk_id": 14,
    "student_name": "Liam Johnson",
    "status": "retained",
    "enrollment_status": "enrolled",
    "updated_at": "2026-09-10T12:45:00.000000Z"
  }
}
```
* **Frontend Verification:**
  - When clicking "Retain", trigger this API call.
  - On response, update the local cache/list and re-fetch active At-Risk counts.

---

### 1.2 Withdraw At-Risk Student (Move to Removal Registry)
* **Endpoint:** `POST /api/director/at-risk/withdraw/{id}` *(Also available at `POST /api/at-risk/withdraw/{id}`)*
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **URL Parameter:** `id` (Integer)
* **Request Body (JSON):**
```json
{
  "withdrawal_reason": "Relocating out of state",
  "effective_date": "2026-09-15",
  "notes": "Last day attended is Friday."
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Student successfully marked as withdrawn and moved to Removal Registry.",
  "data": {
    "at_risk_id": 14,
    "status": "withdrawn",
    "removal_id": 32,
    "student_name": "Liam Johnson"
  }
}
```

---

### 1.3 Get At-Risk Students List
* **Endpoint:** `GET /api/director/at-risk`
* **Query Parameters:**
  - `status`: `'active'` | `'withdrawn'` | `'retained'` | `'all'` (Default: `'active'`)
  - `search`: string (Optional)
  - `page`: integer (Default: `1`)
  - `per_page`: integer (Default: `10`)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "At-risk students retrieved successfully.",
  "summary": {
    "total_at_risk": 3,
    "total_withdrawn": 2,
    "financial_concerns": 1,
    "academic_concerns": 1,
    "attendance_concerns": 1
  },
  "data": [
    {
      "id": 14,
      "child_id": 105,
      "procare_child_id": 5012,
      "student_name": "Liam Johnson",
      "classroom_id": 4,
      "classroom_name": "Pre-K Blue",
      "risk_category": "Attendance Concerns",
      "risk_details": "Absent 4 consecutive Mondays",
      "flag_date": "2026-09-08",
      "status": "active",
      "action_plan": "Parent contact initiated"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 3,
    "last_page": 1,
    "from": 1,
    "to": 3
  }
}
```

---

# 2. Staff PTO & Substitutes Logging (Multi-Date Support)

### 2.1 Log Staff PTO (Single or Multiple Dates)
* **Endpoint:** `POST /api/director/pto/log` *(Also at `POST /api/staff/pto/log`)*
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body (JSON):**
```json
{
  "employee_id": 5,
  "day_type": "Sick", // "Sick" | "Vacation" | "Jury Duty" | "Hurricane"
  "dates": [
    "2026-09-09",
    "2026-09-13",
    "2026-09-16"
  ],
  "days": 1, // Optional, defaults to 1 per date
  "reason": "Doctor appointment and scheduled medical leave"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "PTO logged successfully.",
  "data": {
    "pto_logs": [
      {
        "id": 88,
        "employee_id": 5,
        "day_type": "Sick",
        "days": 1,
        "date": "2026-09-09",
        "reason": "Doctor appointment and scheduled medical leave"
      },
      {
        "id": 89,
        "employee_id": 5,
        "day_type": "Sick",
        "days": 1,
        "date": "2026-09-13",
        "reason": "Doctor appointment and scheduled medical leave"
      },
      {
        "id": 90,
        "employee_id": 5,
        "day_type": "Sick",
        "days": 1,
        "date": "2026-09-16",
        "reason": "Doctor appointment and scheduled medical leave"
      }
    ],
    "pto_summary": {
      "employee_id": 5,
      "year": 2026,
      "pto_allowance": 10.0,
      "pto_used": 3.0,
      "pto_remaining": 7.0
    }
  }
}
```
* **Validation / Limit Exceeded Response (`422 Unprocessable Content`):**
```json
{
  "success": false,
  "message": "Maximum PTO limit exceeded. Staff member only has 1 remaining PTO day(s) for year 2026.",
  "remaining_days": 1,
  "requested_days": 3
}
```

---

### 2.2 Log Substitute Teacher (Manual Sub Name + Multi-Date)
* **Endpoint:** `POST /api/director/substitute/log` *(Also at `POST /api/staff/substitute/log`)*
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body (JSON):**
```json
{
  "absent_employee_id": 5,
  "sub_name": "Maria Gonzales (External Sub)", // Free-text string or selected name
  "sub_employee_id": null, // Optional if external
  "classroom_name": "Toddler Room A",
  "dates": [
    "2026-09-09",
    "2026-09-13"
  ],
  "called_by": "Shara (Director)"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Substitute coverage logged successfully.",
  "data": {
    "substitute_logs": [
      {
        "id": 41,
        "absent_employee_id": 5,
        "sub_name": "Maria Gonzales (External Sub)",
        "classroom_name": "Toddler Room A",
        "date": "2026-09-09"
      },
      {
        "id": 42,
        "absent_employee_id": 5,
        "sub_name": "Maria Gonzales (External Sub)",
        "classroom_name": "Toddler Room A",
        "date": "2026-09-13"
      }
    ]
  }
}
```

---

# 3. Staff Registration & Staff Dashboard

### 3.1 Register Staff Member
* **Endpoint:** `POST /api/director/staff/store` *(Also at `POST /api/staff/store`)*
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body (JSON):**
```json
{
  "full_name": "Elena Rostova",
  "role": "Teacher", // "Teacher" | "Assistant Teacher" | "Staff" | "Other"
  "primary_assignment": "Preschool 3",
  "employment_status": "Currently Employed",
  "hire_date": "2026-09-01",
  "date_of_birth": "1992-05-14",
  "pto_allowance": 10.0,
  "phone_number": "555-019-2834",
  "email": "elena.rostova@school.com"
}
```
*(Note: `procare_employee_id` is auto-generated by backend if omitted).*
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Staff member registered successfully.",
  "data": {
    "employee_id": 22,
    "procare_employee_id": 10022,
    "full_name": "Elena Rostova",
    "role": "Teacher",
    "primary_assignment": "Preschool 3",
    "employment_status": "Currently Employed",
    "date_of_birth": "1992-05-14",
    "hire_date": "2026-09-01",
    "pto_allowance": 10.0,
    "pto_used": 0.0,
    "phone_number": "555-019-2834",
    "email": "elena.rostova@school.com"
  }
}
```

---

### 3.2 Staff Dashboard (KPIs, Agreed Day Types, Newest-First Rosters)
* **Endpoint:** `GET /api/director/staff` *(Also at `GET /api/staff/dashboard`)*
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "kpi_metrics": {
      "total_staff": 18,
      "currently_employed": 16,
      "on_leave": 2,
      "pto_allocated_days": 180,
      "pto_used_ytd_days": 24,
      "pto_used_ytd_pct": 13.3,
      "pto_remaining_days": 156,
      "day_types_breakdown": {
        "sick_days": 14,
        "vacation_days": 8,
        "jury_duty_days": 2,
        "hurricane_days": 0
      }
    },
    "roster": [
      {
        "id": 22,
        "name": "Elena Rostova",
        "role": "Teacher",
        "classroom": "Preschool 3",
        "pto_allowance": 10,
        "pto_used": 0,
        "pto_balance": 10
      }
    ],
    "recent_pto_history": [
      {
        "id": 90,
        "staff_name": "Elena Rostova",
        "day_type": "Sick",
        "days": 1,
        "date": "2026-09-09",
        "reason": "Doctor appointment"
      }
    ]
  }
}
```

---

# 4. Director Daily Log Hub

### 4.1 Daily Log History & Filtering
* **Endpoint:** `GET /api/director/daily-log/history`
* **Query Parameters:**
  - `date`: `'today'` | `'yesterday'` | `'this_week'` | `'open_items'` | `'YYYY-MM-DD'` | `'all'`
  - `category`: `'all'` | `'incident'` | `'removal'` | `'pto'` | `'substitute'` | `'waitlist'` | `'maintenance'` | `'at_risk'` | `'open_items'`
  - `search`: string (Optional)
  - `page`: integer (Default: `1`)
  - `per_page`: integer (Default: `15`)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Daily log operational hub data retrieved successfully.",
  "summary": {
    "total_today": 6,
    "this_week": 18,
    "open_items": 4,
    "incidents_count": 2,
    "removals_count": 1,
    "pto_count": 2,
    "substitutes_count": 1,
    "waitlist_count": 3,
    "maintenance_count": 2,
    "at_risk_count": 1
  },
  "data": [
    {
      "id": 105,
      "category": "maintenance",
      "category_label": "Maintenance",
      "title": "Maintenance: AC leaking in Classroom 2",
      "subtitle": "High priority",
      "status": "open",
      "log_date": "2026-09-09",
      "details": "Classroom 2 · Unit 3 leaking water"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1
  }
}
```

---

# 5. Compliance Tracking & Item Renewal

### 5.1 Renew / Complete Expired Compliance Item
* **Endpoint:** `POST /api/director/compliance/items/renew/{id}` *(Also at `POST /api/compliance/items/renew/{id}`)*
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **URL Parameter:** `id` (Integer)
* **Request Body (JSON):**
```json
{
  "new_expiration_date": "2027-09-15",
  "notes": "Renewed state licensing certificate. Valid for 1 year."
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Compliance item renewed successfully.",
  "data": {
    "item": {
      "id": 12,
      "title": "DCF Annual Facility License",
      "responsible_role": "director",
      "status": "compliant",
      "expiration_date": "2027-09-15",
      "days_remaining": 370
    },
    "health_summary": {
      "score": 100,
      "total_items": 9,
      "compliant_items": 9,
      "expired_items": 0,
      "expiring_soon_items": 0
    }
  }
}
```

---

### 5.2 Director Compliance Overview (Includes Owner Items Metric)
* **Endpoint:** `GET /api/director/compliance/overview`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Director compliance overview metrics retrieved successfully.",
  "data": {
    "kpis": {
      "total_items": 9,
      "compliant_count": 8,
      "expiring_soon_count": 1,
      "expired_count": 0,
      "overall_health_score": 88.9,
      "owner_assigned_count": 4
    },
    "owner_items": [
      {
        "id": 5,
        "title": "Annual Fire Safety Inspection",
        "responsible_role": "owner",
        "expiration_date": "2026-11-20",
        "status": "compliant"
      }
    ]
  }
}
```

---

# 6. Tuition Discounts & Waived Applications

### 6.1 Create Tuition Discount Application (Simplified Form)
* **Endpoint:** `POST /api/director/tuition-discounts`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body (JSON):**
```json
{
  "child_id": 105,
  "weekly_amount": 75.00,
  "start_date": "2026-09-01",
  "reason": "Sibling discount for second child"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Tuition discount application submitted successfully.",
  "data": {
    "id": 8,
    "child_id": 105,
    "student_name": "Maya Anderson",
    "weekly_amount": 75.00,
    "monthly_amount": 325.00,
    "annual_amount": 3900.00,
    "formatted_weekly": "$75.00/wk",
    "formatted_monthly": "$325.00/mo",
    "formatted_annual": "$3,900.00",
    "status": "pending"
  }
}
```

---

### 6.2 Get Tuition Discounts List & Overview
* **Endpoint:** `GET /api/director/tuition-discounts` *(Or `GET /api/owner/tuition-discounts`)*
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 2,
      "pending": 0,
      "approved": 2,
      "rejected": 0,
      "approved_weekly_total": 150.00,
      "formatted_approved_weekly": "$150.00/wk",
      "approved_monthly_total": 650.00,
      "formatted_approved_monthly": "$650.00/mo",
      "approved_annual_total": 7800.00,
      "formatted_approved_annual": "$7,800.00"
    },
    "applications": [
      {
        "id": 8,
        "student_name": "Maya Anderson",
        "classroom_name": "Toddler 2",
        "weekly_amount": 75.00,
        "monthly_amount": 325.00,
        "annual_amount": 3900.00,
        "formatted_monthly": "$325.00/mo",
        "status": "approved"
      }
    ]
  }
}
```

---

# 7. Maintenance Management

### 7.1 Complete Maintenance Request
* **Endpoint:** `PATCH /api/owner/maintenance/{id}/status` *(Also at `POST /api/owner/maintenance/update-status/{id}`)*
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body (JSON):**
```json
{
  "status": "completed", // "open" | "in_progress" | "completed" | "cancelled"
  "resolution_notes": "Repaired compressor and cleared condensation drain."
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Maintenance request status updated to completed.",
  "data": {
    "id": 18,
    "status": "completed",
    "resolved_at": "2026-09-10T12:50:00.000000Z",
    "resolution_notes": "Repaired compressor and cleared condensation drain."
  }
}
```

---

### 7.2 Maintenance Overview Counters
* **Endpoint:** `GET /api/owner/maintenance/overview` *(Or `GET /api/director/maintenance/overview`)*
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "total_requests": 12,
    "open_requests": 2, // pending + open
    "in_progress_requests": 1,
    "completed_requests": 9,
    "critical_requests": 0,
    "resolved_percentage": 75.0
  }
}
```

---

# 8. Waitlist Operations

### 8.1 Add to Waitlist
* **Endpoint:** `POST /api/director/waitlist`
* **Request Body (JSON):**
```json
{
  "parent_name": "Sarah Miller",
  "child_name": "Lucas Miller",
  "child_dob": "2023-04-10",
  "phone": "555-234-5678",
  "email": "sarah.miller@example.com",
  "desired_start_date": "2026-10-01",
  "program_interest": "Toddler",
  "notes": "Prefers morning tour."
}
```
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Waitlist entry created successfully.",
  "data": {
    "id": 44,
    "parent_name": "Sarah Miller",
    "child_name": "Lucas Miller",
    "status": "inquiry",
    "created_at": "2026-09-10T12:52:00.000000Z"
  }
}
```

---

### 8.2 Log Tour
* **Endpoint:** `POST /api/director/waitlist/{id}/tour`
* **Request Body (JSON):**
```json
{
  "tour_date": "2026-09-18",
  "tour_time": "10:30:00",
  "showed_up": false, // Only sent/rendered if tour_date <= today
  "notes": "Parent confirmed arrival time."
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Tour scheduled/logged successfully.",
  "data": {
    "id": 44,
    "status": "tour_scheduled",
    "tour_date": "2026-09-18 10:30:00"
  }
}
```

---

# 9. Owner & Director Master Overview Endpoints

### 9.1 Owner Overview Payload
* **Endpoint:** `GET /api/owner/overview`
* **Query Parameters:** `timeframe`: `'30d'` | `'90d'` | `'1y'`
* **Key Fields in JSON Response:**
```json
{
  "success": true,
  "data": {
    "pulse": {
      "overall_score": 84.5,
      "grade": "B",
      "trend": "+2.1%"
    },
    "kpi_cards": {
      "enrolled_students": {
        "value": 142,
        "capacity": 180,
        "capacity_pct": 78.9,
        "yoy_growth": "+4.2%"
      },
      "revenue": {
        "current_month_amount": 42500.00,
        "formatted_current_month": "$42,500",
        "mom_growth_pct": 3.8,
        "formatted_mom_growth": "+3.8%",
        "is_empty": false
      },
      "tuition_discounts": {
        "active_discounts_count": 2,
        "monthly_discount_amount": 650.00,
        "formatted_monthly": "$650/mo",
        "formatted_annual": "$7,800/yr",
        "pct_share": 1.5,
        "is_empty": false
      },
      "open_maintenance": {
        "open_count": 3,
        "critical_count": 0
      },
      "at_risk_students": {
        "active_count": 3
      },
      "compliance_health": {
        "score": 100,
        "total": 9,
        "open_items": 0,
        "formatted_ratio": "9/9 Compliant"
      }
    }
  }
}
```

---

### Quick Frontend Sanity Checklist

1. **At-Risk Actions:** Ensure `retain` calls `POST /api/director/at-risk/retain/{id}` with `{ "notes": "..." }` and handles `response.data.success`.
2. **PTO & Substitute Forms:** Ensure multi-date picker passes an array: `{ dates: ["YYYY-MM-DD", ...] }`.
3. **Delete Confirmation:** Ensure `DeleteConfirmationModal` does not block users with mandatory typed text inputs and performs single-click confirmed deletions.
4. **Tour Logging:** In `LogTourModal`, only render the "Did they show up?" toggle when `new Date(tourDate) <= new Date()`.
5. **No Invented Values:** When API returns `is_empty: true` or `capacity: 0`, render the empty state (`"--"` / `"$0.00"` / `"0%"`) rather than a hardcoded default.