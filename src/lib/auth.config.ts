import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Auth config that is safe for Edge middleware (no Node.js-only imports).
 * The actual credential validation happens in auth.ts via the authorize callback.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    // Credentials provider is declared here for the middleware to recognize it,
    // but authorize is overridden in auth.ts with the full Node.js implementation.
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { mustChangePassword?: boolean }).mustChangePassword =
          token.mustChangePassword as boolean;
      }
      return session;
    },
  },
};
