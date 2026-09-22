import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import aovmaxLogo from "@/assets/aovmax-logo.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(isAdmin ? "/admin/dashboard" : "/billing", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Navigation will happen via the useEffect above when auth state updates
  };

  // Don't render login form if already authenticated
  if (!authLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F9FAFB" }}>
        <p style={{ color: "#6B7280" }}>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F9FAFB" }}>
      <div className="w-full max-w-[400px] mx-4">
        <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex justify-center mb-6">
            <div className="bg-[#0A0A0A] rounded-lg px-4 py-2">
              <img src={aovmaxLogo} alt="AOVMAX" className="h-16" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center mb-6" style={{ color: "#111827" }}>
            Sign In to Your Account
          </h1>

          {error && (
            <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                style={{ borderColor: "#E5E7EB", color: "#111827" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#10B981";
                  e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                style={{ borderColor: "#E5E7EB", color: "#111827" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#10B981";
                  e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="text-right mb-4">
              <Link to="/forgot-password" className="text-sm hover:underline" style={{ color: "#10B981" }}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold text-base transition-all disabled:opacity-50"
              style={{ background: "#10B981" }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#059669")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
