"use client";

import { useState, useEffect } from "react";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";

interface SubmissionActionsProps {
    submissionId: string;
    userRole: Role;
    submissionUserId: string;
    currentUserId: string;
}

export default function SubmissionActions({
    submissionId,
    userRole,
    submissionUserId,
    currentUserId
}: SubmissionActionsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Check if user can edit/delete this submission
    const canEdit = userRole === Role.ADMIN ||
        userRole === Role.DIRECTOR ||
        (userRole === Role.ANALYST && submissionUserId === currentUserId);

    const canDelete = userRole === Role.ADMIN ||
        userRole === Role.DIRECTOR ||
        (userRole === Role.ANALYST && submissionUserId === currentUserId);

    const handleEdit = () => {
        setIsEditing(true);
        // Fetch current values from the page
        const titleElement = document.querySelector('h1');
        const contentElement = document.querySelector('.prose p');

        if (titleElement) {
            const currentTitle = titleElement.textContent || '';
            setTitle(currentTitle === 'Untitled Submission' ? '' : currentTitle);
        }
        if (contentElement) {
            const currentContent = contentElement.textContent || '';
            setContent(currentContent === 'No content available for this submission.' ? '' : currentContent);
        }
    };

    const handleSave = async () => {
        if (!title.trim() && !content.trim()) {
            alert('Please provide at least a title or content');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/submissions/${submissionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });

            if (response.ok) {
                setIsEditing(false);
                router.refresh(); // Refresh the page to show updated data
            } else {
                const error = await response.json();
                alert(`Failed to update submission: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert('Error updating submission');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTitle("");
        setContent("");
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/submissions/${submissionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/dashboard');
            } else {
                const error = await response.json();
                alert(`Failed to delete submission: ${error.error || 'Unknown error'}`);
                setIsDeleting(false);
            }
        } catch (error) {
            alert('Error deleting submission');
            setIsDeleting(false);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Submission</h3>
                <div className="space-y-4">
                    <div>

                        <textarea
                            value={`${title}\n\n${content}`}
                            onChange={(e) => {
                                const lines = e.target.value.split('\n');
                                const newTitle = lines[0] || '';
                                const newContent = lines.slice(2).join('\n') || '';
                                setTitle(newTitle);
                                setContent(newContent);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            First line will be used as the title, rest as content
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            {canEdit && (
                <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Edit Submission
                </button>
            )}
            {canDelete && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDeleting ? 'Deleting...' : 'Delete Submission'}
                </button>
            )}
        </div>
    );
}
