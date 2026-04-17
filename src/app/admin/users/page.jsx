"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import {
  ArrowLeft,
  Shield,
  User,
  Wrench,
  Plus,
  Trash2,
  Search,
  Mail,
  Lock,
  UserPlus,
} from "lucide-react";

const ROLES = ["admin", "technician", "customer"];
const ROLE_BADGE = {
  admin: "badge-confirmed",
  technician: "badge-processing",
  customer: "badge-completed",
};

export default function AdminUsersPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "admin",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("role")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) {
      router.push("/");
      return;
    }
    if (user && profile?.role === "admin") fetchUsers();
  }, [user, profile, authLoading]);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error || "Failed to create user", "error");
        setSubmitting(false);
        return;
      }
      addToast(`${form.role === "admin" ? "Admin" : "User"} created successfully`, "success");
      setShowForm(false);
      setForm({ email: "", password: "", full_name: "", role: "admin" });
      fetchUsers();
    } catch (err) {
      addToast(err.message, "error");
    }
    setSubmitting(false);
  };

  const handleRoleChange = async (u, newRole) => {
    if (u.id === user.id) {
      addToast("You cannot change your own role", "error");
      return;
    }
    const token = await getToken();
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: u.id, role: newRole }),
    });
    const json = await res.json();
    if (!res.ok) {
      addToast(json.error || "Failed to update role", "error");
      return;
    }
    addToast("Role updated", "success");
    fetchUsers();
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete ${u.email} permanently? This cannot be undone.`)) return;
    const token = await getToken();
    const res = await fetch(`/api/admin/users?user_id=${u.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) {
      addToast(json.error || "Failed to delete user", "error");
      return;
    }
    addToast("User deleted", "info");
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    technician: users.filter((u) => u.role === "technician").length,
    customer: users.filter((u) => u.role === "customer").length,
  };

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-600 mt-1">{counts.all} users total &middot; {counts.admin} admin(s)</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <UserPlus className="h-4 w-4" /> Create New Admin
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...ROLES].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                roleFilter === r
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r} ({counts[r] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No users found.</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => {
                  const isSelf = u.id === user.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">
                              {(u.full_name || u.email)?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {u.full_name || "Unnamed"}
                              {isSelf && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${ROLE_BADGE[u.role] || "badge-pending"} capitalize`}>
                          {u.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                          {u.role === "technician" && <Wrench className="h-3 w-3 mr-1" />}
                          {u.role === "customer" && <User className="h-3 w-3 mr-1" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            disabled={isSelf}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r} className="capitalize">
                                {r}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={isSelf}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Create New User"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input pl-10"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pl-10"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Share this password with the new user.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input capitalize"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
              {submitting ? "Creating..." : <><Plus className="h-4 w-4" /> Create</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
