"use client";

import AuthForms from "@/components/auth/AuthForms";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  return <AuthForms defaultView={view === "register" ? "register" : "login"} />;
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
