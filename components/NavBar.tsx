"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Menu, X } from "lucide-react";

const NavBar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white/10 text-white p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/">
            <span className="font-bold text-md sm:text-xl hover:text-yellow-400 transition-colors">
              PadelAmericano
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <Link href="/tournament-history">
                <span className="hover:text-yellow-400 transition-colors">
                  Tournament History
                </span>
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-green-300">
                  Welcome,{" "}
                  <span className="font-semibold">
                    {user?.username || "User"}
                  </span>
                  !
                </span>
                <button
                  onClick={logout}
                  className="hover:text-yellow-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <span className="hover:text-yellow-400 transition-colors">
                  Login/Register
                </span>
              </Link>
            )}
          </div>
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      <div
        className={`md:hidden ${
          isMenuOpen ? "max-h-64" : "max-h-0"
        } overflow-hidden transition-all duration-100 ease-in-out`}
      >
        <div className="flex flex-col items-center space-y-4 mt-4">
          {isAuthenticated && (
            <Link href="/tournament-history">
              <span className="hover:text-yellow-400 transition-colors">
                Tournament History
              </span>
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span className="text-green-300">{user?.username || "User"}</span>
              <button
                onClick={logout}
                className="hover:text-yellow-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">
              <span className="hover:text-yellow-400 transition-colors">
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
