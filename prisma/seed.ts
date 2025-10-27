import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create organizations
  const company1 = await prisma.organization.upsert({
    where: { name: 'Company1' },
    update: {},
    create: {
      name: 'Company1',
    },
  });

  const company2 = await prisma.organization.upsert({
    where: { name: 'Company2' },
    update: {},
    create: {
      name: 'Company2',
    },
  });

  const company3 = await prisma.organization.upsert({
    where: { name: 'Company3' },
    update: {},
    create: {
      name: 'Company3',
    },
  });

  console.log('✅ Organizations created');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
      organization_id: company1.id,
    },
  });

  // Create directors
  const director1 = await prisma.user.upsert({
    where: { email: 'director1@company1.com' },
    update: {},
    create: {
      name: 'Director One',
      email: 'director1@company1.com',
      password: hashedPassword,
      role: Role.DIRECTOR,
      organization_id: company1.id,
    },
  });

  const director2 = await prisma.user.upsert({
    where: { email: 'director2@company2.com' },
    update: {},
    create: {
      name: 'Director Two',
      email: 'director2@company2.com',
      password: hashedPassword,
      role: Role.DIRECTOR,
      organization_id: company2.id,
    },
  });

  // Create analysts
  const analyst1 = await prisma.user.upsert({
    where: { email: 'analyst1@company1.com' },
    update: {},
    create: {
      name: 'Analyst One',
      email: 'analyst1@company1.com',
      password: hashedPassword,
      role: Role.ANALYST,
      organization_id: company1.id,
    },
  });

  const analyst2 = await prisma.user.upsert({
    where: { email: 'analyst2@company1.com' },
    update: {},
    create: {
      name: 'Analyst Two',
      email: 'analyst2@company1.com',
      password: hashedPassword,
      role: Role.ANALYST,
      organization_id: company1.id,
    },
  });

  const analyst3 = await prisma.user.upsert({
    where: { email: 'analyst3@company2.com' },
    update: {},
    create: {
      name: 'Analyst Three',
      email: 'analyst3@company2.com',
      password: hashedPassword,
      role: Role.ANALYST,
      organization_id: company2.id,
    },
  });

  // Create director and analysts for Company3
  const director3 = await prisma.user.upsert({
    where: { email: 'director3@company3.com' },
    update: {},
    create: {
      name: 'Director Three',
      email: 'director3@company3.com',
      password: hashedPassword,
      role: Role.DIRECTOR,
      organization_id: company3.id,
    },
  });

  const analyst4 = await prisma.user.upsert({
    where: { email: 'analyst4@company3.com' },
    update: {},
    create: {
      name: 'Analyst Four',
      email: 'analyst4@company3.com',
      password: hashedPassword,
      role: Role.ANALYST,
      organization_id: company3.id,
    },
  });

  const analyst5 = await prisma.user.upsert({
    where: { email: 'analyst5@company3.com' },
    update: {},
    create: {
      name: 'Analyst Five',
      email: 'analyst5@company3.com',
      password: hashedPassword,
      role: Role.ANALYST,
      organization_id: company3.id,
    },
  });

  console.log('✅ Users created');

  // Create sample submissions with tag_name and risk fields
  // Same tag names can appear across multiple organizations to show grouping
  // Admin does not create any submissions
  // @ts-ignore - tag_name and risk fields exist after migration
  await prisma.submission.createMany({
    data: [
      // SUB-001: appears in all 3 organizations
      {
        user_id: director1.id,
        organization_id: company1.id,
        tag_name: 'SUB-001',
        risk: 'HIGH',
        data: {
          history: [],
          sensitive_info: 'Internal investigation notes: Possible compliance issue detected during Q3 audit.'
        },
      },
      {
        user_id: director2.id,
        organization_id: company2.id,
        tag_name: 'SUB-001',
        risk: 'MEDIUM',
        data: {
          history: [],
          sensitive_info: 'Director review: Authorized for public disclosure pending final approval.'
        },
      },
      {
        user_id: director3.id,
        organization_id: company3.id,
        tag_name: 'SUB-001',
        risk: 'LOW',
        data: {
          history: [],
          sensitive_info: 'Director assessment: Cross-organizational review completed successfully.'
        },
      },

      // SUB-002: only Company1
      {
        user_id: analyst1.id,
        organization_id: company1.id,
        tag_name: 'SUB-002',
        risk: 'MEDIUM',
        data: {
          history: []
        },
      },

      // SUB-003: appears in Company1 and Company2 - SAME risk (NO MISMATCH)
      {
        user_id: analyst1.id,
        organization_id: company1.id,
        tag_name: 'SUB-003',
        risk: 'HIGH',
        data: {
          history: []
        },
      },
      {
        user_id: analyst3.id,
        organization_id: company2.id,
        tag_name: 'SUB-003',
        risk: 'HIGH',
        data: {
          history: []
        },
      },

      // SUB-004: all 3 organizations - DIFFERENT risks (MISMATCH)
      {
        user_id: analyst2.id,
        organization_id: company1.id,
        tag_name: 'SUB-004',
        risk: 'HIGH',
        data: {
          history: []
        },
      },
      {
        user_id: analyst3.id,
        organization_id: company2.id,
        tag_name: 'SUB-004',
        risk: 'MEDIUM',
        data: {
          history: []
        },
      },
      {
        user_id: analyst4.id,
        organization_id: company3.id,
        tag_name: 'SUB-004',
        risk: 'LOW',
        data: {
          history: []
        },
      },

      // SUB-005: Company1 and Company3 - DIFFERENT risks (MISMATCH), Directors have sensitive_info
      {
        user_id: director1.id,
        organization_id: company1.id,
        tag_name: 'SUB-005',
        risk: 'NONE',
        data: {
          history: [],
          sensitive_info: 'Director comment: All clear, approved for standard processing.'
        },
      },
      {
        user_id: director3.id,
        organization_id: company3.id,
        tag_name: 'SUB-005',
        risk: 'LOW',
        data: {
          history: [],
          sensitive_info: 'Director review: Similar case to Company1, approved for processing.'
        },
      },

      // SUB-006: only Company1
      {
        user_id: analyst1.id,
        organization_id: company1.id,
        tag_name: 'SUB-006',
        risk: 'MEDIUM',
        data: {
          history: []
        },
      },

      // SUB-007: Company1 and Company2 - SAME risk (NO MISMATCH)
      {
        user_id: analyst2.id,
        organization_id: company1.id,
        tag_name: 'SUB-007',
        risk: 'MEDIUM',
        data: {
          history: []
        },
      },
      {
        user_id: analyst3.id,
        organization_id: company2.id,
        tag_name: 'SUB-007',
        risk: 'MEDIUM',
        data: {
          history: []
        },
      },

      // SUB-008: only Company1
      {
        user_id: analyst2.id,
        organization_id: company1.id,
        tag_name: 'SUB-008',
        risk: 'LOW',
        data: {
          history: []
        },
      },

      // SUB-009: only Company2
      {
        user_id: analyst3.id,
        organization_id: company2.id,
        tag_name: 'SUB-009',
        risk: 'MEDIUM',
        data: {
          history: []
        },
      },

      // SUB-010: all 3 organizations - SAME risk (NO MISMATCH), Directors have sensitive_info
      {
        user_id: director1.id,
        organization_id: company1.id,
        tag_name: 'SUB-010',
        risk: 'HIGH',
        data: {
          history: [],
          sensitive_info: 'Emergency review: Immediate action required by legal team.'
        },
      },
      {
        user_id: director2.id,
        organization_id: company2.id,
        tag_name: 'SUB-010',
        risk: 'HIGH',
        data: {
          history: [],
          sensitive_info: 'Director assessment: Coordinated response needed across all organizations.'
        },
      },
      {
        user_id: director3.id,
        organization_id: company3.id,
        tag_name: 'SUB-010',
        risk: 'HIGH',
        data: {
          history: [],
          sensitive_info: 'Urgent: Financial discrepancies detected in coordinated audit.'
        },
      },

      // SUB-011: only Company1
      {
        user_id: analyst1.id,
        organization_id: company1.id,
        tag_name: 'SUB-011',
        risk: 'MEDIUM',
        data: {
          history: []
        },
      },

      // SUB-012: Company2 and Company3 - DIFFERENT risks (MISMATCH), Director has sensitive_info
      {
        user_id: director2.id,
        organization_id: company2.id,
        tag_name: 'SUB-012',
        risk: 'LOW',
        data: {
          history: [],
          sensitive_info: 'Director assessment: No concerns, proceed with standard workflow.'
        },
      },
      {
        user_id: analyst5.id,
        organization_id: company3.id,
        tag_name: 'SUB-012',
        risk: 'HIGH',
        data: {
          history: []
        },
      },

      // SUB-013: only Company2
      {
        user_id: analyst3.id,
        organization_id: company2.id,
        tag_name: 'SUB-013',
        risk: 'HIGH',
        data: {
          history: []
        },
      },

      // SUB-014: Company1 and Company3 - DIFFERENT risks (MISMATCH)
      {
        user_id: analyst2.id,
        organization_id: company1.id,
        tag_name: 'SUB-014',
        risk: 'LOW',
        data: {
          history: []
        },
      },
      {
        user_id: analyst4.id,
        organization_id: company3.id,
        tag_name: 'SUB-014',
        risk: 'HIGH',
        data: {
          history: []
        },
      },

      // SUB-015: only Company3
      {
        user_id: analyst5.id,
        organization_id: company3.id,
        tag_name: 'SUB-015',
        risk: 'MEDIUM',
        data: {
          history: []
        },
      },
    ],
  });

  console.log('✅ Sample submissions created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Test accounts created:');
  console.log('Admin: admin@example.com / password123');
  console.log('Director 1: director1@company1.com / password123');
  console.log('Director 2: director2@company2.com / password123');
  console.log('Director 3: director3@company3.com / password123');
  console.log('Analyst 1: analyst1@company1.com / password123');
  console.log('Analyst 2: analyst2@company1.com / password123');
  console.log('Analyst 3: analyst3@company2.com / password123');
  console.log('Analyst 4: analyst4@company3.com / password123');
  console.log('Analyst 5: analyst5@company3.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
