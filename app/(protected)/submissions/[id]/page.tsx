import { auth } from "@/app/api/auth/[...auth]/route";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SubmissionControls from "@/components/SubmissionControls";
import { type SubmissionHistoryEntry, getLatestHistoryEntry } from "@/lib/submission-history";

interface SubmissionDetailPageProps {
    params: {
        id: string;
    };
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Await params before accessing its properties
    const { id } = await params;

    // Decode the tag_name from the URL
    const tagName = decodeURIComponent(id);

    // Fetch ALL submissions with this tag_name from all organizations
    const submissions = await db.submission.findMany({
        where: {
            // @ts-ignore - tag_name field exists after migration
            tag_name: tagName,
        },
        include: {
            user: {
                include: {
                    organization: true,
                },
            },
        },
        orderBy: [
            { created_at: 'desc' },
            { id: 'asc' }, // Secondary sort to ensure stable ordering
        ],
    }) as any; // Type assertion needed until migration is run and Prisma client is regenerated

    if (!submissions || submissions.length === 0) {
        notFound();
    }

    // Check if risks are aligned across submissions
    const risks = submissions.map((s: any) => s.risk);
    const uniqueRisks = [...new Set(risks)];
    const hasRiskMismatch = uniqueRisks.length > 1 && submissions.length > 1;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {tagName}
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''} with this tag
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    ← Back to Dashboard
                                </Link>
                                <LogoutButton />
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Display all submissions grouped by tag_name */}
                    <div className="space-y-6">
                        {/* Risk Mismatch Warning Banner */}
                        {hasRiskMismatch && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <div className="flex">
                                    <div className="shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Risk mismatch detected:</strong> Submissions have different risk levels ({uniqueRisks.join(', ')}).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {submissions.map((submission: any) => (
                            <div key={submission.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                                {/* Header with Organization and Risk */}
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200" style={{ background: 'linear-gradient(to right, #eef2ff, #eff6ff)' }}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk</p>
                                            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${(submission as any).risk === 'HIGH' ? 'bg-red-500 text-white' :
                                                (submission as any).risk === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                                                    (submission as any).risk === 'LOW' ? 'bg-blue-500 text-white' :
                                                        'bg-gray-500 text-white'
                                                }`}>
                                                {(submission as any).risk}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-px h-12 bg-gray-300"></div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Organization</p>
                                                <p className="text-base font-semibold text-gray-900">{submission.user.organization.name}</p>
                                            </div>
                                            <div className="w-px h-12 bg-gray-300"></div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</p>
                                                <p className="text-base font-semibold text-gray-900">{submission.user.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sensitive Info Section - Only visible to authorized users */}
                                {(() => {
                                    // Check if current user can view sensitive info
                                    const canViewSensitiveInfo =
                                        session.user.role === Role.ADMIN ||
                                        session.user.role === Role.DIRECTOR ||
                                        (session.user.role === Role.ANALYST && submission.user_id === session.user.id);

                                    const sensitiveInfo = (submission.data as any)?.sensitive_info;

                                    if (canViewSensitiveInfo && sensitiveInfo) {
                                        return (
                                            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
                                                <div className="flex items-start">

                                                    <div>
                                                        <h3 className="text-sm font-semibold text-black uppercase tracking-wide mb-2">
                                                            📝 Internal Notes
                                                        </h3>
                                                        <p className="text-sm text-gray-700">
                                                            {sensitiveInfo}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Footer with dates */}
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Created</p>
                                            <p className="text-gray-900 font-medium">
                                                {new Date(submission.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(submission.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Last Updated</p>
                                            <p className="text-gray-900 font-medium">
                                                {new Date(submission.updated_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(submission.updated_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Updated By</p>
                                            <p className="text-gray-900 font-medium">
                                                {(() => {
                                                    const latestEntry = getLatestHistoryEntry(submission.data as any);
                                                    return latestEntry ? latestEntry.changed_by_name : submission.user.name;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls Container */}
                                <div className="bg-white px-6 py-4">
                                    {(() => {
                                        const canViewSensitiveInfo =
                                            session.user.role === Role.ADMIN ||
                                            session.user.role === Role.DIRECTOR ||
                                            (session.user.role === Role.ANALYST && submission.user_id === session.user.id);

                                        const sensitiveInfo = (submission.data as any)?.sensitive_info;

                                        return (
                                            <SubmissionControls
                                                submissionId={submission.id}
                                                userRole={session.user.role}
                                                submissionUserId={submission.user_id}
                                                currentUserId={session.user.id}
                                                userOrganizationId={session.user.organization_id}
                                                submissionOrganizationId={submission.organization_id}
                                                history={(submission.data as any)?.history || []}
                                                risk={(submission as any).risk}
                                                sensitiveInfo={sensitiveInfo}
                                                canViewSensitiveInfo={canViewSensitiveInfo}
                                                tagName={tagName}
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
