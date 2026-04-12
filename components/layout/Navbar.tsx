"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Film, User, LogOut, LayoutDashboard, Ticket } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-cinema-gold/20 flex items-center justify-center border border-cinema-gold/30 group-hover:bg-cinema-gold/30 transition-colors">
            <Film className="w-5 h-5 text-cinema-gold" />
          </div>
          <span className="font-display text-2xl tracking-widest gold-gradient">CINEVAULT</span>
        </Link>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin"><LayoutDashboard className="w-4 h-4 mr-2" />Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/bookings"><Ticket className="w-4 h-4 mr-2" />My Tickets</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile"><User className="w-4 h-4 mr-2" />{session.user?.name}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
