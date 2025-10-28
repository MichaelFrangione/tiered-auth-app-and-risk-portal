import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...auth]/route";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

// Helper function to escape CSV values
function escapeCsvValue(value: string | null | undefined): string {
    if (!value) return '';

    const stringValue = String(value);
    // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
}

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // Analysts cannot download
        if (session.user.role === Role.ANALYST) {
            return NextResponse.json(
                { error: "Analysts do not have permission to download submissions" },
                { status: 403 }
            );
        }

        // Fetch submissions with required includes
        // For admins: fetch all submissions (no where clause)
        // For directors: filter by their organization_id
        const query = session.user.role === Role.DIRECTOR
            ? {
                where: { organization_id: session.user.organization_id },
                include: {
                    user: {
                        include: {
                            organization: true,
                        },
                    },
                },
                orderBy: [
                    { created_at: 'desc' },
                    { id: 'asc' },
                ],
            }
            : {
                include: {
                    user: {
                        include: {
                            organization: true,
                        },
                    },
                },
                orderBy: [
                    { created_at: 'desc' },
                    { id: 'asc' },
                ],
            };

        const submissions = await db.submission.findMany(query);

        // Build CSV content
        const csvRows: string[] = [];

        // Add header row
        csvRows.push('ID,Tag Name,Risk Level,Organization,User Name,User Email,Created At,Updated At');

        // Add data rows
        submissions.forEach(submission => {
            const row = [
                escapeCsvValue(submission.id),
                escapeCsvValue(submission.tag_name),
                escapeCsvValue(submission.risk),
                escapeCsvValue(submission.user.organization.name),
                escapeCsvValue(submission.user.name),
                escapeCsvValue(submission.user.email),
                escapeCsvValue(new Date(submission.created_at).toISOString().split('T')[0]),
                escapeCsvValue(new Date(submission.updated_at).toISOString().split('T')[0]),
            ].join(',');
            csvRows.push(row);
        });

        const csvContent = csvRows.join('\n');

        // Generate filename based on role
        const today = new Date().toISOString().split('T')[0];
        let filename: string;

        if (session.user.role === Role.DIRECTOR) {
            const orgName = submissions[0]?.user.organization.name || 'organization';
            filename = `submissions-${orgName}-${today}.csv`;
        } else {
            filename = `submissions-all-organizations-${today}.csv`;
        }

        // Return CSV response
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Failed to export submissions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

