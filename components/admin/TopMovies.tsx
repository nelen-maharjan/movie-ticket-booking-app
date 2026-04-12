import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { TopMovie } from "@/lib/types/movie";

type Props ={
    movies: TopMovie[]
}

export function TopMovies({ movies }: Props) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-cinema-gold" />Top Performing
      </h3>
      <div className="space-y-3">
        {movies.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm w-4 font-mono">{i + 1}</span>
            <Image src={m.posterUrl} alt={m.title} width={36} height={54} className="rounded object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.totalBookings} bookings</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-cinema-gold font-bold">{m.popularityScore}</p>
              <p className="text-xs text-muted-foreground">score</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
