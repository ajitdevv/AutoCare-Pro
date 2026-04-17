"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Calendar, IndianRupee, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

export default function AdminBookingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) {
      router.push("/");
      return;
    }
    if (user && profile?.role === "admin") fetchBookings();
  }, [user, profile, authLoading]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, services(name, category), profiles(full_name, email, phone), vehicles(make, model, year, license_plate)")
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);

    if (status === "completed") {
      const booking = bookings.find((b) => b.id === id);
      if (booking && booking.vehicle_id) {
        await supabase.from("service_history").insert({
          user_id: booking.user_id,
          vehicle_id: booking.vehicle_id,
          booking_id: booking.id,
          service_name: booking.services?.name || "Service",
          cost: booking.total_price,
          service_date: booking.booking_date,
          description: `Completed: ${booking.services?.name}`,
        });
      }
    }

    fetchBookings();
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const getStatusBadge = (status) => {
    const map = {
      pending: "badge-pending",
      confirmed: "badge-confirmed",
      in_progress: "badge-processing",
      completed: "badge-completed",
      cancelled: "badge-cancelled",
    };
    return map[status] || "badge-pending";
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-gray-600 mt-1">View and manage all service bookings</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === s
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? `All (${bookings.length})` : `${s.replace("_", " ")} (${bookings.filter((b) => b.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((booking) => (
          <div key={booking.id} className="card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900">
                    {booking.services?.name || "Service"}
                  </h3>
                  <span className={`badge ${getStatusBadge(booking.status)} capitalize`}>
                    {booking.status?.replace("_", " ")}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Customer:</span>{" "}
                    {booking.profiles?.full_name || booking.profiles?.email}
                    {booking.profiles?.phone && ` (${booking.profiles.phone})`}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {booking.booking_date
                      ? format(new Date(booking.booking_date), "MMM dd, yyyy")
                      : "N/A"}{" "}
                    at {booking.time_slot}
                  </div>
                  <div>
                    <span className="font-medium">Vehicle:</span>{" "}
                    {booking.vehicles
                      ? `${booking.vehicles.year} ${booking.vehicles.make} ${booking.vehicles.model}`
                      : "N/A"}
                  </div>
                </div>
                {booking.notes && (
                  <p className="text-sm text-gray-500 mt-1">
                    Notes: {booking.notes}
                  </p>
                )}
                <div className="flex items-center gap-1 text-primary font-bold mt-2">
                  <IndianRupee className="h-4 w-4" />
                  {booking.total_price?.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <select
                  value={booking.status}
                  onChange={(e) => updateStatus(booking.id, e.target.value)}
                  className="input text-sm w-40"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.replace("_", " ").charAt(0).toUpperCase() + s.replace("_", " ").slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">No bookings found.</div>
      )}
    </div>
  );
}
