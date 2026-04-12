"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Film,
  LogOut,
  LayoutDashboard,
  Ticket,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link
          href="/"
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all duration-300 shadow-sm">
            <Film className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          </div>

          <span className="font-display text-xl md:text-2xl tracking-[0.2em] gold-gradient">
            CinemaHive
          </span>
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">

          {session ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex items-center gap-2"
                >
                  <Link href="/admin">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:flex items-center gap-2"
              >
                <Link href="/bookings">
                  <Ticket className="w-4 h-4" />
                  Tickets
                </Link>
              </Button>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  {session.user?.name?.charAt(0)}
                </div>

                <span className="hidden md:block text-sm text-foreground/90">
                  {session.user?.name}
                </span>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>

              <Button
                size="sm"
                asChild
                className="bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}