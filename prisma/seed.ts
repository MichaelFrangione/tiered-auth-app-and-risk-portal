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

  console.log('✅ Users created');

  // Create sample submissions with tag_name and risk fields
  // Some submissions will have the same tag_name to show multi-org grouping
  // @ts-ignore - tag_name and risk fields exist after migration
  await prisma.submission.createMany({
    data: [
      // Company1 submissions - SUB-001 (will have multiple org versions)
      {
        user_id: director1.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-001',
        risk: 'HIGH',
        data: { history: [] },
      },
      {
        user_id: analyst1.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-002',
        risk: 'MEDIUM',
        data: { history: [] },
      },
      
      // Company2 submissions - SUB-001 (same tag as Company1)
      {
        user_id: director2.id,
        organization_id: company2.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-001',
        risk: 'LOW',
        data: { history: [] },
      },
      {
        user_id: analyst3.id,
        organization_id: company2.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-003',
        risk: 'NONE',
        data: { history: [] },
      },

      // Company1 - SUB-003 (will have multiple org versions)
      {
        user_id: analyst1.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-003',
        risk: 'HIGH',
        data: { history: [] },
      },

      // Company2 - SUB-004 (will have multiple org versions)
      {
        user_id: analyst3.id,
        organization_id: company2.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-004',
        risk: 'MEDIUM',
        data: { history: [] },
      },

      // Company1 - SUB-004 (same tag as Company2)
      {
        user_id: analyst2.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-004',
        risk: 'HIGH',
        data: { history: [] },
      },

      // Company1 - SUB-005 (only one org)
      {
        user_id: director1.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-005',
        risk: 'NONE',
        data: { history: [] },
      },

      // Company2 - SUB-005 (will have multiple org versions)
      {
        user_id: director2.id,
        organization_id: company2.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-005',
        risk: 'LOW',
        data: { history: [] },
      },

      // Company1 submissions - unique tags
      {
        user_id: analyst1.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-006',
        risk: 'MEDIUM',
        data: { history: [] },
      },
      {
        user_id: analyst2.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-007',
        risk: 'NONE',
        data: { history: [] },
      },
      {
        user_id: analyst2.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-008',
        risk: 'LOW',
        data: { history: [] },
      },

      // Company2 submissions - unique tags
      {
        user_id: analyst3.id,
        organization_id: company2.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-009',
        risk: 'MEDIUM',
        data: { history: [] },
      },

      // More submissions for Company1
      {
        user_id: director1.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-010',
        risk: 'HIGH',
        data: { history: [] },
      },
      {
        user_id: analyst1.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-011',
        risk: 'MEDIUM',
        data: { history: [] },
      },
      {
        user_id: analyst2.id,
        organization_id: company1.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-012',
        risk: 'LOW',
        data: { history: [] },
      },

      // More submissions for Company2
      {
        user_id: director2.id,
        organization_id: company2.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-010',
        risk: 'LOW',
        data: { history: [] },
      },
      {
        user_id: analyst3.id,
        organization_id: company2.id,
        // @ts-ignore - fields exist after migration
        tag_name: 'SUB-013',
        risk: 'HIGH',
        data: { history: [] },
      },
    ],
  });

  console.log('✅ Sample submissions created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Test accounts created:');
  console.log('Admin: admin@example.com / password123');
  console.log('Director 1: director1@company1.com / password123');
  console.log('Director 2: director2@company2.com / password123');
  console.log('Analyst 1: analyst1@company1.com / password123');
  console.log('Analyst 2: analyst2@company1.com / password123');
  console.log('Analyst 3: analyst3@company2.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
