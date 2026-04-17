"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Shield, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchProfile } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Step 1: Sign in directly via supabase (not useAuth) to get user id
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        const msg = signInError.message.toLowerCase();
        if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
          setError("Invalid email or password.");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: Check if this user is an admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        // Not admin — sign out immediately
        await supabase.auth.signOut();
        setError("Access denied. This login is for administrators only.");
        setLoading(false);
        return;
      }

      // Step 3: User is admin — refresh profile in auth context and redirect
      await fetchProfile(userId);
      router.push("/admin");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 mt-1">Authorized personnel only</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg p-3 mb-6 text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 px-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="admin@autocarepro.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 px-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Not an admin? Go to User Login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          This area is restricted to authorized administrators.
          <br />
          Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
