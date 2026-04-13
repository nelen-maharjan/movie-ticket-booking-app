"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "../shared/nav-items";

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">

      <div className="grid grid-cols-5 py-2">

        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px]",
                isActive ? "text-cinema-gold" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition",
                  isActive && "bg-cinema-gold/10"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span>{label}</span>

              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cinema-gold" />
              )}
            </Link>
          );
        })}

      </div>
    </div>
  );
}