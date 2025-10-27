// Example queries for the tiered auth system
// This file demonstrates how to query submissions based on user roles and organizations

import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Example user session data (what you'd get from NextAuth)
const mockSessions = {
    admin: {
        user: {
            id: 'admin-id',
            email: 'admin@example.com',
            role: Role.ADMIN,
            organization_id: 'company1-id'
        }
    },
    director1: {
        user: {
            id: 'director1-id',
            email: 'director1@company1.com',
            role: Role.DIRECTOR,
            organization_id: 'company1-id'
        }
    },
    analyst1: {
        user: {
            id: 'analyst1-id',
            email: 'analyst1@company1.com',
            role: Role.ANALYST,
            organization_id: 'company1-id'
        }
    }
};

// Query functions based on user role
export async function getSubmissionsForUser(session: any) {
    const { user } = session;

    switch (user.role) {
        case Role.ADMIN:
            // ADMIN: Can see all submissions across all organizations
            return await prisma.submission.findMany({
                include: {
                    user: {
                        include: {
                            organization: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

        case Role.DIRECTOR:
            // DIRECTOR: Can see all submissions in their organization
            return await prisma.submission.findMany({
                where: {
                    organization_id: user.organization_id
                },
                include: {
                    user: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

        case Role.ANALYST:
            // ANALYST: Can see all submissions in their organization (same as director for now)
            return await prisma.submission.findMany({
                where: {
                    organization_id: user.organization_id
                },
                include: {
                    user: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

        default:
            return [];
    }
}

// Get submissions filtered by organization
export async function getSubmissionsByOrganization(organizationId: string) {
    return await prisma.submission.findMany({
        where: {
            organization_id: organizationId
        },
        include: {
            user: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });
}

// Get submissions by specific user
export async function getSubmissionsByUser(userId: string) {
    return await prisma.submission.findMany({
        where: {
            user_id: userId
        },
        include: {
            user: {
                include: {
                    organization: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
}

// Get submissions with specific criteria
export async function getSubmissionsByPriority(organizationId: string, priority: string) {
    return await prisma.submission.findMany({
        where: {
            organization_id: organizationId,
            data: {
                path: ['priority'],
                equals: priority
            }
        },
        include: {
            user: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });
}

// Get submissions by category
export async function getSubmissionsByCategory(organizationId: string, category: string) {
    return await prisma.submission.findMany({
        where: {
            organization_id: organizationId,
            data: {
                path: ['category'],
                equals: category
            }
        },
        include: {
            user: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });
}

// Create a new submission
export async function createSubmission(userId: string, organizationId: string, data: any) {
    return await prisma.submission.create({
        data: {
            user_id: userId,
            organization_id: organizationId,
            data: data
        },
        include: {
            user: true
        }
    });
}

// Example usage:
async function exampleUsage() {
    console.log('=== ADMIN VIEW (All submissions) ===');
    const adminSubmissions = await getSubmissionsForUser(mockSessions.admin);
    console.log(`Admin can see ${adminSubmissions.length} submissions`);

    console.log('\n=== DIRECTOR VIEW (Company1 only) ===');
    const directorSubmissions = await getSubmissionsForUser(mockSessions.director1);
    console.log(`Director1 can see ${directorSubmissions.length} submissions`);

    console.log('\n=== ANALYST VIEW (Company1 only) ===');
    const analystSubmissions = await getSubmissionsForUser(mockSessions.analyst1);
    console.log(`Analyst1 can see ${analystSubmissions.length} submissions`);

    console.log('\n=== FILTERED QUERIES ===');

    // Get high priority submissions for Company1
    const highPrioritySubmissions = await getSubmissionsByPriority('company1-id', 'high');
    console.log(`High priority submissions in Company1: ${highPrioritySubmissions.length}`);

    // Get financial category submissions for Company1
    const financialSubmissions = await getSubmissionsByCategory('company1-id', 'financial');
    console.log(`Financial submissions in Company1: ${financialSubmissions.length}`);
}

// Uncomment to run examples
// exampleUsage().catch(console.error)

export default {
    getSubmissionsForUser,
    getSubmissionsByOrganization,
    getSubmissionsByUser,
    getSubmissionsByPriority,
    getSubmissionsByCategory,
    createSubmission
};
