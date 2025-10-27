import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...auth]/route";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    // All roles can see all submissions now
    try {
        const submissions = await db.submission.findMany({
            include: {
                user: {
                    include: {
                        organization: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json(submissions);
    } catch (error) {
        console.error("Failed to fetch submissions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { tag_name, risk } = await request.json();

        if (!tag_name) {
            return NextResponse.json(
                { error: "Tag name is required" },
                { status: 400 }
            );
        }

        // Check if this organization already has a submission with this tag_name
        const existingSubmission = await db.submission.findFirst({
            where: {
                organization_id: session.user.organization_id,
                tag_name: tag_name.trim(),
            },
            include: {
                user: true,
            },
        });

        if (existingSubmission) {
            return NextResponse.json(
                {
                    error: `Your organization already has a submission with tag "${tag_name.trim()}". Please submit a change request instead for this tag.`,
                    existingSubmission: {
                        createdBy: existingSubmission.user.name,
                        createdAt: existingSubmission.created_at,
                        submissionId: existingSubmission.id
                    }
                },
                { status: 409 } // Conflict status
            );
        }

        // Create new submission
        const newSubmission = await db.submission.create({
            data: {
                user_id: session.user.id,
                organization_id: session.user.organization_id,
                // @ts-ignore - tag_name and risk fields exist after migration
                tag_name: tag_name.trim(),
                risk: risk || 'NONE',
                data: {
                    history: []
                }
            },
            include: {
                user: {
                    include: {
                        organization: true,
                    },
                },
            },
        });

        return NextResponse.json(newSubmission);
    } catch (error) {
        console.error("Error creating submission:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}