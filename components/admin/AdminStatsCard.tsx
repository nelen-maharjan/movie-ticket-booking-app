import { Film, Ticket, Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export type AdminStats = {
  totalMovies: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
};

type Props = {
  stats: AdminStats;
};

export function AdminStatsCards({ stats }: Props) {
  const cards = [
    {
      label: "Total Movies",
      value: stats.totalMovies,
      icon: Film,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: Ticket,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Registered Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: "text-cinema-gold",
      bg: "bg-cinema-gold/10 border-cinema-gold/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-5 ${card.bg}`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              {card.label}
            </p>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>

          <p
            className={`font-display text-2xl tracking-wider ${card.color}`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}