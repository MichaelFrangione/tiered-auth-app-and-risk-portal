import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
    const { nextUrl } = req;

    // Check for session token in cookies
    const sessionToken = req.cookies.get('authjs.session-token') ||
        req.cookies.get('__Secure-authjs.session-token');
    const isLoggedIn = !!sessionToken;

    // Protect dashboard routes
    if (nextUrl.pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl));
        }
    }

    // Redirect logged-in users away from auth pages
    if (nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register")) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
