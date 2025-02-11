"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

const NavBar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white/10 text-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <Link href="/">
            <span className="font-bold text-base md:text-xl hover:text-yellow-400">
              PadelAmericano
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-sm md:text-base">
          {isAuthenticated && (
            <Link href="/tournament-history">
              <span className="hover:text-yellow-400">Tournament History</span>
            </Link>
          )}
          {isAuthenticated ? (
            <span
              onClick={logout}
              className="hover:text-yellow-400 cursor-pointer"
            >
              Logout
            </span>
          ) : (
            <Link href="/login">
              <span className="hover:text-yellow-400 cursor-pointer">
                Login/Register
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
