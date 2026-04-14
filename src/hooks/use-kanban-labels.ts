import useSWR from "swr";
import type { KanbanLabelData } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useKanbanLabels(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<KanbanLabelData[]>(
    `/api/projects/${projectId}/kanban/labels`,
    fetcher
  );

  const labels = data ?? [];

  async function addLabel(name: string, color?: string) {
    await mutate(
      async () => {
        const res = await fetch(
          `/api/projects/${projectId}/kanban/labels`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, color }),
          }
        );
        if (!res.ok) throw new Error("Failed to create label");
        return undefined;
      },
      { revalidate: true }
    );
  }

  async function deleteLabel(labelId: string) {
    const optimistic = labels.filter((l) => l.id !== labelId);
    await mutate(
      async () => {
        const res = await fetch(`/api/kanban-labels/${labelId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete label");
        return optimistic;
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function assignLabel(itemId: string, labelId: string) {
    const res = await fetch(`/api/kanban-items/${itemId}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelId }),
    });
    if (!res.ok) throw new Error("Failed to assign label");
  }

  async function removeLabel(itemId: string, labelId: string) {
    const res = await fetch(
      `/api/kanban-items/${itemId}/labels/${labelId}`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error("Failed to remove label");
  }

  return {
    labels,
    error,
    isLoading,
    mutate,
    addLabel,
    deleteLabel,
    assignLabel,
    removeLabel,
  };
}
