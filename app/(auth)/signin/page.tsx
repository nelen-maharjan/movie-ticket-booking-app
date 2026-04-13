import SigninContent from "@/components/client/SigninContent";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SigninContent />
    </Suspense>
  );
}