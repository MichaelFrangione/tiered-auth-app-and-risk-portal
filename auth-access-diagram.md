# Authentication & Authorization Flow Diagram

This diagram shows how roles and organizations work together to determine access in your tiered authentication system.

```mermaid
graph TD
    A[User Login] --> B{Session Valid?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Extract User Info]
    
    D --> E[ADMIN Role]
    D --> F[DIRECTOR Role] 
    D --> G[ANALYST Role]
    
    E --> H[System-wide Access]
    H --> H1[All Organizations]
    H --> H2[All Submissions]
    H --> H3[Edit Any Submission]
    H --> H4[Delete Any Submission]
    
    F --> I[Organization Access]
    I --> I1[Own Organization Only]
    I --> I2[All Submissions in Org]
    I --> I3[Edit Any in Org]
    I --> I4[Delete Any in Org]
    
    G --> J[Limited Access]
    J --> J1[Own Organization Only]
    J --> J2[View All in Org]
    J --> J3[Edit Own Only]
    J --> J4[Delete Own Only]
    
    K[Organization A] --> K1[Admin User]
    K --> K2[Director User]
    K --> K3[Analyst User]
    
    L[Organization B] --> L1[Director User]
    L --> L2[Analyst User]
    
    classDef adminClass fill:#ff6b6b,stroke:#d63031,stroke-width:2px,color:#fff
    classDef directorClass fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff
    classDef analystClass fill:#55a3ff,stroke:#2d3436,stroke-width:2px,color:#fff
    classDef orgClass fill:#a29bfe,stroke:#6c5ce7,stroke-width:2px,color:#fff
    
    class E,H,H1,H2,H3,H4 adminClass
    class F,I,I1,I2,I3,I4 directorClass
    class G,J,J1,J2,J3,J4 analystClass
    class K,L,K1,K2,K3,L1,L2 orgClass
```

## Key Access Rules

### ADMIN Role
- **Organization Access**: All organizations
- **Submission Viewing**: All submissions across all organizations
- **Submission Editing**: Any submission
- **Submission Deletion**: Any submission
- **User Data**: Full access to all user fields

### DIRECTOR Role
- **Organization Access**: Own organization only
- **Submission Viewing**: All submissions within their organization
- **Submission Editing**: Any submission within their organization
- **Submission Deletion**: Any submission within their organization
- **User Data**: Full access to user fields

### ANALYST Role
- **Organization Access**: Own organization only
- **Submission Viewing**: All submissions within their organization
- **Submission Editing**: Only their own submissions
- **Submission Deletion**: Only their own submissions
- **User Data**: Limited fields (id, name, email, role, createdAt)

## Permission Enforcement Points

1. **Middleware**: Basic authentication check
2. **API Routes**: Role-based access control
3. **Database Queries**: Organization filtering
4. **UI Components**: Field visibility based on role
5. **Submission Operations**: Ownership and organization checks

## Security Model

The system implements a **hierarchical access control** model where:
- **ADMIN** has system-wide privileges
- **DIRECTOR** has organization-wide privileges
- **ANALYST** has self-managed privileges within their organization

This creates a secure, scalable permission system that prevents unauthorized access while allowing appropriate levels of management within organizations.
