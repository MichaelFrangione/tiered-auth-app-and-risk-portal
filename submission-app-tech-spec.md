# Tiered Auth Tech Spec

```mermaid
graph TD
    A[User Login] --> B{Session Valid?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Read Session Data]
    D --> E[Check Access Role]
    
    E --> F[ADMIN]
    E --> G[DIRECTOR]
    E --> H[ANALYST]
    
    F --> F1[View All Submissions]
    F --> F2[Edit Any]
    F --> F3[Delete Any]
    
    G --> G1[View All Submissions]
    G --> G2[Edit Org Submissions]
    G --> G3[Delete Org Submissions]
    
    H --> H1[View All Submissions]
    H --> H2[Edit Own Only]
    H --> H3[Delete Own Only]
    
    classDef admin fill:#ff6b6b,stroke:#333,color:#fff
    classDef director fill:#74b9ff,stroke:#333,color:#fff
    classDef analyst fill:#2ecc71,stroke:#333,color:#fff
    
    class F,F1,F2,F3 admin
    class G,G1,G2,G3 director
    class H,H1,H2,H3 analyst
```

## Access Matrix

| Role | View Submissions | Edit Submissions | Delete Submissions |
|------|------------------|------------------|-------------------|
| **ADMIN** |  All | Any | Any |
| **DIRECTOR** | All | Own Org | Own Org |
| **ANALYST** | All | Own Only | Own Only |

## Security Model

The system implements a **hierarchical access control** model where:
- **ADMIN** has system-wide privileges
- **DIRECTOR** has organization-wide privileges
- **ANALYST** has self-managed privileges within their organization

This creates a secure, scalable permission system that prevents unauthorized access while allowing appropriate levels of management within organizations.

## Submission History

When editing a submission, the system would automatically tracks changes to all submissions, creating an immutable audit trail.

### How History Works

1. **Automatic Tracking** - Every time a submission is edited, a history entry is created
2. **Immutable Log** - History entries cannot be modified or deleted
3. **Complete Audit Trail** - Records who made changes, when, and what was changed

### History Entry Components

Each history entry contains:
- **Changed By**: User ID and name of who made the edit
- **Timestamp**: ISO formatted date/time of the change
- **Changes**: Array of field modifications (title/content) with:
  - Field name (title or content)
  - Old value
  - New value

All roles with view access to a submission would be able to view its complete edit history, providing transparency and accountability across the organization.

### Open Questions:

**History & Access:**
- Should a submission's history be viewable by a user of another organization?
- Should history be searchable/filterable by date range or user?

**Submission Management:**
- Can submissions be transferred between users or organizations?
- Should there be a submission "status" field (draft, submitted, reviewed, etc.)?
- Can submissions be duplicated/copied?
- Should there be bulk operations (bulk create, edit, or delete)?
- What happens to submissions if it's user or organization is deleted?

**Notifications:**
- Should users be notified when someone edits their submission?
- Should admins be notified of new submissions?

**Account Registration and Validation:**
- How do we ensure only legitimate institutional emails are used for registrations?

    **Approach 1: Admin-Created Accounts**
    - **Pros**: 
        - Complete control over who has access
        - Prevents fake signups
        - Simplest to implement (no validation needed)
    - **Cons**: 
        - Manual admin overhead for account creation
        - Doesn't scale well with many users
        - Users can't self-register
        - Admin needs to handle password distribution

    **Approach 2: Self-Registration with Multi-Layer Validation**
    - A combination of Domain Whitelisting, Email Verification Codes, and disposable email blocking.

```mermaid
graph LR
    A[User Enters Registration Info] --> B[Extract Email Domain]
    B --> C{Domain in Whitelist?}
    C -->|No| D[Reject - Invalid Domain]
    C -->|Yes| E{Is Disposable Email?}
    E -->|Yes| F[Reject - Disposable Email]
    E -->|No| G[Send Verification Code]
    G --> H[User Enters Code]
    H --> I{Code Valid?}
    I -->|No| J[Reject - Invalid Code]
    I -->|Yes| K[Create Account]
    K --> L[Account Activated]
    
    classDef reject fill:#e74c3c,stroke:#333,color:#fff
    classDef validation fill:#f39c12,stroke:#333,color:#fff
    classDef success fill:#2ecc71,stroke:#333,color:#fff
    classDef process fill:#3498db,stroke:#333,color:#fff
    
    class A,B,G,H,K,L process
    class C,E,I validation
    class D,F,J reject
    class L success
```

**Pros**:
- Users can self-register
- Domain whitelist restricts to institutional emails only
- Email verification ensures they own the email
- Blocks temporary/disposable email addresses
- Scales automatically

**Cons**:
- More complex implementation (3 validation layers)
- Need to maintain allowed domains list
- Requires paid email verification service (SendGrid, AWS SES)

**Recommendation**: 
- **Approach 1** is ideal for the interim phase while building and scaling the app initially
- **Approach 2** becomes a necessity once scaling to multiple organizations and higher user volumes


## Risk Assessment Mismatch Notifications:

The system can implement both **email and in-app notifications** to alert users about risk mismatches when multiple organizations submit entries with the same tag but different risk levels. Both approaches can be used together for maximum visibility and redundancy.

### When Notifications Occur

- **When a new submission is created** and conflicts with existing submission risk levels
- **When an existing submission's risk level is updated** and conflicts with other submissions sharing the same tag

### Who Receives Notifications

- All users who have created submissions with the conflicting tag (from any organization)
- Organization directors whose team members have conflicting submissions

### Email Notifications

- External alerts via email when users are not actively using the application
- Email providers: Resend (recommended), SendGrid, Nodemailer, AWS SES
- **Automated Daily Digest**: Cron jobs (scheduled tasks that run automatically at set times) can run daily outside the application to detect all existing mismatches and automatically send emails to affected users

### In-App Messaging

- Real-time notifications within the application interface
- Features: notification bell with unread count, persistent banners on affected pages
- Database-stored notifications with read/unread status
- Can be used alongside email notifications for redundancy

### Mismatch Detection Page

A dedicated page that aggregates and displays all risk mismatches across the system:
- Lists all tags with conflicting risk levels
- Shows submission count and involved organizations for each mismatch
- Displays all conflicting risk levels with color-coded badges
- Provides quick links to view detailed submission comparisons
- Enables users to quickly identify and resolve discrepancies

