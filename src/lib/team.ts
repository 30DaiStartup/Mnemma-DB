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

interface TeamFile {
  team: TeamMember[];
}

let cachedTeam: TeamMember[] | null = null;

export function getTeam(): TeamMember[] {
  if (cachedTeam) return cachedTeam;

  const filePath = path.join(process.cwd(), "data", "team.yaml");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const data = YAML.parse(fileContents) as TeamFile;
  cachedTeam = data.team;
  return cachedTeam;
}

export function getTeamMember(id: string): TeamMember | undefined {
  return getTeam().find((m) => m.id === id);
}
