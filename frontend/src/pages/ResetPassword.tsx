import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import aovmaxLogo from "@/assets/aovmax-logo.svg";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via reset link — ready to update
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabel = ["Weak", "Weak", "Medium", "Strong"][strength];
  const strengthColor = ["#EF4444", "#EF4444", "#F59E0B", "#10B981"][strength];
  const strengthWidth = ["33%", "33%", "66%", "100%"][strength];

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Password reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
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

          <h1 className="text-2xl font-semibold text-center mb-6" style={{ color: "#111827" }}>
            Create New Password
          </h1>

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
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                New Password
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

            {password && (
              <div className="mb-4">
                <div className="h-1 rounded-full mb-1" style={{ background: "#E5E7EB" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: strengthWidth, background: strengthColor }}
                  />
                </div>
                <p className="text-xs" style={{ color: strengthColor }}>
                  Password strength: {strengthLabel}
                </p>
                <div className="mt-2 space-y-0.5">
                  <p className="text-xs" style={{ color: password.length >= 8 ? "#10B981" : "#6B7280" }}>
                    {password.length >= 8 ? "✓" : "○"} Minimum 8 characters
                  </p>
                  <p className="text-xs" style={{ color: /[A-Z]/.test(password) ? "#10B981" : "#6B7280" }}>
                    {/[A-Z]/.test(password) ? "✓" : "○"} At least one uppercase letter
                  </p>
                  <p className="text-xs" style={{ color: /[0-9]/.test(password) ? "#10B981" : "#6B7280" }}>
                    {/[0-9]/.test(password) ? "✓" : "○"} At least one number
                  </p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold text-base transition-all disabled:opacity-50"
              style={{ background: "#10B981" }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#059669")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
