"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthFormsProps = {
  defaultView?: "login" | "register";
};

export default function AuthForms({ defaultView = "login" }: AuthFormsProps) {
  const [isLogin, setIsLogin] = useState(defaultView === "login");
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(
    null
  );

  const handleSwitchToRegister = () => {
    setIsLogin(false);
    setRegistrationSuccess(null);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setRegistrationSuccess(null);
  };

  const handleRegisterSuccess = () => {
    setRegistrationSuccess("Registration successful! You can now log in.");
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 to-green-900">
      {isLogin ? (
        <LoginForm
          onSwitch={handleSwitchToRegister}
          registrationSuccess={registrationSuccess}
        />
      ) : (
        <RegisterForm onSwitch={handleRegisterSuccess} />
      )}
    </div>
  );
}
