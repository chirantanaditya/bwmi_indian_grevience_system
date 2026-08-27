# Tech Stack and AI Routing Plan

## Product Direction

The sharper problem to solve is not only filing an RTI, grievance, or correspondence item. The harder citizen problem is knowing **where to file it**.

Most public-service portals expect citizens to understand the government org chart: ministry, department, public authority, office, jurisdiction, and filing category. The product should reverse that flow.

The citizen should describe the issue in plain language, and the system should help resolve:

- Whether the issue is best handled as an RTI, grievance, or general correspondence.
- Which ministry, department, office, or public authority is likely responsible.
- What clarifying information is needed to route it correctly.
- What the expected timeline and next step should be.
- What is uncertain, mocked, or needs human confirmation.

The guiding principle:

> Ask citizens about their problem, not about the government org chart.

## Recommended Stack

### Framework

Use **Astro** as the main application framework.

Astro is a good fit because the public citizen-facing pages should be fast, lightweight, and accessible, while only some areas need heavier interactivity.

Use Astro with **server-side rendering / on-demand rendering**, not only static output, because the app needs:

- Logged-in dashboards.
- Role-specific pages.
- API routes.
- Cookies and sessions.
- Dynamic case and routing data.

Use React islands inside Astro for interactive surfaces such as:

- Routing assistant.
- Submission forms.
- Status tracker.
- Officer inbox.
- Admin configuration screens.

### UI

Use **shadcn/ui** for interface components.

Useful components for this product:

- Buttons, inputs, labels, textareas, selects.
- Dialogs and drawers.
- Tabs.
- Tables.
- Badges and status indicators.
- Command/search components.
- Form controls.
- Toasts or alerts.

The UI should feel like a serious public-service tool: clear, calm, mobile-friendly, and easy for non-technical users. Avoid making it feel like a marketing landing page.

### Authentication and Roles

Use **Better Auth** for authentication and session management.

Better Auth can support role-based access using roles and permissions. The app should use the authenticated user's role to decide which dashboard or page to show.

Suggested roles for the prototype:

| Role | Purpose |
|---|---|
| `citizen` | File a request, track status, provide feedback, file appeal |
| `officer` | View assigned cases, confirm routing, update status, draft response |
| `admin` | Manage departments, offices, categories, routing rules, and users |

Suggested route behavior:

- Citizen logs in and sees `/citizen`.
- Officer logs in and sees `/officer`.
- Admin logs in and sees `/admin`.
- A shared `/dashboard` route can redirect based on role.

For the competition prototype, keep access control simple and visible. The main demo should focus on the citizen journey, with just enough officer/admin flow to prove the routing engine works.

### Database

Use **Postgres** as the primary database.

Use either **Drizzle ORM** or **Prisma** for schema and migrations. Drizzle is a good choice if the app should stay lightweight and TypeScript-first.

Core tables:

| Table | Purpose |
|---|---|
| `users` | Authenticated users and role metadata |
| `departments` | Ministries, departments, public authorities, or agencies |
| `offices` | Regional/local offices under a department |
| `jurisdictions` | Location or service boundaries for office routing |
| `service_categories` | Common issue categories such as PF, rail refund, tax refund, road repair |
| `routing_patterns` | Known mappings from issue patterns to department/office/category |
| `submissions` | Citizen filings and tracking records |
| `routing_decisions` | AI/rules output for each submission |
| `routing_feedback` | Officer or admin corrections used to improve future routing |
| `timeline_events` | Append-only history of what happened to each case |
| `notification_events` | Email/SMS/in-app notification records and delivery status |

### Email Notifications

Use **Resend** for transactional email delivery and **React Email** for email templates.

Email should be event-driven. When an important case event happens, the app should:

1. Create a `timeline_events` record.
2. Decide whether the citizen, officer, or admin should be notified.
3. Create a `notification_events` record.
4. Send the email through Resend using a React Email template.
5. Store delivery status or failure details.

Useful email triggers:

- Filing submitted.
- Route suggested.
- Case assigned to an office.
- Case rerouted.
- Clarification requested.
- Clarification received.
- Status changed.
- Case due soon.
- Case overdue.
- Response sent.
- Case closed.
- Appeal created.

Citizen-facing emails should be plain and reassuring. They should include:

- Case ID.
- Current status.
- What changed.
- Where the issue is currently routed.
- What the citizen needs to do next, if anything.
- A link to track the case.

Officer/admin emails should be more operational. They can include:

- Case ID.
- Assigned office/officer.
- SLA due date.
- Priority.
- Required action.
- Link to the officer case view.

Example React Email template names:

```text
CaseSubmittedEmail
RouteSuggestedEmail
CaseReroutedEmail
ClarificationRequestedEmail
StatusChangedEmail
ResponseSentEmail
CaseClosedEmail
```

Example `notification_events` shape:

```json
{
  "id": "notif_001",
  "case_id": "GRV-2026-00128",
  "timeline_event_id": "evt_001",
  "recipient_user_id": "user_123",
  "recipient_email": "citizen@example.com",
  "channel": "email",
  "template": "StatusChangedEmail",
  "status": "sent",
  "provider": "resend",
  "provider_message_id": "resend_msg_123",
  "created_at": "2026-08-22T16:10:00+05:30",
  "sent_at": "2026-08-22T16:10:03+05:30"
}
```

For the competition prototype, emails can be limited to the main citizen journey:

- Submission confirmation.
- Route recommendation.
- Status change.
- Clarification request.
- Closure response.

Use mocked citizen emails in demos unless the user explicitly enters their own email address.

## AI Routing Architecture

The OpenAI model should be used meaningfully, but not wastefully. Routing is mostly classification, extraction, and clarification, so a smaller model is enough for most requests.

Recommended default model:

- `gpt-5-nano` for low-cost classification, extraction, routing suggestions, and clarifying questions.

Use a stronger model only when:

- The issue is ambiguous.
- Multiple departments are plausible.
- The user's text is long or messy.
- The system needs a higher-quality explanation.

### Routing Flow

```text
Citizen describes problem
        |
        v
AI extracts issue, intent, location, service clues
        |
        v
Routing engine checks department and office database
        |
        v
App asks clarifying questions if needed
        |
        v
Citizen sees recommended route with explanation
        |
        v
Citizen files RTI, grievance, or correspondence
        |
        v
Officer confirms or corrects the route
        |
        v
Timeline event and email notification are created
        |
        v
Correction improves future routing
```

### Tiered Routing Strategy

Use a layered approach so every request does not need an expensive AI call.

1. **Rules and database first**
   - Check known mappings.
   - Example: "PF transfer stuck" maps to EPFO.
   - Example: "train refund not received" maps to Railways or IRCTC-style route.

2. **Cheap model second**
   - Use `gpt-5-nano` to classify the issue.
   - Extract useful fields such as location, service, intent, urgency, and reference numbers.
   - Generate one or two clarifying questions if needed.

3. **Escalate only when ambiguous**
   - If confidence is low, ask the citizen for more information.
   - If still unclear, show multiple likely routes instead of pretending certainty.

4. **Human confirmation**
   - Let an officer or admin confirm or correct the route.
   - Store corrections as routing feedback.

## AI Output Shape

The routing assistant should return structured output, not just prose.

Example:

```json
{
  "intent": "grievance",
  "category": "provident_fund_transfer",
  "likely_department": "Employees' Provident Fund Organisation",
  "likely_office": "Regional PF Office Bengaluru",
  "confidence": 0.87,
  "required_clarifications": [
    "Which city or state is your employer registered in?",
    "Do you have a UAN or claim reference number?"
  ],
  "citizen_explanation": "This appears to be a provident fund service issue, so it is better handled as a grievance rather than an RTI unless you specifically want official records.",
  "suggested_next_step": "File an EPFO grievance with employer location and UAN details."
}
```

## Learning From Past Entries

The system should not train directly on raw citizen submissions. It should build a safer **routing knowledge base** from structured, non-sensitive routing outcomes.

Store:

- Extracted category.
- Selected department.
- Selected office.
- Clarifying questions asked.
- Final route confirmed by officer/admin.
- Whether the citizen accepted or changed the route.
- Confidence score.

Avoid storing:

- Real Aadhaar numbers.
- PAN details.
- OTPs.
- Passwords.
- Payment details.
- Sensitive health or personal information.
- Raw documents unless clearly mocked for the prototype.

Over time, the app can answer faster by checking similar previous cases before calling the AI model.

Future improvement:

- Add `pgvector` for semantic search over sanitized routing examples.
- Use retrieved examples as context for the model.
- Cache common routing decisions.

## Competition Framing

The project can be framed as:

> A plain-language routing assistant for Indian public-service filings. Citizens describe their issue, and the system identifies whether it should be filed as an RTI, grievance, or correspondence, then recommends the correct department, office, filing path, timeline, and next step.

This is stronger than only unifying DAK, RTI, and grievances because it solves the earlier point where citizens get stuck:

> Where do I even file this?

## Prototype Scope

For the hackathon, the main citizen journey should be:

1. Citizen enters a problem in plain language.
2. App asks clarifying questions.
3. App recommends a route.
4. Citizen sees why that route was chosen.
5. Citizen submits a mocked RTI/grievance/correspondence item.
6. Citizen receives a tracking ID.
7. Officer dashboard shows the case.
8. Officer confirms or corrects the route.
9. Citizen receives an email when the route or status changes.
10. Citizen can track status.

Keep mocked items clearly labeled:

- Mock departments and offices.
- Mock login credentials.
- Mock payments, if any.
- Mock tracking updates.
- Mock officer actions.

## Build Priority

1. Astro app with SSR.
2. shadcn/ui setup and base layout.
3. Better Auth login with `citizen`, `officer`, and `admin` roles.
4. Postgres schema for departments, offices, submissions, and routing decisions.
5. Citizen routing assistant.
6. AI route classification using `gpt-5-nano`.
7. Filing flow and tracking ID.
8. Officer dashboard to confirm/correct route.
9. Timeline events for case history.
10. Resend + React Email notifications for status changes.
11. Feedback loop into routing knowledge base.
12. Demo polish and public deployment.
