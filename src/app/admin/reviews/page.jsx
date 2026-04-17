"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Star, Trash2, CheckCircle, XCircle, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminReviewsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, services(name, category), profiles(full_name, email)")
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) {
      router.push("/");
      return;
    }
    if (user && profile?.role === "admin") fetchReviews();
  }, [user, profile, authLoading]);

  const toggleApproval = async (r) => {
    await supabase.from("reviews").update({ is_approved: !r.is_approved }).eq("id", r.id);
    fetchReviews();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    fetchReviews();
  };

  const filtered = reviews.filter((r) => {
    const matchFilter =
      filter === "all" ||
      (filter === "approved" && r.is_approved) ||
      (filter === "hidden" && !r.is_approved);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.title?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.services?.name?.toLowerCase().includes(q) ||
      r.profiles?.full_name?.toLowerCase().includes(q) ||
      r.profiles?.email?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.is_approved).length,
    hidden: reviews.filter((r) => !r.is_approved).length,
    avg:
      reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0",
  };

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Reviews</h1>
          <p className="text-gray-600 mt-1">Approve, hide, or delete customer reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-2xl font-extrabold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Reviews</div>
        </div>
        <div className="card">
          <div className="text-2xl font-extrabold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="card">
          <div className="text-2xl font-extrabold text-red-500">{stats.hidden}</div>
          <div className="text-sm text-gray-500">Hidden</div>
        </div>
        <div className="card">
          <div className="text-2xl font-extrabold text-amber-500 flex items-center gap-1">
            <Star className="h-5 w-5 fill-amber-400" />
            {stats.avg}
          </div>
          <div className="text-sm text-gray-500">Average Rating</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews, users, services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "approved", "hidden"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No reviews found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <span className={`badge ${r.is_approved ? "badge-completed" : "badge-cancelled"} text-xs`}>
                      {r.is_approved ? "Approved" : "Hidden"}
                    </span>
                    {r.services?.name && (
                      <span className="text-xs text-gray-500">&middot; {r.services.name}</span>
                    )}
                  </div>
                  {r.title && <h3 className="font-bold text-gray-900 mb-1">{r.title}</h3>}
                  {r.comment && <p className="text-gray-600 text-sm leading-relaxed mb-2">{r.comment}</p>}
                  <div className="text-xs text-gray-400">
                    By {r.profiles?.full_name || "Anonymous"} ({r.profiles?.email || "—"}) &middot;{" "}
                    {r.created_at ? format(new Date(r.created_at), "MMM dd, yyyy") : ""}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleApproval(r)}
                    className={r.is_approved ? "btn-secondary text-sm" : "btn-success text-sm"}
                  >
                    {r.is_approved ? (
                      <><XCircle className="h-4 w-4" /> Hide</>
                    ) : (
                      <><CheckCircle className="h-4 w-4" /> Approve</>
                    )}
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="btn-danger text-sm">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
