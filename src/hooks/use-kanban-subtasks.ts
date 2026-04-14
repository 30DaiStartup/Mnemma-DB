import useSWR from "swr";
import type { KanbanSubtaskData } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useKanbanSubtasks(itemId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<KanbanSubtaskData[]>(
    itemId ? `/api/kanban-items/${itemId}/subtasks` : null,
    fetcher
  );

  const subtasks = data ?? [];

  async function addSubtask(title: string) {
    if (!itemId) return;
    await mutate(
      async () => {
        const res = await fetch(`/api/kanban-items/${itemId}/subtasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, sortOrder: subtasks.length }),
        });
        if (!res.ok) throw new Error("Failed to create subtask");
        return undefined;
      },
      { revalidate: true }
    );
  }

  async function updateSubtask(
    subtaskId: string,
    data: { title?: string; completed?: boolean }
  ) {
    const optimistic = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, ...data } : s
    );

    await mutate(
      async () => {
        const res = await fetch(`/api/kanban-subtasks/${subtaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update subtask");
        return optimistic;
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function deleteSubtask(subtaskId: string) {
    const optimistic = subtasks.filter((s) => s.id !== subtaskId);

    await mutate(
      async () => {
        const res = await fetch(`/api/kanban-subtasks/${subtaskId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete subtask");
        return optimistic;
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function toggleSubtask(subtaskId: string) {
    const subtask = subtasks.find((s) => s.id === subtaskId);
    if (subtask) {
      await updateSubtask(subtaskId, { completed: !subtask.completed });
    }
  }

  return {
    subtasks,
    error,
    isLoading,
    mutate,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
  };
}
