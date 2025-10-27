import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
    // Registration is disabled
    return NextResponse.json(
        { error: "Registration is currently disabled" },
        { status: 403 }
    );

    try {
        const { name, email, password, organization, role } = await request.json();

        // Validate required fields
        if (!name || !email || !password || !organization) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Find or create organization
        let org = await db.organization.findUnique({
            where: { name: organization },
        });

        if (!org) {
            org = await db.organization.create({
                data: { name: organization },
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                organization_id: org.id,
                role: (role as Role) || Role.ANALYST,
            },
        });

        return NextResponse.json(
            { message: "User created successfully", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
