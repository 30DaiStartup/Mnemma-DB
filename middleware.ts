import { auth } from "@/lib/auth";

export default auth;

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
