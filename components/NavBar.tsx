// padel-americano/components/NavBar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Menu, X } from "lucide-react";

const NavBar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/10 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <span className="font-bold text-xl hover:text-yellow-400">
              PadelAmericano
            </span>
          </Link>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="focus:outline-none"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/">
            <span className="hover:text-yellow-400">Home</span>
          </Link>
          {isAuthenticated && (
            <Link href="/tournament-history">
              <span className="hover:text-yellow-400">Tournament History</span>
            </Link>
          )}
          {isAuthenticated ? (
            <span
              onClick={logout}
              className="px-4 py-2 hover:text-yellow-400 cursor-pointer"
            >
              Logout
            </span>
          ) : (
            <Link href="/login">
              <span className="px-4 py-2 hover:text-yellow-400 cursor-pointer">
                Login/Register
              </span>
            </Link>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="mt-2 space-y-2 md:hidden">
          <Link href="/">
            <span className="block px-2 hover:text-yellow-400">Home</span>
          </Link>
          {isAuthenticated && (
            <Link href="/tournament-history">
              <span className="block px-2 hover:text-yellow-400">
                Tournament History
              </span>
            </Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="block w-full text-left px-2 py-1 bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <Link href="/login">
              <button className="block w-full text-left px-2 py-1 bg-green-600 rounded hover:bg-green-700">
                Login/Register
              </button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
