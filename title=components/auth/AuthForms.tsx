/* import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthForms({ defaultView = "login" }: AuthFormsProps) {
  const [isLogin, setIsLogin] = useState(defaultView === "login");
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(
    null
  );

  // Called when the user clicks "Need an account? Register" from the login form.
  const handleSwitchToRegister = () => {
    setIsLogin(false);
    setRegistrationSuccess(null);
  };

  // Called when the user manually clicks "Already have an account? Login" from the register form.
  const handleSwitchToLogin = () => {
    setIsLogin(true);
    // Do not clear registrationSuccess here; if registration was successful, we want it to show.
  };

  // Called only when registration is successful.
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
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onSwitch={handleSwitchToLogin}
        />
      )}
    </div>
  );
}
 */
