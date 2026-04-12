"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const params = useSearchParams();

  const callbackUrl = params.get("callbackUrl") || "/";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  startTransition(async () => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid credentials. Please check your email and password.");
      return;
    }

    toast.success("Login successful!");
    router.push(callbackUrl);
    router.refresh();
  });
};

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
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
            Sign in to book your seats
          </p>
        </div>

        <div className="glass rounded-2xl p-8 backdrop-blur-xl bg-background/60">

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full flex items-center cursor-pointer gap-2 mb-5 hover:bg-muted/50 transition"
          >
            <GoogleIcon className="" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-xs text-muted-foreground">
              OR
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>

              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 bg-background/40 border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>

              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 bg-background/40 border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="w-full bg-primary text-primary-foreground hover:opacity-90 transition shadow-lg shadow-primary/20 cursor-pointer"
            >
              {isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}