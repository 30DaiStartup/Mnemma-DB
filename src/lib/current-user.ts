import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get the current member ID from the session.
 * Falls back to DEV_USER_ID env var for scripts/testing.
 *
 * NOTE: This is async because it reads the session. Only call from
 * API routes and server components (not Edge middleware).
 */
export async function getCurrentMemberId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  // Fallback for dev/testing
  if (process.env.DEV_USER_ID) return process.env.DEV_USER_ID;

  // Last resort: first user in DB
  const first = await prisma.user.findFirst({ select: { id: true } });
  return first?.id || "unknown";
}
