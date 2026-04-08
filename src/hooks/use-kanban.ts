import useSWR from "swr";
import type { KanbanItemData } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useKanban(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<KanbanItemData[]>(
    `/api/projects/${projectId}/kanban`,
    fetcher
  );

  const items = data ?? [];

  async function moveItem(
    itemId: string,
    column: string,
    sortOrder: number
  ) {
    const optimisticItems = items.map((item) =>
      item.id === itemId ? { ...item, column, sortOrder } : item
    );

    await mutate(
      async () => {
        const res = await fetch(`/api/kanban-items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ column, sortOrder }),
        });
        if (!res.ok) throw new Error("Failed to move item");
        return items.map((item) =>
          item.id === itemId ? { ...item, column, sortOrder } : item
        );
      },
      {
        optimisticData: optimisticItems,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function reorderItems(
    reorderedItems: { id: string; column: string; sortOrder: number }[]
  ) {
    const reorderMap = new Map(
      reorderedItems.map((ri) => [ri.id, ri])
    );
    const optimisticItems = items.map((item) => {
      const update = reorderMap.get(item.id);
      return update
        ? { ...item, column: update.column, sortOrder: update.sortOrder }
        : item;
    });

    await mutate(
      async () => {
        const res = await fetch(
          `/api/projects/${projectId}/kanban/reorder`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: reorderedItems }),
          }
        );
        if (!res.ok) throw new Error("Failed to reorder items");
        return optimisticItems;
      },
      {
        optimisticData: optimisticItems,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function approveItem(id: string) {
    const optimisticItems = items.map((item) =>
      item.id === id ? { ...item, approved: true, isNew: false } : item
    );

    await mutate(
      async () => {
        const res = await fetch(`/api/kanban-items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approved: true, isNew: false }),
        });
        if (!res.ok) throw new Error("Failed to approve item");
        return optimisticItems;
      },
      {
        optimisticData: optimisticItems,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function dismissItem(id: string) {
    const optimisticItems = items.map((item) =>
      item.id === id ? { ...item, dismissed: true } : item
    );

    await mutate(
      async () => {
        const res = await fetch(`/api/kanban-items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dismissed: true }),
        });
        if (!res.ok) throw new Error("Failed to dismiss item");
        return optimisticItems;
      },
      {
        optimisticData: optimisticItems,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function approveAll() {
    const optimisticItems = items.map((item) =>
      item.isNew && !item.approved
        ? { ...item, approved: true, isNew: false }
        : item
    );

    await mutate(
      async () => {
        const res = await fetch(
          `/api/projects/${projectId}/kanban/approve-all`,
          { method: "POST" }
        );
        if (!res.ok) throw new Error("Failed to approve all items");
        return optimisticItems;
      },
      {
        optimisticData: optimisticItems,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function restoreItem(id: string) {
    const optimisticItems = items.map((item) =>
      item.id === id ? { ...item, dismissed: false } : item
    );

    await mutate(
      async () => {
        const res = await fetch(`/api/kanban-items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dismissed: false }),
        });
        if (!res.ok) throw new Error("Failed to restore item");
        return optimisticItems;
      },
      {
        optimisticData: optimisticItems,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  return {
    items,
    error,
    isLoading,
    mutate,
    moveItem,
    reorderItems,
    approveItem,
    dismissItem,
    approveAll,
    restoreItem,
  };
}
