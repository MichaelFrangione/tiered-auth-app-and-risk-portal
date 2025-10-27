"use client";

import { useEffect } from "react";

export default function AuthError({
    error,
    reset,
}: {
    error: Error & { digest?: string; };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Auth error:", error);
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>

                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                        Authentication Error
                    </h1>
                    <p className="text-gray-600 mb-6">
                        There was a problem with the authentication process. Please try again.
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
