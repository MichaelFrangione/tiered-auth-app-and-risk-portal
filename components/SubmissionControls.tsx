"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";
import { canEditSubmission, canDeleteSubmission, type SubmissionPermissionContext } from "@/lib/submission-permissions";
import { formatHistoryForDisplay, type SubmissionHistoryEntry } from "@/lib/submission-history";

interface SubmissionControlsProps {
    submissionId: string;
    userRole: Role;
    submissionUserId: string;
    currentUserId: string;
    userOrganizationId: string;
    submissionOrganizationId: string;
    history: SubmissionHistoryEntry[];
    risk: string;
    sensitiveInfo?: string;
    canViewSensitiveInfo?: boolean;
    onRiskChange?: (newRisk: string) => void;
    isEditing?: boolean;
    onEditClick?: () => void;
    tagName?: string;
}

export default function SubmissionControls({
    submissionId,
    userRole,
    submissionUserId,
    currentUserId,
    userOrganizationId,
    submissionOrganizationId,
    history,
    risk,
    sensitiveInfo,
    canViewSensitiveInfo,
    onRiskChange,
    isEditing: parentIsEditing,
    onEditClick,
    tagName
}: SubmissionControlsProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(parentIsEditing || false);
    const [riskLevel, setRiskLevel] = useState(risk);
    const [sensitiveInfoValue, setSensitiveInfoValue] = useState(sensitiveInfo || '');
    const [isLoading, setIsLoading] = useState(false);
    const [currentHistory, setCurrentHistory] = useState(history);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Sync props with state when they change
    useEffect(() => {
        setRiskLevel(risk);
    }, [risk]);

    useEffect(() => {
        setSensitiveInfoValue(sensitiveInfo || '');
    }, [sensitiveInfo]);

    useEffect(() => {
        setCurrentHistory(history);
    }, [history]);

    // Check permissions using utility functions
    const permissionContext: SubmissionPermissionContext = {
        userRole,
        submissionUserId,
        currentUserId,
        userOrganizationId,
        submissionOrganizationId
    };

    const canEdit = canEditSubmission(permissionContext);
    const canDelete = canDeleteSubmission(permissionContext);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const requestBody: any = {
                risk: riskLevel,
            };

            // Only include sensitive_info if user has permission to edit it
            if (userRole === Role.ADMIN || userRole === Role.DIRECTOR) {
                requestBody.sensitive_info = sensitiveInfoValue;
            }

            const response = await fetch(`/api/submissions/${submissionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const updatedSubmission = await response.json();
                setCurrentHistory(updatedSubmission.data?.history || []);
                if (updatedSubmission.risk) {
                    setRiskLevel(updatedSubmission.risk);
                    if (onRiskChange) {
                        onRiskChange(updatedSubmission.risk);
                    }
                }
                setIsEditing(false);
                router.refresh();
            } else {
                const error = await response.json();
                alert(`Failed to update submission: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating submission:', error);
            alert('Error updating submission');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setRiskLevel(risk);
        setSensitiveInfoValue(sensitiveInfo || '');
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/submissions/${submissionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // If we have a tag_name and we're on the details page, check if there are remaining submissions
                if (tagName) {
                    try {
                        const submissionsResponse = await fetch(`/api/submissions`);
                        if (submissionsResponse.ok) {
                            const allSubmissions = await submissionsResponse.json();
                            const remainingSubmissions = allSubmissions.filter((s: any) => s.tag_name === tagName);

                            if (remainingSubmissions.length > 0) {
                                // Refresh the current page to show remaining submissions
                                router.refresh();
                            } else {
                                // No remaining submissions, go to dashboard
                                router.push('/dashboard');
                            }
                        } else {
                            router.push('/dashboard');
                        }
                    } catch (err) {
                        router.push('/dashboard');
                    }
                } else {
                    // No tag_name, go to dashboard
                    router.push('/dashboard');
                }
            } else {
                const error = await response.json();
                alert(`Failed to delete submission: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert('Error deleting submission');
        }
    };

    return (
        <>
            {/* History Modal */}
            {showHistoryModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowHistoryModal(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Change History</h3>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="px-6 py-4 overflow-y-auto">
                            <div className="space-y-3">
                                {currentHistory && currentHistory.length > 0 ? (
                                    formatHistoryForDisplay(currentHistory, userRole === Role.ANALYST).map((entry, index) => (
                                        <div key={index} className="border-l-2 border-gray-200 pl-4 py-2">
                                            <p className="text-sm text-gray-700">{entry}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No history available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Risk Modal */}
            {isEditing && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => {
                        handleCancel();
                    }}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Edit Submission</h3>
                            <p className="text-sm text-gray-600">Update the risk level and sensitive information</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Risk Level
                            </label>
                            <select
                                value={riskLevel}
                                onChange={(e) => setRiskLevel(e.target.value)}
                                className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="NONE">None</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        {(canViewSensitiveInfo && (userRole === Role.ADMIN || userRole === Role.DIRECTOR)) && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Internal Notes <span className="text-red-600">📝</span>
                                </label>
                                <textarea
                                    value={sensitiveInfoValue}
                                    onChange={(e) => setSensitiveInfoValue(e.target.value)}
                                    className="w-full px-4 py-3 text-sm text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={4}
                                    placeholder="Enter any internal notes for this submission"
                                />
                            </div>
                        )}

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls to be rendered by parent */}
            {(canEdit || canDelete || currentHistory.length > 0) && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                        {currentHistory.length > 0 && (
                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                            >
                                {currentHistory.length} {currentHistory.length === 1 ? 'edit' : 'edits'}, see all
                            </button>
                        )}
                    </div>
                    {(canEdit || canDelete) && (
                        <div className="flex items-center space-x-3">
                            {canEdit && (
                                <button
                                    onClick={() => {
                                        // Reset values to latest prop values before opening edit modal
                                        setRiskLevel(risk);
                                        setSensitiveInfoValue(sensitiveInfo || '');
                                        setIsEditing(true);
                                        if (onEditClick) onEditClick();
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Edit
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

