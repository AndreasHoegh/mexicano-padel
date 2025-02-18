"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onSwitch: () => void;
  onError: (message: string) => void;
}

export default function LoginForm({ onSwitch, onError }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          login(token, profileData);
          router.push("/");
        } else {
          onError("Failed to load user profile");
        }
      } else {
        const data = await response.json();
        onError(data.message || "Invalid username or password");
      }
    } catch (error) {
      onError("Login failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-3 border border-gray-300 rounded-md bg-white/10 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-md bg-white/10 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitch}
          className="text-gray-300 hover:text-white text-sm"
        >
          Don&apos;t have an account? Sign up
        </button>
      </div>
    </form>
  );
}
