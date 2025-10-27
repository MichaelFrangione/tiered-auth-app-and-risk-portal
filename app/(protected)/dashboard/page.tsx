import { auth } from "@/app/api/auth/[...auth]/route";
import { signOut } from "next-auth/react";
import { db } from "@/lib/db";
import { getRoleDisplayName } from "@/lib/permissions";
import LogoutButton from "@/components/LogoutButton";
import SubmissionsList from "@/components/SubmissionsList";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        return <div>Not authenticated</div>;
    }

    // Get user with organization details
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            organization: true,
        },
    });

    if (!user) {
        return <div>User not found</div>;
    }

    const getAccessMessage = () => {
        switch (user.role) {
            case "ADMIN":
                return "Full system access - You can view and manage all organizations and data";
            case "DIRECTOR":
                return `Access to ${user.organization.name} data - You can view and manage all data within your organization`;
            case "ANALYST":
                return `Limited access to ${user.organization.name} data - You can view limited data fields within your organization`;
            default:
                return "Unknown access level";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                                <p className="mt-2 text-gray-600">Welcome back, {user.name}!</p>
                            </div>
                            <LogoutButton />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="text-sm text-gray-900">{user.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="text-sm text-gray-900">{user.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                                        <dd className="text-sm text-gray-900">{getRoleDisplayName(user.role)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Organization</dt>
                                        <dd className="text-sm text-gray-900">{user.organization.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                                        <dd className="text-sm text-gray-900">
                                            {new Date(user.created_at).toISOString().split('T')[0]}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Level</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${user.role === "ADMIN" ? "bg-red-500" :
                                            user.role === "DIRECTOR" ? "bg-yellow-500" : "bg-green-500"
                                            }`}></div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {getRoleDisplayName(user.role)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-4">
                                        {getAccessMessage()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submissions Component */}
                        <div className="mt-6">
                            <SubmissionsList
                                userRole={user.role}
                                userOrganizationId={user.organization_id}
                                userId={user.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
