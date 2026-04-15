"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createTheater, createScreen } from "@/app/actions/showtimes";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, Loader2, MapPin, Monitor, ChevronDown, ChevronUp } from "lucide-react";

const SCREEN_TYPES = ["STANDARD","IMAX","4DX","DOLBY"];

export function AdminTheatersClient({ theaters }: { theaters: any[] }) {
  const [showTheaterForm, setShowTheaterForm] = useState(false);
  const [showScreenForm, setShowScreenForm] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [theaterForm, setTheaterForm] = useState({ name:"",location:"",city:"",address:"",phone:"" });
  const [screenForm, setScreenForm] = useState({ name:"",totalRows:8,totalCols:12,screenType:"STANDARD" });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleTheater = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try { await createTheater(theaterForm); toast({ title:"Theater created" }); setShowTheaterForm(false); }
      catch(e:any) { toast({ title:"Error", description:e.message, variant:"destructive" }); }
    });
  };

  const handleScreen = (theaterId: string) => (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createScreen({ ...screenForm, theaterId, totalRows:Number(screenForm.totalRows), totalCols:Number(screenForm.totalCols) });
        toast({ title:`Screen created with ${Number(screenForm.totalRows)*Number(screenForm.totalCols)} seats` });
        setShowScreenForm(null);
      } catch(e:any) { toast({ title:"Error", description:e.message, variant:"destructive" }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl tracking-widest">THEATERS</h1>
          <p className="text-muted-foreground text-sm">{theaters.length} theaters</p>
        </div>
        <Button variant="gold" onClick={() => setShowTheaterForm(true)}><Plus className="w-4 h-4 mr-2" />Add Theater</Button>
      </div>

      <div className="space-y-4">
        {theaters.map(theater => (
          <div key={theater.id} className="glass rounded-xl overflow-hidden">
            <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === theater.id ? null : theater.id)}>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cinema-gold" />
                <div>
                  <p className="font-semibold">{theater.name}</p>
                  <p className="text-sm text-muted-foreground">{theater.city} — {theater.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{theater.screens.length} screens</Badge>
                {expanded === theater.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
            {expanded === theater.id && (
              <div className="border-t border-border p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {theater.screens.map((screen: any) => (
                    <div key={screen.id} className="bg-secondary/30 rounded-lg p-3 flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-cinema-gold shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{screen.name}</p>
                        <p className="text-xs text-muted-foreground">{screen.screenType} · {screen.totalRows * screen.totalCols} seats</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setShowScreenForm(theater.id)}
                    className="border border-dashed border-border rounded-lg p-3 flex items-center gap-2 text-sm text-muted-foreground hover:border-cinema-gold/40 hover:text-cinema-gold transition-all">
                    <Plus className="w-4 h-4" />Add Screen
                  </button>
                </div>

                {showScreenForm === theater.id && (
                  <form onSubmit={handleScreen(theater.id)} className="grid grid-cols-2 gap-4 p-4 bg-secondary/20 rounded-xl">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Screen Name</Label>
                      <Input value={screenForm.name} onChange={e=>setScreenForm(p=>({...p,name:e.target.value}))} placeholder="Screen 1" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Screen Type</Label>
                      <div className="flex gap-2 flex-wrap">
                        {SCREEN_TYPES.map(t => (
                          <button type="button" key={t} onClick={() => setScreenForm(p=>({...p,screenType:t}))}
                            className={`px-2 py-1 rounded text-xs border transition-all ${screenForm.screenType===t?"bg-cinema-gold/20 text-cinema-gold border-cinema-gold/40":"border-border text-muted-foreground"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rows (letters)</Label>
                      <Input type="number" min="3" max="26" value={screenForm.totalRows} onChange={e=>setScreenForm(p=>({...p,totalRows:Number(e.target.value)}))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Columns per row</Label>
                      <Input type="number" min="5" max="30" value={screenForm.totalCols} onChange={e=>setScreenForm(p=>({...p,totalCols:Number(e.target.value)}))} required />
                    </div>
                    <p className="col-span-2 text-xs text-muted-foreground">{Number(screenForm.totalRows)*Number(screenForm.totalCols)} total seats will be created</p>
                    <div className="col-span-2 flex gap-2">
                      <Button type="submit" variant="gold" size="sm" disabled={isPending}>
                        {isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}Create Screen
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={()=>setShowScreenForm(null)}>Cancel</Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Theater Form Modal */}
      {showTheaterForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl tracking-wider">ADD THEATER</h2>
              <Button variant="ghost" size="icon" onClick={()=>setShowTheaterForm(false)}><X className="w-5 h-5" /></Button>
            </div>
            <form onSubmit={handleTheater} className="space-y-4">
              {[
                {id:"name",label:"Theater Name"},{id:"city",label:"City"},{id:"location",label:"Area/Locality"},
                {id:"address",label:"Full Address"},{id:"phone",label:"Phone (optional)",required:false}
              ].map(f=>(
                <div key={f.id} className="space-y-1.5">
                  <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                  <Input id={f.id} value={(theaterForm as any)[f.id]}
                    onChange={e=>setTheaterForm(p=>({...p,[f.id]:e.target.value}))} required={f.required!==false} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="gold" className="flex-1" disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create Theater
                </Button>
                <Button type="button" variant="outline" onClick={()=>setShowTheaterForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
