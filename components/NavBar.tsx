import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Menu } from "lucide-react";

const NavBar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white/10 text-white p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <span className="font-bold text-base md:text-xl hover:text-yellow-400">
              PadelAmericano
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <Link href="/tournament-history">
                <span className="hover:text-yellow-400">
                  Tournament History
                </span>
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <span className="text-green-300">
                  Welcome,{" "}
                  <span className="font-semibold">
                    {user?.username || "User"}
                  </span>
                  !
                </span>
                <button
                  onClick={logout}
                  className="hover:text-yellow-400 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                <span className="hover:text-yellow-400 cursor-pointer">
                  Login/Register
                </span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-3">
            {isAuthenticated && (
              <Link href="/tournament-history">
                <span className="block py-2 hover:text-yellow-400">
                  Tournament History
                </span>
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <div className="py-2 text-green-300">
                  Welcome,{" "}
                  <span className="font-semibold">
                    {user?.username || "User"}
                  </span>
                  !
                </div>
                <button
                  onClick={logout}
                  className="block w-full text-left py-2 hover:text-yellow-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                <span className="block py-2 hover:text-yellow-400">
                  Login/Register
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
