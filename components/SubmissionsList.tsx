"use client";

import { useState, useEffect } from "react";
import { Role } from "@prisma/client";
import Link from "next/link";
import { canDownloadSubmissions } from "@/lib/permissions";

interface Submission {
    id: string;
    user_id: string;
    organization_id: string;
    tag_name: string;
    risk: string;
    data: any;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: Role;
        organization: {
            id: string;
            name: string;
        };
    };
}

interface SubmissionsListProps {
    userRole: Role;
    userOrganizationId: string;
    userId?: string;
}

export default function SubmissionsList({ userRole, userOrganizationId, userId }: SubmissionsListProps) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/submissions');

            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }

            const data = await response.json();
            setSubmissions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const response = await fetch('/api/submissions/export');

            if (!response.ok) {
                if (response.status === 403) {
                    setError('You do not have permission to download submissions');
                    return;
                }
                throw new Error('Failed to download submissions');
            }

            // Get the blob data
            const blob = await response.blob();

            // Extract filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'submissions-export.csv';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to download submissions');
        } finally {
            setDownloading(false);
        }
    };


    const getAccessMessage = () => {
        switch (userRole) {
            case Role.ADMIN:
                return "Viewing all submissions across all organizations";
            case Role.DIRECTOR:
                return "Viewing all submissions across all organizations";
            case Role.ANALYST:
                return "Viewing all submissions across all organizations";
            default:
                return "Viewing submissions";
        }
    };

    // Group submissions by tag_name
    const groupedSubmissions = submissions.reduce((acc, submission) => {
        if (!acc[submission.tag_name]) {
            acc[submission.tag_name] = [];
        }
        acc[submission.tag_name].push(submission);
        return acc;
    }, {} as Record<string, Submission[]>);

    // Sort grouped submissions by tag_name for consistent ordering
    const sortedGroupedSubmissions = Object.entries(groupedSubmissions).sort(([a], [b]) => a.localeCompare(b));

    if (loading) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-red-600 text-center">
                    <p>Error loading submissions: {error}</p>
                    <button
                        onClick={fetchSubmissions}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Submissions</h2>
                    <p className="text-sm text-gray-600 mt-1">{getAccessMessage()}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <Link
                        href="/submissions/new"
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        + New Submission
                    </Link>
                    {canDownloadSubmissions(userRole) && (
                        <button
                            onClick={handleDownload}
                            disabled={downloading || submissions.length === 0}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloading ? 'Downloading...' : 'Download Submissions'}
                        </button>
                    )}
                    <div className="text-sm text-gray-500">
                        {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>


            {/* Submissions List - Grouped by tag_name */}
            {submissions.length > 0 ? (
                <div className="space-y-4">
                    {sortedGroupedSubmissions.map(([tagName, tagSubmissions]) => (
                        <div key={tagName} className="border border-gray-300 rounded-lg overflow-hidden">
                            <Link
                                href={`/submissions/${encodeURIComponent(tagName)}`}
                                className="block bg-gray-50 px-4 py-2 border-b border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900 hover:text-indigo-600">
                                        Tag: {tagName}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {tagSubmissions.length} submission{tagSubmissions.length !== 1 ? 's' : ''} →
                                    </span>
                                </div>
                            </Link>
                            <div className="divide-y divide-gray-200">
                                {tagSubmissions.map((submission) => (
                                    <div key={submission.id} className="p-4">
                                        <div className="flex justify-between items-center">
                                            <span className={`px-3 py-2 text-sm font-semibold rounded ${submission.risk === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                submission.risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                    submission.risk === 'LOW' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {submission.risk} Risk
                                            </span>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>Org: {submission.user.organization.name}</span>
                                                <span>By: {submission.user.name}</span>
                                                <span>Created: {new Date(submission.created_at).toISOString().split('T')[0]}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">No submissions found.</p>
                </div>
            )}
        </div>
    );
}
