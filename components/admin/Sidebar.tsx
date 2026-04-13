"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, LayoutDashboard, MapPin, Clock, Ticket, LogOut, Clapperboard } from "lucide-react";
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
    <aside className="w-56 shrink-0 border-r border-border bg-cinema-surface flex flex-col">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-5 h-5 text-cinema-gold" />
          <span className="font-display text-xl tracking-widest gold-gradient">ADMIN</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">CineVault Control</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              pathname === href
                ? "bg-cinema-gold/15 text-cinema-gold border border-cinema-gold/20"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}>
            <Icon className="w-4 h-4" />{label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-sm text-muted-foreground hover:text-cinema-red hover:bg-cinema-red/10 w-full transition-all">
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </aside>
  );
}
