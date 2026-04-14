"use client";

import useSWR from "swr";
import type { TeamMember } from "@/lib/team";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface TeamWithMembers {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  projectCount: number;
  memberIds: string[];
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export function useTeams() {
  const { data, error, isLoading, mutate } = useSWR<TeamWithMembers[]>(
    "/api/teams",
    fetcher
  );

  return {
    teams: data || [],
    isLoading,
    error,
    mutate,
  };
}
