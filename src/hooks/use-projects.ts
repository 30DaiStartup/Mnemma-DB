"use client";

import useSWR from "swr";
import type { ProjectWithRelations } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProjects(status?: string) {
  const url = status ? `/api/projects?status=${status}` : "/api/projects";

  const { data, error, isLoading, mutate } = useSWR<ProjectWithRelations[]>(
    url,
    fetcher
  );

  async function reorderProjects(
    items: { id: string; sortOrder: number }[]
  ) {
    if (!data) return;

    // Optimistic update: reorder local data
    const reordered = items
      .map((item) => {
        const project = data.find((p) => p.id === item.id);
        if (!project) return null;
        return { ...project, sortOrder: item.sortOrder };
      })
      .filter(Boolean) as ProjectWithRelations[];

    reordered.sort((a, b) => a.sortOrder - b.sortOrder);

    await mutate(reordered, {
      revalidate: false,
    });

    // Persist each reorder via PATCH
    await Promise.all(
      items.map((item) =>
        fetch(`/api/projects/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: item.sortOrder }),
        })
      )
    );

    // Revalidate to sync with server
    mutate();
  }

  async function activateProject(id: string) {
    // Find the project to get its phase config
    const allProjects = data || [];
    const project = allProjects.find((p) => p.id === id);
    const firstPhase =
      project?.phaseConfig?.[0]?.name || "Discussion";

    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active", phase: firstPhase }),
    });

    mutate();
  }

  return {
    projects: data || [],
    isLoading,
    error,
    mutate,
    reorderProjects,
    activateProject,
  };
}
