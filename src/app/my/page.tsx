"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lightbulb, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { IdeasList } from "@/components/my/ideas-list";
import { MyWorkList } from "@/components/my/my-work-list";

const tabs = [
  { id: "ideas", label: "My Ideas", icon: Lightbulb },
  { id: "work", label: "My Work", icon: Briefcase },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabId>("ideas");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          Back to Dashboard
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">My Work</h1>
        <p className="text-sm text-muted-foreground">
          Your personal ideas and assigned work across projects
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "ideas" && <IdeasList />}
      {activeTab === "work" && <MyWorkList />}
    </div>
  );
}
