"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  LayoutDashboard,
  MapPin,
  Clock,
  Ticket,
  LogOut,
  Clapperboard,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/movies", label: "Movies", icon: Film },
  { href: "/admin/theaters", label: "Theaters", icon: MapPin },
  { href: "/admin/showtimes", label: "Showtimes", icon: Clock },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r bg-background/60 backdrop-blur-xl flex flex-col">
      
      {/* 🔷 Header */}
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

      {/* 🔷 Navigation */}
      <nav className="flex-1 p-3 space-y-1.5">
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
              {/* Active indicator */}
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full transition-all",
                  isActive
                    ? "bg-cinema-gold opacity-100"
                    : "opacity-0 group-hover:opacity-40 bg-muted-foreground"
                )}
              />

              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md transition",
                  isActive
                    ? "bg-cinema-gold/20"
                    : "group-hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Label */}
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 🔷 Footer */}
      <div className="p-3 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all group"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-md group-hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
          </div>

          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}