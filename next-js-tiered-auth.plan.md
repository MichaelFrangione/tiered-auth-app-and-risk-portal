<!-- 8d3bb4e9-52d1-40d1-bb30-979671f25ebb 0c611c26-e1d6-48c6-ae20-ec873c7660b0 -->
# Next.js Tiered Authentication System

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Prisma (for type-safe database access)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Password Hashing**: bcrypt
- **Styling**: Tailwind CSS (for quick, modern UI)

## Database Schema

### Users Table

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String    // hashed with bcrypt
  organizationId String
  role          Role      @default(ANALYST)
  organization  Organization @relation(fields: [organizationId], references: [id])
  submissions   Submission[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  ADMIN
  DIRECTOR
  ANALYST
}

model Organization {
  id          String   @id @default(cuid())
  name        String   @unique
  users       User[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Submission {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  data      Json     // flexible for POC
  createdAt DateTime @default(now())
}
```

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── register/
│   │       └── page.tsx          # Registration page
│   ├── (protected)/
│   │   └── dashboard/
│   │       └── page.tsx          # Protected dashboard
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth configuration
│   ├── layout.tsx
│   └── page.tsx                  # Landing/redirect page
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Sample data
├── lib/
│   ├── auth.ts                   # Auth config & helpers
│   ├── db.ts                     # Prisma client
│   └── permissions.ts            # Role-based access logic
├── middleware.ts                 # Route protection
└── components/
    └── auth/
        └── login-form.tsx        # Reusable auth forms
```

## Implementation Steps

### 1. Project Initialization

- Create Next.js app with TypeScript
- Install dependencies: `prisma`, `@prisma/client`, `next-auth`, `bcrypt`, `@types/bcrypt`, `tailwindcss`
- Set up Tailwind CSS configuration

### 2. Database Setup

- Set up Neon PostgreSQL database (user will provide connection string)
- Initialize Prisma with schema defined above
- Create `.env.local` with `DATABASE_URL` and `NEXTAUTH_SECRET`
- Run migrations and seed script to create sample organizations and users

### 3. Authentication Implementation

- Configure NextAuth.js with Credentials provider
- Create custom login/register pages with email/password forms
- Implement password hashing with bcrypt (10 salt rounds)
- Set up session management with JWT strategy
- Add user role and organization to session object

### 4. Role-Based Access Control

- Create `lib/permissions.ts` with helper functions:
  - `canAccessOrganization(user, orgId)` - Directors can only access their org, admins access all
  - `canViewAllData(user)` - Only admin and director
  - `getVisibleFields(user)` - Return field list based on role (analyst gets subset)
- Implement middleware to protect `/dashboard` route
- Redirect unauthenticated users to `/login`

### 5. Protected Dashboard Page

- Display logged-in user information (name, email, role, organization)
- Show different messages/capabilities based on role:
  - **Admin**: "Full system access"
  - **Director**: "Access to [Organization Name] data"
  - **Analyst**: "Limited access to [Organization Name] data"
- Add logout button
- Use server components to fetch user session

### 6. Seed Data

Create sample data for testing:

- 2-3 Organizations (e.g., "Company1", "Company2", "Company3")
- Users across roles:
  - Admin user (access to everything)
  - Directors (one per organization)
  - Analysts (multiple per organization)
- A few sample submissions per user

### 7. UI/UX Polish

- Modern, clean login/register forms with validation
- Error handling and display
- Loading states
- Responsive design with Tailwind
- Simple navigation bar when logged in

## Access Control Rules Summary

- **Admin**: Full access to all organizations and all data fields
- **Director**: Access only to their own organization, all data fields within their org
- **Analyst**: Access only to their own organization, limited data fields (to be defined later)

## Environment Variables Needed

```
DATABASE_URL="postgresql://..."          # From Neon
NEXTAUTH_URL="http://localhost:3000"    # Base URL
NEXTAUTH_SECRET="..."                    # Random secret (generated)
```

## Testing Strategy

After implementation, test:

1. Registration creates users correctly
2. Login authenticates with correct credentials
3. Wrong credentials are rejected
4. Unauthenticated users cannot access `/dashboard`
5. Each role sees appropriate message on dashboard
6. Session persists across page reloads
7. Logout works correctly

## Future Enhancements (Not in POC)

- Google OAuth integration
- Define specific submission schema and analyst field restrictions
- CRUD operations for submissions
- Organization management UI (for admins)
- User management (invite, edit roles)
- Password reset functionality

### To-dos

- [ ] Initialize Next.js project with TypeScript and install all dependencies
- [ ] Configure Prisma schema with User, Organization, and Submission models
- [ ] Set up Neon database connection and run initial migration
- [ ] Configure NextAuth.js with credentials provider and session management
- [ ] Build login and registration pages with forms and validation
- [ ] Build protected dashboard page with role-based content display
- [ ] Implement route protection middleware for authentication
- [ ] Create seed script with sample organizations, users, and submissions
- [ ] Test registration, login, role-based access, and logout flows