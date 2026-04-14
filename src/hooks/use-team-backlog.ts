"use client";

import useSWR from "swr";
import type { ProjectWithRelations } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTeamBacklog(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<ProjectWithRelations[]>(
    `/api/teams/${slug}/backlog`,
    fetcher
  );

  async function reorderBacklog(
    items: { id: string; sortOrder: number }[]
  ) {
    if (!data) return;

    // Optimistic update
    const reordered = items
      .map((item) => {
        const project = data.find((p) => p.id === item.id);
        if (!project) return null;
        return { ...project, sortOrder: item.sortOrder };
      })
      .filter(Boolean) as ProjectWithRelations[];

    reordered.sort((a, b) => a.sortOrder - b.sortOrder);

    await mutate(reordered, { revalidate: false });

    await fetch(`/api/teams/${slug}/backlog/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    mutate();
  }

  return {
    backlog: data || [],
    isLoading,
    error,
    mutate,
    reorderBacklog,
  };
}
