"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://jwtauthdotnet920250211104511.azurewebsites.net/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken;
        // Fetch user profile with the returned token
        const profileResponse = await fetch(
          "https://jwtauthdotnet920250211104511.azurewebsites.net/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          // Update context with the correct user data from the backend
          login(token, profileData);
          router.push("/"); // Redirect to home after login
        } else {
          setError("Failed to load user profile");
          setIsLoading(false);
        }
      } else {
        const data = await response.json();
        setError(data.message || "Invalid username or password");
        setIsLoading(false);
      }
    } catch (error) {
      setError("Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="space-y-4 w-2/3 md:w-1/3">
        <h2 className="text-2xl font-bold text-center text-gray-200">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-center">{error}</div>}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onSwitch}
          >
            Need an account? Register
          </Button>
        </form>
      </div>
    </div>
  );
}
