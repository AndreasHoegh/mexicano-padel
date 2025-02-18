"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthFormsProps = {
  defaultView?: "login" | "register";
};

export default function AuthForms({ defaultView = "login" }: AuthFormsProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(defaultView === "login");
  const [authMessage, setAuthMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSwitchView = () => {
    setIsLogin(!isLogin);
    setAuthMessage(null);
    router.push(`/auth?view=${!isLogin ? "login" : "register"}`, {
      scroll: false,
    });
  };

  const handleRegisterSuccess = () => {
    setAuthMessage({
      type: "success",
      message: "Registration successful! Please log in with your new account.",
    });
    setIsLogin(true);
    router.push("/auth?view=login", { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 to-green-900">
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 w-2/3 md:w-1/3 bg-white/5 p-8 rounded-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-center text-gray-100 mb-6">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>

          {authMessage && (
            <div
              className={`p-4 rounded-md text-center ${
                authMessage.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {authMessage.message}
            </div>
          )}

          {isLogin ? (
            <LoginForm
              onSwitch={handleSwitchView}
              onError={(message) => setAuthMessage({ type: "error", message })}
            />
          ) : (
            <RegisterForm
              onSwitch={handleSwitchView}
              onSuccess={handleRegisterSuccess}
              onError={(message) => setAuthMessage({ type: "error", message })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
