import fs from "fs";
import path from "path";
import YAML from "yaml";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface TeamGroup {
  id: string;
  name: string;
  members: string[];
}

interface TeamFile {
  team: TeamMember[];
  teams?: TeamGroup[];
}

let cachedData: TeamFile | null = null;

function loadTeamFile(): TeamFile {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), "data", "team.yaml");
  const fileContents = fs.readFileSync(filePath, "utf8");
  cachedData = YAML.parse(fileContents) as TeamFile;
  return cachedData;
}

export function getTeam(): TeamMember[] {
  return loadTeamFile().team;
}

export function getTeamMember(id: string): TeamMember | undefined {
  return getTeam().find((m) => m.id === id);
}

export function getTeamGroups(): TeamGroup[] {
  return loadTeamFile().teams || [];
}

export function getTeamGroupForMember(memberId: string): TeamGroup | undefined {
  return getTeamGroups().find((g) => g.members.includes(memberId));
}
