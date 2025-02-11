"use client";
import LoginForm from "@/components/auth/LoginForm";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  return <LoginForm onSwitch={() => router.push("/register")} />;
}
