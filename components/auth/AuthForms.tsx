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
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      {isLogin ? (
        <LoginForm onSwitch={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitch={() => setIsLogin(true)} />
      )}
    </div>
  );
}
