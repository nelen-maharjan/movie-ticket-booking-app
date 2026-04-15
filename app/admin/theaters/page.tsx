import { getTheaters } from "@/app/actions/showtimes";
import { AdminTheatersClient } from "@/components/admin/AdminTheatersClient";


export default async function AdminTheatersPage() {
  const theaters = await getTheaters();
  return <AdminTheatersClient theaters={theaters} />;
}
