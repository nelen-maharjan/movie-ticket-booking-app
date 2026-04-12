import { getAdminAnalytics } from "@/app/actions/analytics";
import { AdminStatsCards } from "@/components/admin/AdminStatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { TopMovies } from "@/components/admin/top-movies";

export default async function AdminDashboard() {
  const analytics = await getAdminAnalytics();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-widest mb-1">DASHBOARD</h1>
        <p className="text-muted-foreground text-sm">CineVault Operations Overview</p>
      </div>
      <AdminStatsCards stats={analytics.stats} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={analytics.dailyRevenue} />
        </div>
        <TopMovies movies={analytics.topMovies} />
      </div>
    </div>
  );
}
