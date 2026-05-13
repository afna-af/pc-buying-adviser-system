import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Cpu,
  MessageSquare,
  Layers,
  GitCompareArrows,
  User,
  LogOut,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

const links = [
  {
    to: "/chat",
    label: "Chat",
    icon: MessageSquare,
  },
  {
    to: "/catalog",
    label: "Catalog",
    icon: Layers,
  },
  {
    to: "/compare",
    label: "Compare",
    icon: GitCompareArrows,
  },
];

export default function Navbar() {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;

  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) {
      logout();
    }

    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
          data-testid="brand-logo"
        >
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-gradient-to-br from-cyan-400 to-cyan-600 pulse-glow">
            <Cpu className="w-4 h-4 text-black" />
          </div>

          <span className="font-heading font-bold text-xl tracking-tight">
            RIGS<span className="text-neon">.AI</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                    isActive
                      ? "text-cyan-400 bg-cyan-400/10 border border-cyan-400/30"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                data-testid="profile-btn"
                className="text-zinc-300 hover:text-cyan-400"
              >
                <User className="w-4 h-4 mr-2" />
                {user.name || user.email}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="logout-btn"
                className="text-zinc-400 hover:text-rose-400"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                data-testid="login-btn"
                className="text-zinc-300 hover:text-cyan-400"
              >
                Sign In
              </Button>

              <Button
                size="sm"
                onClick={() => navigate("/signup")}
                data-testid="signup-btn"
                className="btn-neon"
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
