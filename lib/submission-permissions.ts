import { Role } from "@prisma/client";

export interface SubmissionPermissionContext {
    userRole: Role;
    submissionUserId: string;
    currentUserId: string;
    userOrganizationId: string;
    submissionOrganizationId: string;
}

/**
 * Check if a user can edit a submission
 */
export function canEditSubmission(context: SubmissionPermissionContext): boolean {
    const { userRole, submissionUserId, currentUserId, userOrganizationId, submissionOrganizationId } = context;

    // ADMIN: Can edit any submission
    if (userRole === Role.ADMIN) {
        return true;
    }

    // DIRECTOR: Can edit submissions from their own organization
    if (userRole === Role.DIRECTOR && userOrganizationId === submissionOrganizationId) {
        return true;
    }

    // ANALYST: Can only edit their own submissions
    if (userRole === Role.ANALYST && submissionUserId === currentUserId) {
        return true;
    }

    return false;
}

/**
 * Check if a user can delete a submission
 */
export function canDeleteSubmission(context: SubmissionPermissionContext): boolean {
    const { userRole, submissionUserId, currentUserId, userOrganizationId, submissionOrganizationId } = context;

    // ADMIN: Can delete any submission
    if (userRole === Role.ADMIN) {
        return true;
    }

    // DIRECTOR: Can delete submissions from their own organization
    if (userRole === Role.DIRECTOR && userOrganizationId === submissionOrganizationId) {
        return true;
    }

    // ANALYST: Can only delete their own submissions
    if (userRole === Role.ANALYST && submissionUserId === currentUserId) {
        return true;
    }

    return false;
}

