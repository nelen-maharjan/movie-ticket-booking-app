import { getTheaters } from "@/app/actions/showtimes";
import { AdminTheatersClient } from "@/components/admin/AdminTheatersClient";

export default async function AdminTheatersPage() {
  const theaters = await getTheaters();

  const normalized = theaters.map((t) => ({
    ...t,
    phone: t.phone ?? undefined,
  }));

  return <AdminTheatersClient theaters={normalized} />;
}