import { auth } from "@/app/api/auth/[...auth]/route";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

interface TagWithMismatch {
    tag_name: string;
    risk_levels: string[];
    submission_count: number;
    organizations: string[];
}

export default async function MismatchesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch all submissions
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
    const mismatchedTags: TagWithMismatch[] = [];

    for (const [tagName, submissions] of tagsMap.entries()) {
        // Get unique risk levels for this tag
        const uniqueRisks = [...new Set(submissions.map(s => s.risk))];

        // If there are multiple risks and multiple submissions, it's a mismatch
        if (uniqueRisks.length > 1 && submissions.length > 1) {
            const organizations = [...new Set(submissions.map(s => s.user.organization.name))];

            mismatchedTags.push({
                tag_name: tagName,
                risk_levels: uniqueRisks,
                submission_count: submissions.length,
                organizations,
            });
        }
    }

    // Sort by tag name
    mismatchedTags.sort((a, b) => a.tag_name.localeCompare(b.tag_name));

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Risk Mismatch Detection
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {mismatchedTags.length === 0
                                        ? "No risk mismatches found. All submissions have consistent risk levels."
                                        : `Found ${mismatchedTags.length} tag${mismatchedTags.length !== 1 ? 's' : ''} with mismatched risk levels`
                                    }
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

                    {/* Mismatch List */}
                    {mismatchedTags.length > 0 ? (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="space-y-4">
                                {mismatchedTags.map((tag) => (
                                    <Link
                                        key={tag.tag_name}
                                        href={`/submissions/${encodeURIComponent(tag.tag_name)}`}
                                        className="block border border-yellow-300 rounded-lg overflow-hidden hover:border-yellow-400 transition-colors"
                                    >
                                        <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="shrink-0">
                                                        <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-semibold text-gray-900">
                                                            {tag.tag_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {tag.submission_count} submission{tag.submission_count !== 1 ? 's' : ''} from {tag.organizations.length} organization{tag.organizations.length !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-600">
                                                        Risks: {tag.risk_levels.join(', ')}
                                                    </span>
                                                    <span className="text-gray-400">→</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-12">
                            <div className="text-center">
                                <div className="flex justify-center mb-4">
                                    <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Risk Mismatches Detected
                                </h3>
                                <p className="text-sm text-gray-600">
                                    All submissions across all organizations have consistent risk assessments.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

