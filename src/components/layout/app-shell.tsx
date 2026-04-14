"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/my", label: "My Work", icon: User },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary">
            <LayoutDashboard className="size-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Project Dashboard
          </span>
        </Link>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto py-3">
        <SidebarNav />
      </div>
      <Separator />
      <div className="px-2 py-2">
        <UserMenu />
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r bg-background md:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="flex h-12 items-center gap-2 border-b px-4 md:hidden">
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8" />
              }
            >
              <Menu className="size-4" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary">
                <LayoutDashboard className="size-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Project Dashboard
              </span>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        <SheetContent side="left" className="w-56 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </div>
  );
}
