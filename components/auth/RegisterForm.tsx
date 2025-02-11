"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Sending registration request:", { username, password });

      const response = await fetch(
        "https://jwtauthdotnet920250211104511.azurewebsites.net/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      console.log("Response status:", response.status);

      // Check if the response is JSON
      const contentType = response.headers.get("Content-Type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log("Registration response:", data);
      } else {
        // Handle non-JSON response (for debugging purposes)
        const text = await response.text();
        console.error("Non-JSON response:", text);
        setError("Unexpected response format");
        return;
      }

      if (response.ok) {
        router.push("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed - " + (error as Error).message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="space-y-4 w- md:w-1/3">
        <h2 className="text-2xl font-bold text-center">Register</h2>
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
          <Button type="submit" className="w-full">
            Register
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onSwitch}
          >
            Already have an account? Login
          </Button>
        </form>
      </div>
    </div>
  );
}
