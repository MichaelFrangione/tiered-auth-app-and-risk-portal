"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSubmissionPage() {
    const [tagName, setTagName] = useState("");
    const [risk, setRisk] = useState("NONE");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [existingSubmission, setExistingSubmission] = useState<any>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!tagName.trim()) {
            setError("Please provide a tag name");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/submissions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tag_name: tagName.trim(),
                    risk: risk,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/submissions/${encodeURIComponent(data.tag_name)}`);
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.error || "Failed to create submission";
                setError(errorMessage);

                // Set existing submission details if provided
                if (errorData.existingSubmission) {
                    setExistingSubmission(errorData.existingSubmission);
                }
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Create New Submission
                            </h1>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tag Name
                                </label>
                                <input
                                    type="text"
                                    id="tagName"
                                    value={tagName}
                                    onChange={(e) => setTagName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter tag name (e.g., SUB-2024-001)"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="risk" className="block text-sm font-medium text-gray-700 mb-2">
                                    Risk Level
                                </label>
                                <select
                                    id="risk"
                                    value={risk}
                                    onChange={(e) => setRisk(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    <option value="NONE">None</option>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <p className="text-red-800 text-sm mb-2">{error}</p>
                                    {existingSubmission && (
                                        <div className="text-sm text-gray-600">
                                            <p>Created by: {existingSubmission.createdBy}</p>
                                            <p>Created on: {new Date(existingSubmission.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center space-x-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Creating..." : "Create Submission"}
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
