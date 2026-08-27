# Unified DAK, RTI & Grievance Portal — System Plan

A single internal system to replace fragmented DAK (correspondence), RTI, and CPGRAMS-style grievance handling with one citizen-facing portal, one internal case engine, and one compliance layer.

---

## 1. Context & Scope

- RTI Online (rtionline.gov.in) and CPGRAMS are centrally-mandated Government of India platforms run by DoPT/DARPG. They cannot be replaced nationally from outside government — API-based integration is only granted to a small set of States/UTs and Central Ministries on a case-by-case basis.
- CPGRAMS explicitly excludes RTI matters from its scope — the two are kept separate at the government level.
- What **can** be built: a single unified portal for one's own office/department that absorbs all three workflows internally, lets citizens submit through it directly, and still stays compliant with statutory timelines (RTI Act 2005, grievance redressal norms) — because compliance is about *process*, not which software is used.
- Citizens may still file directly on the national RTI/CPGRAMS portals independent of this system — a manual/bulk intake screen is required to bridge those into the unified system unless/until API access is sanctioned.

---

## 2. Core Idea

All three workflows share the same shape:

> Someone submits something → it gets a tracking ID → it's routed to an officer → it moves through stages against a deadline → it gets resolved → the submitter is notified.

So: **one case engine, three configurable case-type templates** — not three bolted-together systems.

---

## 3. System Layers

| Layer | Purpose |
|---|---|
| A — Citizen-Facing Portal (public) | Single front door; citizen doesn't need to know if it's a complaint, RTI, or correspondence |
| B — Unified Case Engine (internal) | Shared backbone: case creation, routing, SLA clock, escalation, closure — parameterized per case type |
| C — Office/Officer Portal (internal) | Where PIOs, GROs, and dealing officers work day to day |
| D — Admin & Compliance Console | Configuration, reporting, statutory returns |

---

## 4. Unified Data Model

One `case` table instead of three parallel data stores. Everything else (dashboards, search, reports, movement tracking) reads off this table.

| Field | Notes |
|---|---|
| `case_id` | Universal ID, prefix denotes type (DAK-, RTI-, GRV-) |
| `case_type` | `dak_general` / `rti_application` / `rti_first_appeal` / `grievance` / `grievance_appeal` |
| `submitter_details` | name, address, contact, citizen or internal |
| `subject_dept` | routed department |
| `assigned_officer` | current owner |
| `sla_days` | pulled from case-type config |
| `due_date` | auto-computed |
| `status` | new → assigned → in-progress → response-drafted → closed → appealed |
| `attachments[]` | scanned docs, files |
| `movement_log[]` | append-only audit trail |
| `linked_case_id` | links an appeal back to its original case |
| `fee_details` | RTI-only |
| `feedback_score` | grievance-only, captured post-closure |

---

## 5. Case Type Configuration Schema

Each case type is a config row, not hardcoded logic. New categories or SLA changes are config edits, not code changes.

```json
{
  "case_type_id": "rti_application",
  "display_name": "RTI Application",
  "id_prefix": "RTI",
  "sla_days": 30,
  "sla_calendar": "calendar_days",
  "sla_start_trigger": "date_received",
  "escalation_rules": [
    { "trigger_days_before_due": 7, "action": "notify_officer" },
    { "trigger_days_before_due": 3, "action": "notify_officer_and_hod" },
    { "trigger_days_before_due": 0, "action": "flag_overdue_escalate_hod" },
    { "trigger_days_after_due": 5, "action": "escalate_appellate_authority" }
  ],
  "required_fields": ["applicant_name", "applicant_address", "fee_paid", "id_proof"],
  "optional_fields": ["bpl_certificate"],
  "fee_required": true,
  "fee_amount": 10,
  "fee_waivable_condition": "bpl_status",
  "allows_appeal": true,
  "appeal_case_type": "rti_first_appeal",
  "appeal_window_days": 30,
  "response_requires_hod_signoff": true,
  "exemption_fields_enabled": true,
  "public_trackable": true
}
```

```json
{
  "case_type_id": "grievance",
  "display_name": "Public Grievance",
  "id_prefix": "GRV",
  "sla_days": 21,
  "sla_calendar": "calendar_days",
  "sla_start_trigger": "date_received",
  "escalation_rules": [
    { "trigger_days_before_due": 5, "action": "notify_officer" },
    { "trigger_days_before_due": 2, "action": "notify_officer_and_hod" },
    { "trigger_days_after_due": 0, "action": "flag_overdue_escalate_hod" }
  ],
  "required_fields": ["complainant_name", "contact", "grievance_category"],
  "fee_required": false,
  "allows_appeal": true,
  "appeal_case_type": "grievance_appeal",
  "appeal_window_days": 30,
  "response_requires_hod_signoff": false,
  "post_closure_feedback_enabled": true,
  "public_trackable": true
}
```

```json
{
  "case_type_id": "dak_general",
  "display_name": "General Correspondence",
  "id_prefix": "DAK",
  "sla_days": 7,
  "sla_calendar": "working_days",
  "sla_start_trigger": "date_received",
  "escalation_rules": [
    { "trigger_days_before_due": 2, "action": "notify_officer" },
    { "trigger_days_after_due": 0, "action": "flag_overdue" }
  ],
  "required_fields": ["subject", "sender_details"],
  "fee_required": false,
  "allows_appeal": false,
  "response_requires_hod_signoff": false,
  "public_trackable": false
}
```

---

## 6. SLA / Escalation Rule Engine Logic

Runs as a scheduled daily job plus event triggers on case creation and status change.

**On case creation:**
```
due_date = calculate_due_date(
  start_date = case.date_received,
  sla_days = config[case.case_type].sla_days,
  calendar_type = config[case.case_type].sla_calendar
)
case.due_date = due_date
case.escalation_state = "on_track"
```

**Daily scan (every open case):**
```
for case in open_cases:
    config = case_type_config[case.case_type]
    days_remaining = case.due_date - today

    for rule in config.escalation_rules:
        if rule has "trigger_days_before_due"
           and days_remaining == rule.trigger_days_before_due
           and not already_fired(case, rule):
               execute(rule.action, case)
               log_escalation(case, rule)

        if rule has "trigger_days_after_due"
           and (today - case.due_date) == rule.trigger_days_after_due
           and not already_fired(case, rule):
               execute(rule.action, case)
               log_escalation(case, rule)

    case.escalation_state = compute_state(days_remaining)
    // "on_track" (>5 days left), "amber" (≤5), "red" (overdue)
```

**Action handlers (shared across all case types):**
```
notify_officer(case)
notify_officer_and_hod(case)
flag_overdue_escalate_hod(case)      // sets priority = critical, notifies HOD, red flag on dashboard
escalate_appellate_authority(case)   // auto-creates linked appeal-track entry, notifies appellate authority
```

**On status change to "closed":**
```
case.status = "closed"
case.closed_date = today
cancel_pending_escalations(case)
if config[case.case_type].post_closure_feedback_enabled:
    trigger_feedback_request(case.submitter_contact, case.case_id)
```

**On appeal filing:**
```
appeal_case = create_case(
    case_type = config[original.case_type].appeal_case_type,
    linked_case_id = original.case_id,
    submitter_details = original.submitter_details,  // pre-filled, editable
    date_received = today
)
// appeal gets its own SLA clock from its own config row
```

**Design notes:**
- Dashboard color-coding reads `case.escalation_state`, computed identically regardless of case type.
- Working-day vs. calendar-day SLA math is isolated in one `calculate_due_date()` function — this is where RTI/CPGRAMS (calendar days) and internal dak (often working days) diverge, and it's config-driven, not hardcoded.
- A new case type in future needs zero engine changes — just a new config row.

---

## 7. Screens Needed

### Citizen Portal
- Landing / Choose Service — smart categorization (RTI / Grievance / General Correspondence) or free-text intake triaged internally
- Submission Form — dynamic fields per case type
- Payment Screen — RTI fee collection (UPI/card/netbanking), BPL fee-waiver toggle
- Track Status — case ID lookup, no login required
- Appeal Filing Screen — pre-fills from original case ID
- Feedback Screen — post-closure satisfaction rating
- My Submissions (optional login) — history across all categories

### Officer/Internal Portal
- Unified Inbox / My Cases — all assigned items regardless of type, filterable by type/due date/priority
- Case Detail View — consistent layout, type-specific fields show/hide
- Response Drafting Screen — RTI includes Section 8 exemption picker; grievance includes resolution category
- Forward/Reassign Screen — route between officers/departments
- Approval/Sign-off Screen — HOD approval before final response
- Bulk Intake Screen — scan physical post → auto-create case, select type; also used to manually log items received directly on rtionline.gov.in / CPGRAMS

### Admin/Compliance Console
- Case Type Configuration — define categories, SLA days, required fields, escalation rules
- PIO/GRO/Officer Mapping — designated officer per subject area, per case type
- Statutory SLA Dashboard — RTI, grievance, and general dak pendency side by side, color-coded
- Escalation Rules Engine (UI) — edit T-minus/T-plus triggers per case type
- Compliance Reports — RTI annual return format, grievance disposal reports, general dak MIS — all filtered from the same case table
- Fee/Payment Reconciliation (RTI) — collected fees vs. gateway settlement
- Audit Log Viewer — immutable trail across all case types
- Notification Template Manager — SMS/email templates per stage per case type

### Cross-Cutting Utility Screens
- Global Search — across all case types by ID, name, subject, keyword
- Notifications Center (internal) — new assignments, approaching deadlines
- Help/FAQ per case type

---

## 8. Suggested Build Order

1. Case engine core + `case` table + case type config schema
2. Admin console: Case Type Configuration, Officer/Department Mapping
3. Officer Portal: Unified Inbox, Case Detail, Forward/Reassign
4. SLA/escalation engine + notifications
5. Citizen Portal: submission, tracking, payment
6. Bulk/manual intake screen (bridge to national RTI/CPGRAMS portals)
7. Appeals workflow + feedback capture
8. Compliance reports + audit log viewer

---

## 9. Open Items / Future Considerations

- Pursue sanctioned API access with DARPG/NIC if volume justifies it — would let the Bulk Intake screen become an auto-sync screen instead of manual entry.
- Confirm which SLA calendar (working vs. calendar days) applies for the specific state/department, as this varies.
- Decide whether appeals need a separate escalation authority mapping per department or a single designated Appellate Authority.