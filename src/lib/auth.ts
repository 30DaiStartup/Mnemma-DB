import NextAuth from "next-auth";
import AzureAd from "next-auth/providers/azure-ad";

/**
 * Auth is optional — if Azure AD env vars are not set, the app runs without auth.
 * This lets dev mode work without any Azure configuration.
 */

const isAuthConfigured = Boolean(
  process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
);

const providers = isAuthConfigured
  ? [
      AzureAd({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID!}/v2.0`,
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
  callbacks: {
    authorized({ auth: session }) {
      // If auth is not configured, allow all requests
      if (!isAuthConfigured) return true;
      // Otherwise require a valid session
      return !!session?.user;
    },
  },
});

// ---------------------------------------------------------------------------
// Role-based helpers
// ---------------------------------------------------------------------------

/**
 * Check if the session user is an admin.
 * Reads ADMIN_EMAILS env var (comma-separated list).
 * If ADMIN_EMAILS is not set, all authenticated users are considered admins.
 * If auth is not configured at all, returns true (dev mode — no restrictions).
 */
export function isAdmin(
  session: { user?: { email?: string | null } } | null | undefined
): boolean {
  // Auth not configured — dev mode, allow everything
  if (!isAuthConfigured) return true;

  // No session means not authenticated
  if (!session?.user) return false;

  const adminEmails = process.env.ADMIN_EMAILS;
  // If no admin list is defined, all authenticated users are admins
  if (!adminEmails) return true;

  const list = adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return list.includes(session.user.email?.toLowerCase() ?? "");
}
