import { getTeam } from "@/lib/team";

/**
 * Get the current member ID.
 * In dev mode (no auth configured), uses DEV_USER_ID env var or falls back to
 * the first member in team.yaml.
 *
 * NOTE: This file must NOT be imported in Edge middleware — it uses Node.js APIs
 * via team.ts. Only import from API routes and server components.
 */
export function getCurrentMemberId(): string {
  if (process.env.DEV_USER_ID) return process.env.DEV_USER_ID;

  const team = getTeam();
  return team[0]?.id || "unknown";
}
