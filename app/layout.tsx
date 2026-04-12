import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/layout/Provider";

export const metadata: Metadata = {
  title: "CinemaHive",
  description: "Discover and share your favorite movies with CinemaHive, the ultimate movie recommendation platform. Explore personalized movie suggestions, create watchlists, and connect with fellow cinephiles to find your next great film experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      <TooltipProvider>
        <Providers>
        <Toaster />
        {children}
        </Providers>
      </TooltipProvider>
      </body>
    </html>
  );
}
