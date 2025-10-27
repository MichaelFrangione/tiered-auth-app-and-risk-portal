"use client";

import { useEffect } from "react";

export default function ProtectedError({
    error,
    reset,
}: {
    error: Error & { digest?: string; };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Protected route error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                    </svg>
                </div>

                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                        Dashboard Error
                    </h1>
                    <p className="text-gray-600 mb-6">
                        There was a problem loading the dashboard. This might be due to insufficient permissions or a system error.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={reset}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Try again
                        </button>

                        <button
                            onClick={() => window.location.href = '/login'}
                            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                            Back to login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
