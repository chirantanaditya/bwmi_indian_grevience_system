# Design System - Civic Routing Portal

## Design Direction

This design system takes inspiration from Shopify's admin UI: quiet, structured, accessible, and optimized for repeated operational use. It should not copy Shopify branding, logos, colors, or exact component styling. The goal is to borrow the product qualities that make the interface feel trustworthy:

- Clear hierarchy.
- Compact but readable layouts.
- Calm neutral surfaces.
- Strong status visibility.
- Accessible controls.
- Persistent navigation.
- Workflows that feel predictable.

For this project, the interface should feel like a serious civic service tool, not a marketing site. Citizens should feel guided, officers should feel efficient, and admins should feel in control.

## Product Personality

The product should feel:

- **Reliable**: clear labels, visible state, no mystery actions.
- **Plain-spoken**: human language over bureaucratic wording.
- **Calm**: minimal decoration, restrained color, generous spacing where decisions matter.
- **Efficient**: dense enough for officers and admins to process many cases.
- **Accessible**: keyboard-friendly, screen-reader-friendly, high contrast, mobile usable.
- **Transparent**: explain why a route was suggested and what is mocked.

Avoid:

- Decorative gradients.
- Oversized landing-page hero sections.
- Low-contrast gray text.
- Long forms before the user understands the path.
- Making citizens choose from government hierarchy first.
- Styling that implies official Government of India endorsement.

## Core Layout

### Public Citizen Experience

The citizen side should use a focused single-column or two-column layout depending on screen size.

Primary pages:

- Plain-language issue intake.
- Clarifying questions.
- Recommended route.
- Filing form.
- Tracking page.
- Feedback or appeal page.

The citizen experience should feel more spacious than the internal dashboard because the user is making fewer, higher-stress decisions.

### Internal Officer/Admin Experience

The internal experience should use an admin-shell layout:

- Dark or high-contrast top bar.
- Light neutral sidebar.
- Main content region.
- Optional right-side context panel.
- Cards for case sections.
- Tables for inboxes and admin configuration.

Suggested desktop structure:

```text
Top bar: product name, search, notifications, user menu
Sidebar: role-specific navigation
Main: current case, inbox, or configuration surface
Right panel: metadata, citizen details, route explanation, SLA status
```

Suggested mobile structure:

```text
Top bar: product name, menu, search
Main: stacked cards and forms
Bottom or drawer navigation for key actions
```

## Navigation

### Citizen Navigation

Keep citizen navigation minimal:

- New filing
- Track status
- My submissions
- Help

Do not expose internal terms like "case engine", "routing feedback", or "jurisdiction mapping" to citizens.

### Officer Navigation

Officer navigation should support daily work:

- Inbox
- Due soon
- Overdue
- Reassigned
- Closed
- Search

### Admin Navigation

Admin navigation should support configuration and oversight:

- Dashboard
- Departments
- Offices
- Routing rules
- Case categories
- Users and roles
- Reports
- Audit log

## Visual System

### Color Tokens

Use a neutral foundation with restrained semantic color. Color should communicate status, not decorate the page.

```css
:root {
  --color-bg-app: #f1f1f1;
  --color-bg-surface: #ffffff;
  --color-bg-muted: #f7f7f7;
  --color-bg-inset: #eeeeee;

  --color-text: #1f1f1f;
  --color-text-muted: #616161;
  --color-text-subtle: #7a7a7a;
  --color-text-inverse: #ffffff;

  --color-border: #d9d9d9;
  --color-border-strong: #b5b5b5;

  --color-action: #0b5cab;
  --color-action-hover: #084a8a;
  --color-action-soft: #e8f2ff;

  --color-success: #0f7a3f;
  --color-success-soft: #e5f5ec;

  --color-warning: #8a5a00;
  --color-warning-soft: #fff1c2;

  --color-danger: #b42318;
  --color-danger-soft: #fde8e7;

  --color-info: #075985;
  --color-info-soft: #e0f2fe;

  --color-topbar: #1a1a1a;
  --color-sidebar: #ebebeb;
}
```

### Status Colors

| Status | Meaning | Token |
|---|---|---|
| New | Submitted but not assigned | `--color-info-soft` |
| Assigned | Officer has ownership | `--color-action-soft` |
| Due soon | SLA approaching | `--color-warning-soft` |
| Overdue | SLA missed | `--color-danger-soft` |
| Resolved | Closed successfully | `--color-success-soft` |
| Needs clarification | Citizen/officer input needed | `--color-warning-soft` |
| Misrouted | Route correction needed | `--color-danger-soft` |

### Typography

Use a system font stack for performance and familiarity.

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Suggested type scale:

| Token | Size | Use |
|---|---:|---|
| `text-xs` | 12px | Metadata, table helper text |
| `text-sm` | 14px | Sidebar, labels, compact controls |
| `text-md` | 16px | Body text, form inputs |
| `text-lg` | 18px | Card titles |
| `text-xl` | 22px | Page titles |
| `text-2xl` | 28px | Citizen intake title |

Rules:

- Do not scale text based on viewport width.
- Use normal letter spacing.
- Keep labels short and specific.
- Prefer sentence case over title case in body UI.

### Spacing

Use an 8px spacing system.

| Token | Value | Use |
|---|---:|---|
| `space-1` | 4px | Tight icon/text gap |
| `space-2` | 8px | Small internal gap |
| `space-3` | 12px | Form label/input gap |
| `space-4` | 16px | Card padding compact |
| `space-5` | 20px | Card padding comfortable |
| `space-6` | 24px | Section gap |
| `space-8` | 32px | Page group gap |

### Radius

Keep corners restrained.

| Token | Value | Use |
|---|---:|---|
| `radius-sm` | 4px | Badges, inputs |
| `radius-md` | 6px | Buttons, table rows |
| `radius-lg` | 8px | Cards, dialogs |

Do not use very pill-shaped or bubbly components except for compact status badges.

### Elevation

Use borders first, shadows second.

```css
--shadow-card: 0 1px 2px rgba(0, 0, 0, 0.08);
--shadow-popover: 0 8px 24px rgba(0, 0, 0, 0.14);
```

Cards should generally use:

- White surface.
- 1px border.
- 8px radius.
- Subtle shadow only when layered above the page.

## Components

### Top Bar

Purpose:

- Establish app identity.
- Provide global search.
- Show notifications.
- Show current role/account.

Behavior:

- Search should support case ID, citizen name, department, and keyword.
- User menu should expose role and sign out.
- Notifications should include overdue, due soon, reassigned, and clarification-needed items.

### Sidebar

Purpose:

- Persistent role-based navigation.
- Quick scanning of work areas.

Rules:

- Active item uses white or raised background with clear text.
- Icons help scanning but must not be the only label.
- Counters should be compact badges.
- Group internal sections with muted headings.

### Cards

Use cards for:

- Case sections.
- Route recommendation.
- Citizen contact details.
- Payment or fee details.
- Notes.
- Timeline entries.
- Repeated inbox summaries.

Do not place cards inside cards.

Card structure:

```text
Header: title, status/action
Body: fields, text, or table
Footer: primary and secondary actions when needed
```

### Status Badge

Badges should be short and semantic.

Examples:

- `RTI`
- `Grievance`
- `Needs clarification`
- `Due in 3 days`
- `Overdue`
- `Route confirmed`
- `Mock data`

Badge rules:

- Include text, not color alone.
- Use soft background and dark text.
- Avoid more than 3 badges beside a heading.

### Buttons

Button hierarchy:

| Variant | Use |
|---|---|
| Primary | Continue, submit, confirm route, send response |
| Secondary | Save draft, back, view details |
| Destructive | Reject, close as invalid, delete rule |
| Ghost/Icon | Edit, copy, expand, more actions |

Rules:

- Primary action appears once per view or card section.
- Use icons for common compact actions like edit, copy, search, filter, back, more.
- Buttons must have accessible names.
- Loading states must prevent duplicate submission.

### Forms

Form design should reduce anxiety.

Rules:

- Ask for the issue first, not the department first.
- Group fields by purpose.
- Show why a field is needed when it affects routing.
- Use inline validation.
- Preserve user input when moving between steps.
- Support draft saving for longer filings.

Recommended citizen intake fields:

- What happened?
- Where did it happen?
- What do you want?
- Do you have a reference number?
- Upload supporting document.

### Route Recommendation Panel

This is the signature component of the product.

It should show:

- Recommended route.
- Filing type: RTI, grievance, or correspondence.
- Likely department or public authority.
- Likely office.
- Confidence level.
- Why this route was selected.
- What information is still needed.
- Alternatives if confidence is low.

Example layout:

```text
Recommended route
Grievance -> EPFO -> Regional PF Office Bengaluru

Why this route?
Your issue mentions PF transfer delay and asks for action, not records.

Confidence: High

Actions:
Confirm and continue
Compare alternatives
Edit details
```

### Case Timeline

Every case should have a readable timeline.

Timeline events:

- Submitted.
- Route suggested.
- Clarification requested.
- Assigned.
- Officer updated status.
- Route corrected.
- Response drafted.
- Closed.
- Feedback received.

Each event should show:

- Date/time.
- Actor.
- Plain-language summary.
- Any attachment or note.

## Issue Journey Timeline

The issue timeline is the main way to show what happened with a citizen's filing and where it went. It should work like an operational history, similar in spirit to an order timeline: every important system, citizen, officer, and routing event appears in one chronological thread.

The timeline should answer four questions quickly:

- What happened?
- Who or what caused it?
- Where did the issue go?
- What is expected next?

### Timeline Placement

On a case detail page, place the timeline below the primary case cards, with enough width for comfortable reading.

Recommended layout:

```text
Main column
- Case summary
- Route recommendation / current route
- Filing details
- Timeline

Right panel
- Citizen details
- Current owner
- SLA status
- Related filings
- Tags
```

For citizens, the timeline should be simpler and more reassuring. For officers and admins, it should include routing, audit, SLA, and internal note events.

### Timeline Composer

At the top of the timeline, show a comment/update composer for internal users.

Officer/admin composer actions:

- Add internal note.
- Ask citizen for clarification.
- Attach file.
- Mention another officer.
- Change status.
- Reassign route.

Citizen composer actions:

- Reply to clarification request.
- Add supporting document.
- Add comment after submission.

Citizen comments should be clearly separated from internal-only notes.

### Event Types

| Event type | Example text | Visible to citizen |
|---|---|---|
| `submitted` | Filing submitted by Ravi Kumar. | Yes |
| `route_suggested` | Route suggested: Grievance -> EPFO -> Regional PF Office Bengaluru. | Yes |
| `clarification_requested` | Officer requested employer city and UAN. | Yes |
| `clarification_received` | Citizen submitted clarification. | Yes |
| `assigned` | Assigned to Assistant PIO, Regional PF Office Bengaluru. | Yes, simplified |
| `rerouted` | Rerouted from Ministry of Labour to EPFO Regional Office Bengaluru. | Yes |
| `status_changed` | Status changed from New to In progress. | Yes |
| `sla_warning` | Case is due in 3 days. | Officer/admin only by default |
| `sla_overdue` | Case became overdue. | Officer/admin only by default |
| `internal_note` | Officer added an internal note. | No |
| `response_drafted` | Draft response prepared. | Officer/admin only |
| `response_sent` | Response sent to citizen. | Yes |
| `closed` | Case closed as resolved. | Yes |
| `appeal_created` | Appeal filed and linked to this case. | Yes |
| `feedback_received` | Citizen rated the resolution 4 out of 5. | Officer/admin only by default |

### Timeline Visual Pattern

Use a vertical line with compact event markers.

Visual rules:

- Events are grouped by date: Today, Yesterday, August 21, 2026.
- Each event has a small marker on the line.
- Important events use a stronger marker or badge.
- Routine events use muted markers.
- The timestamp sits on the right on desktop and below the event text on mobile.
- Actions such as "View response", "View attachment", or "Compare route" appear below the event text.

Example structure:

```text
Timeline

[Comment composer]

Today
o Response sent to citizen.
  View response                                      4:12 PM

o Case reassigned to Regional PF Office Bengaluru.
  Previous route: Ministry of Labour and Employment  3:28 PM

o Officer requested clarification.
  Needed: employer city and UAN                      2:10 PM

August 21, 2026
o Route suggested by assistant.
  Grievance -> EPFO -> Regional PF Office Bengaluru
  Confidence: High                                   6:45 PM

o Filing submitted by Ravi Kumar.
  Case ID: GRV-2026-00128                            6:42 PM
```

### Citizen Timeline Copy

Citizen-facing timeline text should avoid internal jargon.

Prefer:

- "We found the likely office."
- "Your issue was sent to Regional PF Office Bengaluru."
- "The officer asked for more information."
- "You replied with the requested details."
- "A response was sent."
- "Your case was closed."

Avoid:

- "Workflow transitioned."
- "Entity owner changed."
- "SLA state mutated."
- "Case reassigned to node."
- "Rule engine fired escalation."

### Officer/Admin Timeline Copy

Officer/admin timeline can include more operational detail, but should still be readable.

Examples:

- "Routing assistant suggested EPFO Regional Office Bengaluru with high confidence."
- "Officer corrected route from Ministry of Labour to EPFO Regional Office Bengaluru."
- "SLA warning sent to assigned officer. Due in 3 days."
- "Internal note added by Priya S."
- "Citizen clarification received with UAN ending 4821."

For the prototype, use mock IDs and clearly fake sensitive details.

### Route Movement Events

Because this product solves department discovery, route movement deserves special treatment.

Every route change should show:

- Previous department or office.
- New department or office.
- Reason for movement.
- Actor: AI assistant, citizen, officer, admin, or system.
- Whether the citizen can see it.

Example:

```text
Case rerouted

From: Ministry of Labour and Employment
To: Employees' Provident Fund Organisation -> Regional PF Office Bengaluru
Reason: Issue is about PF transfer delay and includes employer location.
Changed by: Officer
```

### Timeline Data Shape

Store timeline events as append-only records. Do not overwrite past events.

```json
{
  "id": "evt_001",
  "case_id": "GRV-2026-00128",
  "event_type": "rerouted",
  "title": "Case rerouted",
  "summary": "Rerouted from Ministry of Labour to EPFO Regional Office Bengaluru.",
  "actor_type": "officer",
  "actor_name": "Priya S.",
  "visibility": "citizen",
  "created_at": "2026-08-22T15:28:00+05:30",
  "metadata": {
    "from_department": "Ministry of Labour and Employment",
    "to_department": "Employees' Provident Fund Organisation",
    "to_office": "Regional PF Office Bengaluru",
    "reason": "PF transfer delay with employer city provided"
  }
}
```

### Timeline Filters

Officer/admin users should be able to filter timeline events:

- All events.
- Citizen-visible events.
- Internal notes.
- Routing changes.
- SLA events.
- Attachments.

Citizens should not need filters unless the timeline is long.

### Timeline Accessibility

Timeline requirements:

- Use semantic list markup.
- Do not rely on the vertical line alone to communicate order.
- Each event needs readable text.
- Buttons inside events need accessible labels.
- Timestamps should use machine-readable datetime values in code.
- Internal-only events must not appear in citizen views.

### Tables

Tables are for officer/admin surfaces only.

Recommended columns for officer inbox:

- Case ID.
- Type.
- Subject.
- Citizen/location.
- Assigned office.
- SLA.
- Status.
- Last updated.

Rules:

- Make rows clickable.
- Support search and filters.
- Keep visible columns useful on small screens.
- Use status badges, not long status paragraphs.

### Empty States

Empty states should be practical.

Examples:

- "No cases due today."
- "No routing rules match this search."
- "No submissions yet."

Include one clear next action when useful.

## Accessibility Requirements

The interface should meet WCAG AA expectations.

Requirements:

- Minimum 4.5:1 contrast for body text.
- Minimum 3:1 contrast for large text and essential UI indicators.
- Visible keyboard focus on every interactive element.
- No status communicated by color alone.
- Form labels must be programmatically associated with inputs.
- Error messages must be text-based and close to the field.
- Dialogs must trap focus and close predictably.
- Tables need clear headers.
- Icon-only buttons need accessible labels.
- Touch targets should be at least 40px by 40px.

## Content Style

Use plain civic language.

Prefer:

- "Tell us what happened"
- "We found the likely office"
- "This looks like a grievance"
- "Ask for official records with an RTI"
- "Track your filing"
- "Needs more information"

Avoid:

- "Select parent ministry"
- "Choose nodal public authority"
- "Submit representation"
- "Jurisdictional mapping failed"
- "Workflow entity created"

## Role-Specific Welcome Pages

### Citizen Welcome

Primary focus:

- Start a filing.
- Track an existing filing.
- Resume a draft.

Suggested content:

```text
What do you need help with?

[Describe your issue]

Recent submissions
Track by case ID
```

### Officer Welcome

Primary focus:

- Work queue.
- Due soon.
- Overdue.
- Needs clarification.

Suggested content:

```text
My cases

Due today
Due this week
Needs clarification
Recently reassigned
```

### Admin Welcome

Primary focus:

- System health.
- Routing accuracy.
- SLA performance.
- Configuration gaps.

Suggested content:

```text
Operations overview

Routing confidence
Pending route corrections
SLA compliance
Departments without office mapping
```

## Example shadcn/ui Mapping

| Need | shadcn/ui component |
|---|---|
| Primary and secondary actions | `Button` |
| Field groups | `Card` only when grouping a meaningful section |
| Inputs | `Input`, `Textarea`, `Select` |
| Long forms | `Form` |
| Route alternatives | `Tabs` or `RadioGroup` |
| Case status | `Badge` |
| Inbox | `Table` |
| Filters | `Popover`, `Command`, `Checkbox` |
| Confirm actions | `Dialog` or `AlertDialog` |
| Notifications | `Toast` or in-app notification list |
| User/account menu | `DropdownMenu` |
| Clarification wizard | `Stepper` pattern built from existing primitives |

## Design Checklist

Before shipping a screen, check:

- Can a citizen complete the task without knowing the department first?
- Is the primary action obvious?
- Is the status visible in text, not just color?
- Are mock items clearly labeled?
- Does the layout work on mobile?
- Can the screen be used with keyboard only?
- Are officer/admin tables dense but readable?
- Are route explanations plain-language and transparent?
- Is the interface calm enough for a stressful public-service task?
