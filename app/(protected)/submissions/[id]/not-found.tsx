import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-gray-300">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 mt-4">Submission Not Found</h2>
                    <p className="text-gray-600 mt-2">
                        The submission you're looking for doesn't exist or you don't have permission to view it.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/dashboard"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>

                    <div className="text-sm text-gray-500">
                        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500">
                            Or return to your dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
