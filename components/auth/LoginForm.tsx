"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if the query is defined and has a success parameter
    const { success } = router.query || {};
    if (success) {
      setSuccessMessage(success);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
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
          setSuccessMessage(`Welcome, ${profileData.username}!`);
          router.push("/");
        } else {
          setError("Failed to load user profile");
        }
      } else {
        const data = await response.json();
        setError(data.message || "Invalid username or password");
      }
    } catch (error) {
      setError("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="space-y-4 w-2/3 md:w-1/3">
        <h2 className="text-2xl font-bold text-center text-gray-200">Login</h2>
        {successMessage && (
          <div className="text-green-500 text-center">{successMessage}</div>
        )}
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
