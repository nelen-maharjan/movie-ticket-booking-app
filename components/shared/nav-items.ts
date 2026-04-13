import {
  LayoutDashboard,
  Film,
  MapPin,
  Clock,
  Ticket,
} from "lucide-react";

export const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/movies", label: "Movies", icon: Film },
  { href: "/admin/theaters", label: "Theaters", icon: MapPin },
  { href: "/admin/showtimes", label: "Showtimes", icon: Clock },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
];