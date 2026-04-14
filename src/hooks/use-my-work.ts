"use client";

import useSWR from "swr";
import type { ProjectWithRelations } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AssignedItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  column: string;
  sortOrder: number;
  priority: string;
  assigneeId: string;
  dueDate: string | null;
  project: { id: string; name: string };
  labels: { id: string; name: string; color: string }[];
  subtaskCount: number;
  subtaskCompletedCount: number;
}

interface MyWorkData {
  projects: ProjectWithRelations[];
  assignedItems: AssignedItem[];
}

export function useMyWork() {
  const { data, error, isLoading, mutate } = useSWR<MyWorkData>(
    "/api/my/work",
    fetcher
  );

  return {
    projects: data?.projects || [],
    assignedItems: data?.assignedItems || [],
    isLoading,
    error,
    mutate,
  };
}
