"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Calendar, Clock, Car, IndianRupee, XCircle, Wrench } from "lucide-react";
import { format } from "date-fns";

const STATUS_BADGE = { pending: "badge-pending", confirmed: "badge-confirmed", in_progress: "badge-processing", completed: "badge-completed", cancelled: "badge-cancelled" };

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (user) fetchBookings();
  }, [user, authLoading]);

  const fetchBookings = async () => {
    const { data } = await supabase.from("bookings").select("*, services(name, category), vehicles(make, model, year, license_plate)").eq("user_id", user.id).order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  const cancelBooking = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    addToast("Booking cancelled", "info");
    fetchBookings();
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (authLoading || loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="skeleton h-9 w-48 mb-2" /><div className="skeleton h-5 w-72 mb-8" />
      <ListSkeleton rows={4} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1">{bookings.length} total booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>
        <a href="/services" className="btn-primary"><Wrench className="h-4 w-4" /> Book New</a>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === s ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {s === "all" ? `All (${bookings.length})` : `${s.replace("_", " ")} (${bookings.filter((b) => b.status === s).length})`}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <EmptyState icon={Calendar} title="No Bookings Yet" description="Book your first car service to get started." actionLabel="Browse Services" actionHref="/services" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No bookings with this status.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="card hover:shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{b.services?.name || "Service"}</h3>
                    <span className={`badge ${STATUS_BADGE[b.status]} capitalize`}>{b.status?.replace("_", " ")}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{b.booking_date ? format(new Date(b.booking_date), "MMM dd, yyyy") : "N/A"}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{b.time_slot}</span>
                    {b.vehicles && <span className="flex items-center gap-1"><Car className="h-4 w-4" />{b.vehicles.year} {b.vehicles.make} {b.vehicles.model}</span>}
                    <span className="flex items-center gap-1 text-primary font-semibold"><IndianRupee className="h-4 w-4" />{b.total_price?.toLocaleString("en-IN")}</span>
                  </div>
                  {b.notes && <p className="text-sm text-gray-400 mt-2 italic">Note: {b.notes}</p>}
                </div>
                {(b.status === "pending" || b.status === "confirmed") && (
                  <button onClick={() => cancelBooking(b.id)} className="btn-danger text-sm flex-shrink-0">
                    <XCircle className="h-4 w-4" /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
