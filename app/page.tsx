import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...auth]/route";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Submission Analyzer
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            A powerful platform for analyzing and managing submissions with risk assessment.
            Get started by signing in to your account.
          </p>

          <div className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Authentication</h3>
            <p className="text-gray-600">
              Enterprise-grade security with NextAuth.js and role-based access control.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Submission Management</h3>
            <p className="text-gray-600">
              Upload, manage, and track submissions with an intuitive interface.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-tier Access</h3>
            <p className="text-gray-600">
              Different permission levels for admins, reviewers, and submitters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
