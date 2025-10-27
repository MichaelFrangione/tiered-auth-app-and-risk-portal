import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export const authOptions: NextAuthConfig = {
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await db.user.findUnique({
                    where: {
                        email: credentials.email as string,
                    },
                    include: {
                        organization: true,
                    },
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    organization_id: user.organization_id,
                    organizationName: user.organization.name,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, user }: { token: any; user: any; }) {
            if (user) {
                token.role = user.role;
                token.organization_id = user.organization_id;
                token.organizationName = user.organizationName;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any; }) {
            if (token) {
                session.user.id = token.sub!;
                session.user.role = token.role as Role;
                session.user.organization_id = token.organization_id as string;
                session.user.organizationName = token.organizationName as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export const { GET, POST } = handlers;
