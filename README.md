# Tiered Authentication System

A Next.js application with role-based authentication supporting Admin, Director, and Analyst user tiers with organization-based access control.

## Features

- **Authentication**: Email/password login with NextAuth.js
- **Role-Based Access Control**: Three user tiers (Admin, Director, Analyst)
- **Organization Management**: Users belong to organizations with appropriate access levels
- **Protected Routes**: Middleware-based route protection
- **Modern UI**: Clean, responsive design with Tailwind CSS

## User Roles

- **Admin**: Full system access to all organizations and data
- **Director**: Access only to their own organization, all data fields within their org
- **Analyst**: Access only to their own organization, limited data fields

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- PostgreSQL (Neon)
- Prisma ORM
- NextAuth.js v5
- Tailwind CSS
- bcrypt for password hashing

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 2. Database Setup

1. Set up a Neon PostgreSQL database
2. Replace the `DATABASE_URL` in `.env.local` with your Neon connection string
3. Generate a random secret for `NEXTAUTH_SECRET` (use `openssl rand -base64 32`)

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Migration

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

## Test Accounts

After running the seed script, you can use these test accounts:

- **Admin**: admin@example.com / password123
- **Director 1**: director1@company1.com / password123
- **Director 2**: director2@company2.com / password123
- **Analyst 1**: analyst1@company1.com / password123
- **Analyst 2**: analyst2@company1.com / password123
- **Analyst 3**: analyst3@company2.com / password123

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   ├── (protected)/
│   │   └── dashboard/page.tsx      # Protected dashboard
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts  # NextAuth config
│   │       └── register/route.ts       # Registration API
│   └── layout.tsx                  # Root layout with SessionProvider
├── lib/
│   ├── auth.ts                     # Auth configuration
│   ├── db.ts                       # Prisma client
│   └── permissions.ts               # Role-based access logic
├── components/
│   └── LogoutButton.tsx            # Logout component
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Sample data
├── middleware.ts                   # Route protection
└── types/
    └── next-auth.d.ts             # NextAuth type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Future Enhancements

- Google OAuth integration
- Password reset functionality
- User management interface
- Organization management UI
- CRUD operations for submissions
- More granular field-level permissions for analysts