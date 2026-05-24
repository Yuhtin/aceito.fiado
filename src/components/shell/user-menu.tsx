"use client";

import { LogOut, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export function UserMenu({
  user,
  variant = "dark",
  compact = false,
}: {
  user: AuthUser;
  variant?: "dark" | "light";
  compact?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
          variant === "dark"
            ? "hover:bg-sidebar-accent"
            : "hover:bg-muted",
          compact && "w-auto",
        )}
      >
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full font-semibold text-sm",
            variant === "dark"
              ? "bg-primary text-primary-foreground"
              : "bg-primary text-primary-foreground",
          )}
        >
          {initials(user.name)}
        </div>
        {!compact && (
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-sm font-medium",
                variant === "dark"
                  ? "text-sidebar-foreground"
                  : "text-foreground",
              )}
            >
              {user.name}
            </p>
            <p
              className={cn(
                "truncate text-xs",
                variant === "dark"
                  ? "text-sidebar-foreground/60"
                  : "text-muted-foreground",
              )}
            >
              {user.email}
            </p>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="gap-2">
          <User className="size-4" /> Conta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2 text-destructive focus:text-destructive">
          <a href="/sair">
            <LogOut className="size-4" /> Sair
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
