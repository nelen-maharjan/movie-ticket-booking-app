import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/signin") && isLoggedIn) {
  const role = req.auth?.user?.role;

  if (role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // default for normal users
  return NextResponse.redirect(new URL("/", req.url));
}

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/signin"],
};