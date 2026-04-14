"use client";

import useSWR from "swr";
import type { PersonalIdeaData } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePersonalIdeas() {
  const { data, error, isLoading, mutate } = useSWR<PersonalIdeaData[]>(
    "/api/personal-ideas",
    fetcher
  );

  async function createIdea(idea: { title: string; description?: string; priority?: string }) {
    const res = await fetch("/api/personal-ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(idea),
    });
    const created = await res.json();
    mutate();
    return created;
  }

  async function updateIdea(id: string, updates: Partial<PersonalIdeaData>) {
    if (!data) return;

    // Optimistic update
    const updated = data.map((idea) =>
      idea.id === id ? { ...idea, ...updates } : idea
    );
    await mutate(updated, { revalidate: false });

    await fetch(`/api/personal-ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    mutate();
  }

  async function deleteIdea(id: string) {
    if (!data) return;

    // Optimistic update
    await mutate(
      data.filter((idea) => idea.id !== id),
      { revalidate: false }
    );

    await fetch(`/api/personal-ideas/${id}`, {
      method: "DELETE",
    });

    mutate();
  }

  async function promoteIdea(id: string, teamId: string) {
    const res = await fetch(`/api/personal-ideas/${id}/promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    const result = await res.json();
    mutate();
    return result;
  }

  return {
    ideas: data || [],
    isLoading,
    error,
    mutate,
    createIdea,
    updateIdea,
    deleteIdea,
    promoteIdea,
  };
}
