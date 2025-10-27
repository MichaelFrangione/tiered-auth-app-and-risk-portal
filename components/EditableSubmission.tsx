"use client";

import { useState } from "react";
import { Role } from "@prisma/client";

interface EditableSubmissionProps {
    submissionId: string;
    initialTitle: string;
    initialContent: string;
    userRole: Role;
    submissionUserId: string;
    currentUserId: string;
}

export default function EditableSubmission({
    submissionId,
    initialTitle,
    initialContent,
    userRole,
    submissionUserId,
    currentUserId
}: EditableSubmissionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [isLoading, setIsLoading] = useState(false);

    // Check if user can edit this submission
    const canEdit = userRole === Role.ADMIN ||
        userRole === Role.DIRECTOR ||
        (userRole === Role.ANALYST && submissionUserId === currentUserId);

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
        setTitle(initialTitle);
        setContent(initialContent);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={6}
                        />
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
        <div className="bg-white shadow rounded-lg p-6">
            <div className="prose max-w-none">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                    {content}
                </p>
            </div>
            {canEdit && (
                <div className="mt-4">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Edit Submission
                    </button>
                </div>
            )}
        </div>
    );
}
