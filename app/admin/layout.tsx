import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-background flex">

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
            {children}
          </div>
        </main>

      </div>

      <AdminMobileNav />

    </div>
  );
}