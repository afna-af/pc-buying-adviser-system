import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cpu, Loader2 } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login, error } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Submit Login
  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    setLoading(true);

    try {
      const ok = await login(email, password);

      if (ok) {
        navigate("/chat");
      }
    } catch (err) {
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 bg-radial-glow">
      <form
        onSubmit={submit}
        className="card-tech rounded-2xl p-10 w-full max-w-md fade-up"
        data-testid="login-form"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center pulse-glow">
            <Cpu className="w-5 h-5 text-black" />
          </div>

          <span className="font-heading font-bold text-2xl">
            RIGS
            <span className="text-neon">.AI</span>
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-3xl font-bold mb-1">Welcome back</h1>

        <p className="text-zinc-400 text-sm mb-8">
          Sign in to save chats and favorites.
        </p>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="label-mono">Email</label>

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="login-email"
              className="bg-black/60 border-white/10 mt-1.5"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="label-mono">Password</label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="login-password"
              className="bg-black/60 border-white/10 mt-1.5"
              placeholder="Enter your password"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-rose-400 text-sm" data-testid="login-error">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="btn-neon w-full h-11"
            disabled={loading}
            data-testid="login-submit"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          No account?{" "}
          <Link to="/signup" className="text-cyan-400 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
