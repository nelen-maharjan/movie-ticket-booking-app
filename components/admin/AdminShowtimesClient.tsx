"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createShowtime } from "@/app/actions/showtimes";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Plus, X, Loader2, Clock, Zap } from "lucide-react";
import { format } from "date-fns";

export function AdminShowtimesClient({ showtimes, movies, theaters }: { showtimes:any[]; movies:any[]; theaters:any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [form, setForm] = useState({ movieId:"",screenId:"",startTime:"",basePrice:200,premiumMultiplier:1.5,vipMultiplier:2.5,reclineMultiplier:3.0 });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const selectedTheater = theaters.find(t => t.id === selectedTheaterId);
  const screens = selectedTheater?.screens || [];

  const handleEndTime = () => {
    if (!form.startTime || !form.movieId) return "";
    const movie = movies.find(m => m.id === form.movieId);
    if (!movie) return "";
    const end = new Date(new Date(form.startTime).getTime() + movie.duration * 60 * 1000);
    return end.toISOString().slice(0,16);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const endTime = handleEndTime();
        if (!endTime) throw new Error("Select movie and start time first");
        await createShowtime({ ...form, endTime, basePrice:Number(form.basePrice),
          premiumMultiplier:Number(form.premiumMultiplier), vipMultiplier:Number(form.vipMultiplier), reclineMultiplier:Number(form.reclineMultiplier) });
        toast({ title:"Showtime created" }); setShowForm(false);
      } catch(e:any) { toast({ title:"Error", description:e.message, variant:"destructive" }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl tracking-widest">SHOWTIMES</h1>
          <p className="text-muted-foreground text-sm">{showtimes.length} scheduled</p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Showtime</Button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Movie</th>
              <th className="p-4 hidden md:table-cell">Venue</th>
              <th className="p-4">Time</th>
              <th className="p-4 hidden lg:table-cell">Pricing</th>
              <th className="p-4">Availability</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map(st => (
              <tr key={st.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-sm">{st.movie.title}</p>
                  <p className="text-xs text-muted-foreground">{st.movie.language}</p>
                </td>
                <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                  {st.screen.theater.name}<br/>
                  <span className="text-xs">{st.screen.name}</span>
                </td>
                <td className="p-4">
                  <p className="text-sm font-medium">{format(new Date(st.startTime),"d MMM, h:mm a")}</p>
                  <Badge variant={st.status==="SCHEDULED"?"secondary":"destructive"} className="text-xs mt-0.5">{st.status}</Badge>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <p className="text-sm text-cinema-gold font-medium">{formatCurrency(st.basePrice)}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />Demand: {(st.demandScore * 100).toFixed(0)}%
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-cinema-gold rounded-full transition-all"
                        style={{ width: `${st.totalSeats > 0 ? ((st.totalSeats - st.availableSeats) / st.totalSeats) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{st.availableSeats}/{st.totalSeats}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl tracking-wider">ADD SHOWTIME</h2>
              <Button variant="ghost" size="icon" onClick={()=>setShowForm(false)}><X className="w-5 h-5" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Movie</Label>
                <select value={form.movieId} onChange={e=>setForm(p=>({...p,movieId:e.target.value}))}
                  className="flex h-10 w-full rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                  <option value="">Select movie...</option>
                  {movies.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Theater</Label>
                  <select value={selectedTheaterId} onChange={e=>setSelectedTheaterId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                    <option value="">Select theater...</option>
                    {theaters.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Screen</Label>
                  <select value={form.screenId} onChange={e=>setForm(p=>({...p,screenId:e.target.value}))}
                    className="flex h-10 w-full rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                    <option value="">Select screen...</option>
                    {screens.map((s:any)=><option key={s.id} value={s.id}>{s.name} ({s.screenType})</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Start Time</Label>
                <Input type="datetime-local" value={form.startTime} onChange={e=>setForm(p=>({...p,startTime:e.target.value}))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Base Price (₹)</Label>
                  <Input type="number" min="50" value={form.basePrice} onChange={e=>setForm(p=>({...p,basePrice:Number(e.target.value)}))} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Premium Multiplier</Label>
                  <Input type="number" step="0.1" min="1" value={form.premiumMultiplier} onChange={e=>setForm(p=>({...p,premiumMultiplier:Number(e.target.value)}))} required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="gold" className="flex-1" disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create Showtime
                </Button>
                <Button type="button" variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
