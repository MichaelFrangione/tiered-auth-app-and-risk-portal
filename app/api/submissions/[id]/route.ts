import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...auth]/route";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { addHistoryEntry, type SubmissionData } from "@/lib/submission-history";

interface RouteParams {
    params: {
        id: string;
    };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { risk, sensitive_info } = body;

        console.log('Update submission request:', { id, risk, sensitive_info });

        // Check if submission exists
        const existingSubmission = await db.submission.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!existingSubmission) {
            return NextResponse.json(
                { error: "Submission not found" },
                { status: 404 }
            );
        }

        // Check permissions
        const canEdit =
            session.user.role === Role.ADMIN ||
            session.user.role === Role.DIRECTOR ||
            (session.user.role === Role.ANALYST && existingSubmission.user_id === session.user.id);

        if (!canEdit) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        // Restrict sensitive_info updates to directors and admins only
        if (sensitive_info !== undefined && session.user.role === Role.ANALYST) {
            return NextResponse.json(
                { error: "Analysts cannot add or edit sensitive information" },
                { status: 403 }
            );
        }

        // Get current and new risk values
        const oldRisk = (existingSubmission as any).risk;
        const newRisk = risk;

        // Get current submission data
        const currentData = existingSubmission.data as any || { history: [] };

        // Get current and new sensitive_info values
        const oldSensitiveInfo = currentData.sensitive_info || '';
        const newSensitiveInfo = sensitive_info !== undefined ? (sensitive_info.trim() || '') : currentData.sensitive_info || '';

        // Add history entry for risk and sensitive_info changes (this creates a new history array)
        const historyUpdate = addHistoryEntry(
            currentData,
            '', // no title
            '', // no content
            session.user.id,
            session.user.name || 'Unknown User',
            oldRisk,
            newRisk,
            oldSensitiveInfo,
            newSensitiveInfo
        );

        // Preserve all existing data fields and update with new values
        const updatedData = {
            ...currentData, // Preserve all existing fields
            history: historyUpdate.history || currentData.history || [],
            // Update sensitive_info if provided
            sensitive_info: sensitive_info !== undefined
                ? (sensitive_info.trim() || null)
                : currentData.sensitive_info
        };

        // Update submission
        const updateData: any = {
            data: updatedData,
        };

        // Add risk if provided
        if (risk) {
            updateData.risk = risk;
        }

        const updatedSubmission = await db.submission.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    include: {
                        organization: true,
                    },
                },
            },
        });

        console.log('Updated submission:', updatedSubmission);
        return NextResponse.json(updatedSubmission);
    } catch (error) {
        console.error("Error updating submission:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if submission exists
        const existingSubmission = await db.submission.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!existingSubmission) {
            return NextResponse.json(
                { error: "Submission not found" },
                { status: 404 }
            );
        }

        // Check permissions
        const canDelete =
            session.user.role === Role.ADMIN ||
            session.user.role === Role.DIRECTOR ||
            (session.user.role === Role.ANALYST && existingSubmission.user_id === session.user.id);

        if (!canDelete) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        await db.submission.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Submission deleted successfully" });
    } catch (error) {
        console.error("Error deleting submission:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
