"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthFormsProps = {
  defaultView?: "login" | "register";
};

export default function AuthForms({ defaultView = "login" }: AuthFormsProps) {
  const [isLogin, setIsLogin] = useState(defaultView === "login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 to-green-900">
      {isLogin ? (
        <LoginForm onSwitch={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitch={() => setIsLogin(true)} />
      )}
    </div>
  );
}
