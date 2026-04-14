import useSWR from "swr";
import type { KanbanColumnData } from "@/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export function useKanbanColumns(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<KanbanColumnData[]>(
    `/api/projects/${projectId}/kanban/columns`,
    fetcher
  );

  const columns = Array.isArray(data) ? data : [];

  async function addColumn(name: string, color?: string) {
    const optimistic = [
      ...columns,
      {
        id: `temp-${Date.now()}`,
        projectId,
        name,
        sortOrder: columns.length,
        wipLimit: 0,
        color: color ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await mutate(
      async () => {
        const res = await fetch(
          `/api/projects/${projectId}/kanban/columns`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, color }),
          }
        );
        if (!res.ok) throw new Error("Failed to create column");
        return undefined; // revalidate from server
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: true,
      }
    );
  }

  async function updateColumn(
    columnId: string,
    data: { name?: string; color?: string; wipLimit?: number; sortOrder?: number }
  ) {
    const optimistic = columns.map((col) =>
      col.id === columnId ? { ...col, ...data } : col
    );

    await mutate(
      async () => {
        const res = await fetch(
          `/api/projects/${projectId}/kanban/columns/${columnId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error("Failed to update column");
        return optimistic;
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function deleteColumn(columnId: string) {
    const optimistic = columns.filter((col) => col.id !== columnId);

    await mutate(
      async () => {
        const res = await fetch(
          `/api/projects/${projectId}/kanban/columns/${columnId}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Failed to delete column");
        }
        return optimistic;
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function reorderColumns(
    items: { id: string; sortOrder: number }[]
  ) {
    const reorderMap = new Map(items.map((i) => [i.id, i.sortOrder]));
    const optimistic = columns
      .map((col) => ({
        ...col,
        sortOrder: reorderMap.get(col.id) ?? col.sortOrder,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    await mutate(
      async () => {
        const res = await fetch(
          `/api/projects/${projectId}/kanban/columns/reorder`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          }
        );
        if (!res.ok) throw new Error("Failed to reorder columns");
        return optimistic;
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  return {
    columns,
    error,
    isLoading,
    mutate,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
  };
}
