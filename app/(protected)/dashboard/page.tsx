import { auth } from "@/app/api/auth/[...auth]/route";
import { signOut } from "next-auth/react";
import { db } from "@/lib/db";
import { getRoleDisplayName } from "@/lib/permissions";
import LogoutButton from "@/components/LogoutButton";
import SubmissionsList from "@/components/SubmissionsList";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        return <div>Not authenticated</div>;
    }

    // Get user with organization details
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            organization: true,
        },
    });

    if (!user) {
        return <div>User not found</div>;
    }

    const getAccessMessage = () => {
        switch (user.role) {
            case "ADMIN":
                return "Full system access - You can view and manage all organizations and submissions";
            case "DIRECTOR":
                return `You can view all submissions and manage all submissions within your organization. You can also view and add internal notes to your submissions from your organization.`;
            case "ANALYST":
                return `You can view all submissions and can only edit and delete your own submissions`;
            default:
                return "Unknown access level";
        }
    };

    // Fetch all submissions to check for mismatches
    const allSubmissions = await db.submission.findMany({
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
    }) as any[];

    // Group submissions by tag_name and find mismatches
    const tagsMap = new Map<string, any[]>();
    for (const submission of allSubmissions) {
        const tagName = submission.tag_name;
        if (!tagsMap.has(tagName)) {
            tagsMap.set(tagName, []);
        }
        tagsMap.get(tagName)!.push(submission);
    }

    // Find tags with mismatched risks
    let hasMismatches = false;
    let mismatchCount = 0;

    for (const [tagName, submissions] of tagsMap.entries()) {
        const uniqueRisks = [...new Set(submissions.map(s => s.risk))];
        if (uniqueRisks.length > 1 && submissions.length > 1) {
            hasMismatches = true;
            mismatchCount++;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Risk Mismatch Alert Banner */}
                    {hasMismatches && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 shadow-sm">
                            <div className="flex items-start">
                                <div className="shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Risk Mismatch Detected
                                        </h3>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            {mismatchCount} tag{mismatchCount !== 1 ? 's' : ''} have submissions with inconsistent risk levels across organizations.
                                        </p>
                                    </div>
                                    <div className="ml-4 shrink-0">
                                        <Link
                                            href="/submissions/mismatches"
                                            className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                        >
                                            View Mismatches
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Submission Analyzer</h1>
                                <p className="mt-2 text-gray-600">Welcome back, {user.name}!</p>
                            </div>
                            <LogoutButton />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="text-sm text-gray-900">{user.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="text-sm text-gray-900">{user.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                                        <dd className="text-sm text-gray-900">{getRoleDisplayName(user.role)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Organization</dt>
                                        <dd className="text-sm text-gray-900">{user.organization.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                                        <dd className="text-sm text-gray-900">
                                            {new Date(user.created_at).toISOString().split('T')[0]}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Level</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${user.role === "ADMIN" ? "bg-red-500" :
                                            user.role === "DIRECTOR" ? "bg-yellow-500" : "bg-green-500"
                                            }`}></div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {getRoleDisplayName(user.role)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-4">
                                        {getAccessMessage()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submissions Component */}
                        <div className="mt-6">
                            <SubmissionsList
                                userRole={user.role}
                                userOrganizationId={user.organization_id}
                                userId={user.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
