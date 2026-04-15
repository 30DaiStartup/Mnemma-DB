import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

/**
 * Full auth setup with Node.js-only authorize logic.
 * Do NOT import this from Edge middleware — use auth.config.ts instead.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user) return null;

        const valid = bcrypt.compareSync(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});

// ---------------------------------------------------------------------------
// Role-based helpers
// ---------------------------------------------------------------------------

const adminEmails = process.env.ADMIN_EMAILS;

export function isAdmin(
  session: { user?: { email?: string | null } } | null | undefined
): boolean {
  if (!session?.user) return false;
  if (!adminEmails) return true;

  const list = adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return list.includes(session.user.email?.toLowerCase() ?? "");
}
