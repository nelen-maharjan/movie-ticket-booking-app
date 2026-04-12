"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader2, Film } from "lucide-react";
import { registerUser } from "@/app/actions/auth";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

type FieldConfig = {
  id: keyof RegisterForm;
  label: string;
  type: string;
  placeholder: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const fields: FieldConfig[] = [
    { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
    { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { id: "password", label: "Password", type: "password", placeholder: "Min 6 characters" },
    { id: "phone", label: "Phone (optional)", type: "tel", placeholder: "+977 98XXXXXXXX" },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await registerUser(form);

        toast.success("Account created successfully 🎬");

        router.push("/login");
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Something went wrong";

        toast.error(message);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-87.5 bg-primary/10 blur-3xl rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-75 bg-accent/10 blur-3xl rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >

        <div className="text-center mb-10">

          <h1 className="font-display text-4xl tracking-[0.25em] gold-gradient">
            CINEHIVE
          </h1>

          <p className="text-muted-foreground mt-3 text-sm">
            Join the ultimate movie experience
          </p>
        </div>

        <div className="glass rounded-2xl p-8 backdrop-blur-xl bg-background/60">

          <form onSubmit={handleSubmit} className="space-y-5">

            {fields.map((f) => (
              <div key={f.id} className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </Label>

                <Input
                  type={f.type}
                  value={form[f.id]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [f.id]: e.target.value,
                    }))
                  }
                  placeholder={f.placeholder}
                  required={f.id !== "phone"}
                  className="h-11 bg-background/40 border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                />
              </div>
            ))}

            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="w-full bg-primary text-primary-foreground hover:opacity-90 transition shadow-lg shadow-primary/20"
            >
              {isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}