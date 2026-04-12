"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await registerUser(form);
        toast({ title: "Account created!", description: "Please sign in.", variant: "default" });
        router.push("/login");
      } catch (e: any) {
        toast({ title: "Registration failed", description: e.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cinema-gold/20 border border-cinema-gold/30 flex items-center justify-center mx-auto mb-4">
            <Film className="w-7 h-7 text-cinema-gold" />
          </div>
          <h1 className="font-display text-4xl tracking-widest gold-gradient">CINEVAULT</h1>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
              { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              { id: "password", label: "Password", type: "password", placeholder: "Min 6 characters" },
              { id: "phone", label: "Phone (optional)", type: "tel", placeholder: "+977 98XXXXXXXX" },
            ].map(f => (
              <div key={f.id} className="space-y-2">
                <Label htmlFor={f.id}>{f.label}</Label>
                <Input id={f.id} type={f.type} placeholder={f.placeholder}
                  value={(form as any)[f.id]}
                  onChange={e => setForm(prev => ({ ...prev, [f.id]: e.target.value }))}
                  required={f.id !== "phone"} />
              </div>
            ))}
            <Button type="submit" variant="gold" className="w-full" size="lg" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Account
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-cinema-gold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
