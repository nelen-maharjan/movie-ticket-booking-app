import { AdminStatsCards } from "@/components/admin/AdminStatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { TopMovies } from "@/components/admin/TopMovies";
import { getAdminAnalytics } from "../actions/analytics";

export default async function AdminDashboard() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-widest">
          DASHBOARD
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          CineHive Operations Overview
        </p>
      </div>

      {/* Stats */}
      <section className="w-full">
        <AdminStatsCards stats={analytics.stats} />
      </section>

      {/* Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-background/60 backdrop-blur p-3 sm:p-4 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <RevenueChart data={analytics.dailyRevenue} />
          </div>
        </div>

        {/* Top Movies */}
        <div className="rounded-xl border bg-background/60 backdrop-blur p-3 sm:p-4">
          <TopMovies movies={analytics.topMovies} />
        </div>

      </section>
    </div>
  );
}