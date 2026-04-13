"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Clapperboard } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { navItems } from "../shared/nav-items";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r bg-background/60 backdrop-blur-xl flex-col sticky top-0 h-screen">

      <div className="p-5 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cinema-gold/10">
            <Clapperboard className="w-5 h-5 text-cinema-gold" />
          </div>

          <div>
            <p className="font-display text-lg tracking-widest gold-gradient">
              ADMIN
            </p>
            <p className="text-xs text-muted-foreground">
              CineVault Control
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                isActive
                  ? "bg-cinema-gold/10 text-cinema-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full",
                  isActive
                    ? "bg-cinema-gold"
                    : "opacity-0 group-hover:opacity-40 bg-muted-foreground"
                )}
              />

              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-md transition",
                  isActive ? "bg-cinema-gold/20" : "group-hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-md">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}