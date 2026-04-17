"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { User, Mail, Phone, MapPin, Save, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, loading: authLoading, fetchProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile, authLoading, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    await fetchProfile(user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (authLoading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile?.full_name || "User"}
            </h2>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>
            <span className="badge badge-confirmed capitalize text-xs mt-1">
              {profile?.role || "customer"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="input pl-10"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={user?.email || ""}
                className="input pl-10 bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input pl-10"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input pl-10"
                rows={3}
                placeholder="Your address"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              saved
                ? "bg-green-500 text-white"
                : "btn-primary disabled:opacity-50"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Saved Successfully
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
