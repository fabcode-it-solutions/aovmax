import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import aovmaxLogo from "@/assets/aovmax-logo.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess("Reset link sent! Check your email.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F9FAFB" }}>
      <div className="w-full max-w-[400px] mx-4">
        <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex justify-center mb-6">
            <div className="bg-[#0A0A0A] rounded-lg px-4 py-2">
              <img src={aovmaxLogo} alt="AOVMAX" className="h-16" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: "#111827" }}>
            Reset Your Password
          </h1>
          <p className="text-sm text-center mb-6 leading-relaxed" style={{ color: "#6B7280" }}>
            Enter your email address and we'll send you a reset link.
          </p>

          {error && (
            <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: "#D1FAE5", color: "#065F46" }}>
              {success}
            </div>
          )}

          <form onSubmit={handleReset}>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold text-base transition-all disabled:opacity-50"
              style={{ background: "#10B981" }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#059669")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <Link to="/login" className="block text-center text-sm mt-4 hover:underline" style={{ color: "#10B981" }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
