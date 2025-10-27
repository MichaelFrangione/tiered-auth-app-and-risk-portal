import { Role } from "@prisma/client";

declare module "next-auth" {
    interface User {
        role: Role;
        organization_id: string;
        organizationName: string;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: Role;
            organization_id: string;
            organizationName: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
        organization_id: string;
        organizationName: string;
    }
}
