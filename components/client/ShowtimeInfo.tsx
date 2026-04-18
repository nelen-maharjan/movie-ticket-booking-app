import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Monitor } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type ShowtimeInfoProps = {
  showtime: {
    movie: {
      id: string;
      title: string;
      posterUrl: string;
    };
    startTime: Date | string;
    availableSeats: number;
    demandScore: number;
    screen: {
      name: string;
      screenType: string;
      theater: {
        name: string;
        city: string;
      };
    };
  };
};

export function ShowtimeInfo({ showtime }: ShowtimeInfoProps) {
  return (
    <div className="mb-8">
      <Link href={`/movies/${showtime.movie.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />Back to {showtime.movie.title}
      </Link>
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-6">
        <Image src={showtime.movie.posterUrl} alt={showtime.movie.title} width={80} height={120} className="rounded-lg object-cover" />
        <div className="flex-1">
          <h1 className="font-display text-3xl tracking-wider mb-2">{showtime.movie.title}</h1>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 text-cinema-gold" />
              {formatDateTime(showtime.startTime)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-cinema-gold" />
              {showtime.screen.theater.name}, {showtime.screen.theater.city}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Monitor className="w-4 h-4 text-cinema-gold" />
              {showtime.screen.name} · {showtime.screen.screenType}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">{showtime.availableSeats} seats available</Badge>
            {showtime.demandScore > 0.7 && <Badge variant="cinema">High Demand</Badge>}
          </div>
        </div>
      </div>
    </div>
  );
}
