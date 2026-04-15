import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // If not logged in, redirect to login (except for the login page itself)
  if (!req.auth?.user) {
    if (pathname === "/login") return NextResponse.next();
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in but must change password, force to change-password page
  const mustChange = (req.auth.user as { mustChangePassword?: boolean })
    .mustChangePassword;
  if (mustChange) {
    if (
      pathname === "/change-password" ||
      pathname.startsWith("/api/auth") ||
      pathname === "/api/change-password"
    ) {
      return NextResponse.next();
    }
    const changeUrl = new URL("/change-password", req.nextUrl.origin);
    return NextResponse.redirect(changeUrl);
  }

  // If already authenticated and on the login page, redirect to home
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - /api/auth/* (NextAuth endpoints)
     * - /api/ingest/* (agent / webhook endpoints)
     * - /_next/* (Next.js internals)
     * - /favicon.ico
     * - Static files with common extensions
     */
    "/((?!api/auth|api/ingest|_next|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
