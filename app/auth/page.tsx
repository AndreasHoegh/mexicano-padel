"use client";

import AuthForms from "@/components/auth/AuthForms";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  return <AuthForms defaultView={view === "register" ? "register" : "login"} />;
}
