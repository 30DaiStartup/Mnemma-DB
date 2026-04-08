"use client";

import useSWR from "swr";
import type { ProjectWithRelations } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBacklog() {
  const { data, error, isLoading, mutate } = useSWR<ProjectWithRelations[]>(
    "/api/projects?status=backlog",
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

    await mutate(reordered, {
      revalidate: false,
    });

    // Persist via dedicated backlog reorder endpoint
    await fetch("/api/backlog/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    // Revalidate
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
