import useSWR from "swr";
import type { KanbanActivityData } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useKanbanActivity(itemId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<KanbanActivityData[]>(
    itemId ? `/api/kanban-items/${itemId}/activity` : null,
    fetcher
  );

  const activities = data ?? [];

  async function addComment(content: string) {
    if (!itemId) return;
    await mutate(
      async () => {
        const res = await fetch(`/api/kanban-items/${itemId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error("Failed to add comment");
        return undefined;
      },
      { revalidate: true }
    );
  }

  return {
    activities,
    error,
    isLoading,
    mutate,
    addComment,
  };
}
