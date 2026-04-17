"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Star, MessageSquare, Plus, Edit3, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function ReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [allReviews, setAllReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [form, setForm] = useState({ service_id: "", rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchAllReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, services(name, category), profiles(full_name)")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(50);
    setAllReviews(data || []);
    setLoading(false);
  };

  const fetchMyReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, services(name, category)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMyReviews(data || []);
  };

  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("id, name, category")
      .eq("is_active", true)
      .order("name");
    setServices(data || []);
  };

  useEffect(() => {
    fetchAllReviews();
    fetchServices();
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchMyReviews();
    }
  }, [user, authLoading]);

  const openNew = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setEditReview(null);
    setForm({ service_id: "", rating: 5, title: "", comment: "" });
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditReview(r);
    setForm({
      service_id: r.service_id || "",
      rating: r.rating,
      title: r.title || "",
      comment: r.comment || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment?.trim()) {
      addToast("Please write a comment", "error");
      return;
    }
    setSubmitting(true);
    const payload = {
      user_id: user.id,
      service_id: form.service_id || null,
      rating: form.rating,
      title: form.title?.trim() || null,
      comment: form.comment.trim(),
    };
    const { error } = editReview
      ? await supabase.from("reviews").update(payload).eq("id", editReview.id)
      : await supabase.from("reviews").insert(payload);
    setSubmitting(false);
    if (error) {
      addToast("Failed to save review: " + error.message, "error");
      return;
    }
    addToast(editReview ? "Review updated" : "Review posted. Thanks!", "success");
    setShowForm(false);
    fetchMyReviews();
    fetchAllReviews();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    addToast("Review deleted", "info");
    fetchMyReviews();
    fetchAllReviews();
  };

  const reviews = tab === "mine" ? myReviews : allReviews;
  const avg =
    allReviews.length > 0
      ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-500 mt-1">
            <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="h-4 w-4 fill-amber-400" /> {avg}
            </span>{" "}
            &middot; {allReviews.length} review{allReviews.length !== 1 ? "s" : ""}
          </p>
        </div>
        {user && (
          <button onClick={openNew} className="btn-primary">
            <Plus className="h-4 w-4" /> Write a Review
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "all" ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All Reviews ({allReviews.length})
        </button>
        {user && (
          <button
            onClick={() => setTab("mine")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "mine" ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            My Reviews ({myReviews.length})
          </button>
        )}
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={tab === "mine" ? "You haven't reviewed yet" : "No reviews yet"}
          description={tab === "mine" ? "Share your experience after a completed service." : "Be the first to share your experience!"}
          actionLabel={user ? "Write a Review" : "Login to Review"}
          actionHref={user ? undefined : "/auth/login"}
          onAction={user ? openNew : undefined}
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card hover:shadow-lg transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {(tab === "mine" ? user?.email : r.profiles?.full_name || "U")?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {tab === "mine" ? "You" : r.profiles?.full_name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.created_at ? format(new Date(r.created_at), "MMM dd, yyyy") : ""}
                    </p>
                  </div>
                </div>
                {tab === "mine" && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
                {r.services?.name && (
                  <span className="text-xs text-gray-400">&middot; {r.services.name}</span>
                )}
              </div>
              {r.title && <h3 className="font-bold text-gray-900 mb-1">{r.title}</h3>}
              {r.comment && <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editReview ? "Edit Review" : "Write a Review"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service <span className="text-gray-400 font-normal">(optional)</span></label>
            <select
              value={form.service_id}
              onChange={(e) => setForm({ ...form, service_id: e.target.value })}
              className="input"
            >
              <option value="">General review (no specific service)</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  className="p-1"
                  aria-label={`Rate ${n} stars`}
                >
                  <Star className={`h-8 w-8 transition-colors ${n <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (optional)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="Great experience!"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="input"
              rows={4}
              placeholder="Tell others about your experience..."
              maxLength={1000}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {submitting ? "Saving..." : <><CheckCircle className="h-4 w-4" /> {editReview ? "Update" : "Post Review"}</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
