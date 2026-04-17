"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Mail, Lock, User, Phone, UserPlus } from "lucide-react";

// Convert raw Supabase errors to user-friendly messages
function friendlyError(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes("email logins are disabled"))
    return "Signup is temporarily unavailable. Please contact support.";
  if (lower.includes("rate limit"))
    return "Too many attempts. Please wait a moment and try again.";
  if (lower.includes("already registered") || lower.includes("already been registered"))
    return "This email is already registered. Please login instead.";
  if (lower.includes("invalid login"))
    return "Invalid email or password.";
  if (lower.includes("password") && lower.includes("least"))
    return "Password must be at least 6 characters.";
  return msg;
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, fullName, phone);
      router.push("/dashboard");
    } catch (err) {
      const msg = err.message || "Something went wrong";
      const lower = msg.toLowerCase();

      // If rate limit or email issue, user may already be created — try login
      if (lower.includes("rate limit") || lower.includes("email")) {
        try {
          await signIn(email, password);
          router.push("/dashboard");
          return;
        } catch {
          // Login also failed — show friendly error
        }
      }

      // If user already exists, redirect to login
      if (lower.includes("already registered") || lower.includes("already been registered")) {
        try {
          await signIn(email, password);
          router.push("/dashboard");
          return;
        } catch {
          setError("This email is already registered. Please go to login.");
          return;
        }
      }

      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-1">Join AutoCare Pro today</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input pl-10"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
