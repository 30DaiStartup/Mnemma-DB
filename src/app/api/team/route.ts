import { NextResponse } from "next/server";
import { getTeam } from "@/lib/team";

export async function GET() {
  try {
    const team = getTeam();
    return NextResponse.json(team);
  } catch (error) {
    console.error("GET /api/team error:", error);
    return NextResponse.json(
      { error: "Failed to load team roster" },
      { status: 500 }
    );
  }
}
