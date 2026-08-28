# Screen Flow Chart

This document maps the full CivicRoute prototype screen flow across citizen, officer, admin, timeline, notification, appeal, and compliance journeys.

## Master Product Flow

```mermaid
flowchart TD
    A[Public landing] --> B{User intent}

    B -->|Start new filing| C[Plain-language issue intake]
    B -->|Track existing case| T[Track status]
    B -->|Resume draft| MS[My submissions]
    B -->|Help| H[Help and FAQ]

    C --> D[AI and rules route analysis]
    D --> E{Enough information?}
    E -->|No| F[Clarifying questions]
    F --> D
    E -->|Yes| G[Recommended route]

    G --> G1[Compare alternatives]
    G1 --> G
    G --> G2[Edit details]
    G2 --> D
    G -->|Confirm| I{Filing type}

    I -->|RTI| R[RTI submission form]
    I -->|Grievance| V[Grievance submission form]
    I -->|Correspondence| K[General correspondence form]

    R --> P{RTI fee needed?}
    P -->|Yes| PAY[Mock payment or BPL waiver]
    P -->|No| SUB[Review and submit]
    PAY --> SUB
    V --> SUB
    K --> SUB

    SUB --> CID[Tracking ID generated]
    CID --> N1[Submission email queued]
    CID --> Q[Officer inbox]
    CID --> T

    Q --> CD[Officer case detail]
    CD --> OR{Officer decision}
    OR -->|Accept route| IP[Mark in progress]
    OR -->|Need info| CL[Request clarification]
    OR -->|Wrong route| FR[Forward or reassign]
    OR -->|Draft response| RD[Response drafting]

    CL --> N2[Clarification email queued]
    CL --> T
    FR --> N3[Reroute email queued]
    FR --> CD
    IP --> N4[Status-change email queued]
    IP --> CD
    RD --> SG{Sign-off required?}
    SG -->|Yes| AP[HOD approval]
    SG -->|No| RS[Response sent]
    AP --> RS
    RS --> N5[Response email queued]
    RS --> CLOSE[Case closed]
    CLOSE --> FB[Feedback screen]
    CLOSE --> APPEAL{Appeal allowed?}
    APPEAL -->|Yes| AF[Appeal filing]
    APPEAL -->|No| END[Journey complete]
    AF --> CID

    ADM[Admin console] --> CFG[Case type configuration]
    ADM --> MAP[Officer and office mapping]
    ADM --> SLA[SLA dashboard]
    ADM --> REP[Compliance reports]
    ADM --> AUD[Audit log]

    CFG --> D
    MAP --> D
    SLA --> Q
    AUD --> CD
```

## Citizen Screen Flow

```mermaid
flowchart TD
    A[Citizen welcome] --> B[Describe issue]
    B --> C[Clarifying questions]
    C --> D[Recommended route]

    D --> E{Citizen action}
    E -->|Confirm route| F[Dynamic filing form]
    E -->|Compare alternatives| G[Alternative routes]
    E -->|Edit issue| B
    G --> D

    F --> H{Filing type}
    H -->|RTI| I[RTI details]
    H -->|Grievance| J[Grievance details]
    H -->|Correspondence| K[Correspondence details]

    I --> L{Fee or waiver}
    L -->|Fee| M[Mock payment]
    L -->|BPL waiver| N[Waiver details]
    M --> O[Review filing]
    N --> O
    J --> O
    K --> O

    O --> P[Submit]
    P --> Q[Tracking ID]
    Q --> R[Track status timeline]
    R --> S{Case state}
    S -->|Needs clarification| T[Reply with details]
    S -->|Response sent| U[View response]
    S -->|Closed| V[Feedback]
    S -->|Appeal available| W[File appeal]

    T --> R
    U --> V
    W --> F
```

## Officer Screen Flow

```mermaid
flowchart TD
    A[Officer welcome] --> B[Unified inbox]
    B --> C{Filter}
    C -->|All cases| B
    C -->|Due soon| D[Due soon list]
    C -->|Overdue| E[Overdue list]
    C -->|Needs clarification| F[Clarification list]
    C -->|Misrouted| G[Route correction list]

    B --> H[Case detail]
    D --> H
    E --> H
    F --> H
    G --> H

    H --> I[Issue summary]
    H --> J[Route recommendation]
    H --> K[Citizen details]
    H --> L[Issue journey timeline]
    H --> M[SLA panel]

    J --> N{Route decision}
    N -->|Confirm| O[Assign or accept case]
    N -->|Correct| P[Forward or reassign]
    N -->|Need more info| Q[Ask citizen for clarification]

    O --> R[Mark in progress]
    P --> L
    Q --> L
    R --> S[Draft response]
    S --> T{Needs HOD sign-off?}
    T -->|Yes| U[Send for approval]
    T -->|No| V[Send response]
    U --> W[Approval screen]
    W --> V
    V --> X[Close case]
    X --> L
```

## Admin Screen Flow

```mermaid
flowchart TD
    A[Admin welcome] --> B[Operations dashboard]
    B --> C[Routing accuracy]
    B --> D[SLA compliance]
    B --> E[Configuration gaps]
    B --> F[Recent audit events]

    A --> G[Departments]
    G --> H[Department detail]
    H --> I[Offices]
    I --> J[Office detail]
    J --> K[Jurisdiction mapping]

    A --> L[Routing rules]
    L --> M[Create or edit rule]
    M --> N[Test rule with sample issue]
    N --> O{Good match?}
    O -->|Yes| P[Save rule]
    O -->|No| M

    A --> Q[Case categories]
    Q --> R[Case type configuration]
    R --> S[SLA and escalation rules]
    S --> T[Notification templates]

    A --> U[Users and roles]
    U --> V[Citizen, officer, admin permissions]

    A --> W[Reports]
    W --> X[RTI return]
    W --> Y[Grievance disposal report]
    W --> Z[General DAK MIS]

    A --> AA[Audit log]
    AA --> AB[Timeline event detail]
```

## Timeline And Notification Flow

```mermaid
flowchart TD
    A[Case event occurs] --> B[Create append-only timeline event]
    B --> C{Citizen-visible?}
    C -->|Yes| D[Show on citizen tracking timeline]
    C -->|No| E[Show only to officer or admin]

    B --> F{Notification needed?}
    F -->|No| G[No outbound message]
    F -->|Yes| H[Create notification event]

    H --> I{Recipient}
    I -->|Citizen| J[Citizen email template]
    I -->|Officer| K[Officer email template]
    I -->|Admin| L[Admin email template]

    J --> M[Render React Email]
    K --> M
    L --> M
    M --> N[Send through Resend]
    N --> O{Delivery result}
    O -->|Sent| P[Store provider message ID]
    O -->|Failed| Q[Store failure and retry state]
    P --> R[Notification center]
    Q --> R
```

## Appeal Flow

```mermaid
flowchart TD
    A[Case closed or response sent] --> B{Appeal allowed?}
    B -->|No| C[Feedback only]
    B -->|Yes| D[Appeal option shown]

    D --> E[Citizen starts appeal]
    E --> F[Original case ID lookup]
    F --> G[Pre-filled appeal form]
    G --> H[Citizen adds reason for appeal]
    H --> I[Submit appeal]
    I --> J[New linked appeal case]
    J --> K[Appeal SLA clock starts]
    K --> L[Assigned appellate authority]
    L --> M[Appeal timeline]
    M --> N[Appeal response]
    N --> O[Appeal closed]
```

## Screen Inventory

| Area | Screen | Purpose |
|---|---|---|
| Public | Citizen welcome | Start filing, track case, resume draft |
| Public | Plain-language issue intake | Capture issue before asking for department |
| Public | Clarifying questions | Collect location, service, reference number, desired outcome |
| Public | Recommended route | Show filing type, department, office, confidence, and reasoning |
| Public | Alternative routes | Compare likely departments/offices when confidence is low |
| Public | Dynamic filing form | Collect type-specific RTI, grievance, or correspondence details |
| Public | RTI fee or waiver | Mock payment or BPL waiver path |
| Public | Review and submit | Final citizen confirmation before case creation |
| Public | Tracking ID | Confirmation and next step |
| Public | Track status | Citizen-visible timeline and current status |
| Public | Clarification reply | Citizen responds to officer request |
| Public | View response | Citizen sees final response or closure note |
| Public | Feedback | Satisfaction rating after closure |
| Public | Appeal filing | Linked appeal flow after eligible closure |
| Officer | Officer welcome | Daily queue summary |
| Officer | Unified inbox | All assigned RTI, grievance, and correspondence cases |
| Officer | Case detail | Work surface for one case |
| Officer | Route confirmation | Accept, correct, or request more information |
| Officer | Forward or reassign | Move case to another office/officer |
| Officer | Response drafting | Draft reply with type-specific fields |
| Officer | Approval/sign-off | HOD or appellate sign-off where needed |
| Officer | Bulk intake | Manual bridge for physical post, RTI Online, or CPGRAMS items |
| Admin | Admin welcome | System health and operational overview |
| Admin | Departments | Manage ministries, departments, and public authorities |
| Admin | Offices | Manage regional/local office mappings |
| Admin | Jurisdiction mapping | Define which office handles which service/location |
| Admin | Routing rules | Configure and test routing patterns |
| Admin | Case categories | Configure RTI, grievance, correspondence, and appeals |
| Admin | SLA rules | Configure deadlines and escalation triggers |
| Admin | Notification templates | Manage Resend/React Email templates |
| Admin | Users and roles | Manage citizen, officer, admin permissions |
| Admin | Reports | RTI returns, grievance disposal, DAK MIS |
| Admin | Audit log | Immutable event and routing history |
| Shared | Global search | Search by case ID, name, subject, department, or keyword |
| Shared | Notifications center | Status changes, due soon, overdue, clarification requests |
| Shared | Help and FAQ | Plain-language guidance by filing type |

## Demo Path

For a short competition demo, use this path:

```mermaid
flowchart LR
    A[Citizen describes PF issue] --> B[Assistant recommends EPFO grievance]
    B --> C[Citizen confirms and submits]
    C --> D[Tracking ID generated]
    D --> E[Officer sees case]
    E --> F[Officer requests clarification]
    F --> G[Citizen receives email]
    G --> H[Timeline shows where issue went]
    H --> I[Officer marks in progress]
    I --> J[Citizen gets status update]
```

