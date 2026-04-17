"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PageSkeleton } from "@/components/ui/Skeleton";
import {
  Calendar,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  Users,
  ArrowRight,
  Package,
  Wrench,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ totalBookings: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0, pendingBookings: 0, pendingOrders: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role === "admin") fetchAdminData();
  }, [user, profile, authLoading]);

  const fetchAdminData = async () => {
    const [bookingsRes, ordersRes, usersRes, pendingBookingsRes, pendingOrdersRes] = await Promise.all([
      supabase.from("bookings").select("*", { count: "exact" }),
      supabase.from("orders").select("*"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("*, services(name), profiles(full_name, email)").in("status", ["pending", "confirmed"]).order("created_at", { ascending: false }).limit(10),
      supabase.from("orders").select("*, profiles(full_name, email)").in("status", ["pending", "processing"]).order("created_at", { ascending: false }).limit(10),
    ]);
    const totalRevenue = (ordersRes.data || []).reduce((s, o) => s + (o.total_amount || 0), 0);
    const bookingRevenue = (bookingsRes.data || []).reduce((s, b) => s + (b.total_price || 0), 0);
    setStats({
      totalBookings: bookingsRes.count || 0,
      totalOrders: ordersRes.data?.length || 0,
      totalRevenue: totalRevenue + bookingRevenue,
      totalUsers: usersRes.count || 0,
      pendingBookings: pendingBookingsRes.data?.length || 0,
      pendingOrders: pendingOrdersRes.data?.length || 0,
    });
    setRecentBookings(pendingBookingsRes.data || []);
    setRecentOrders(pendingOrdersRes.data || []);
    setLoading(false);
  };

  if (authLoading || loading) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your AutoCare Pro platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="h-8 w-8 text-blue-500" />
            {stats.pendingBookings > 0 && <span className="badge badge-pending text-xs">{stats.pendingBookings} pending</span>}
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.totalBookings}</div>
          <div className="text-sm text-gray-500">Total Bookings</div>
        </div>
        <div className="card group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <ShoppingCart className="h-8 w-8 text-amber-500" />
            {stats.pendingOrders > 0 && <span className="badge badge-pending text-xs">{stats.pendingOrders} pending</span>}
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.totalOrders}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
        <div className="card group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <IndianRupee className="h-8 w-8 text-green-500" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            <span className="text-base font-bold text-gray-400">Rs.</span> {stats.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
        <div className="card group hover:shadow-lg transition-all">
          <Users className="h-8 w-8 text-purple-500 mb-3" />
          <div className="text-2xl font-extrabold text-gray-900">{stats.totalUsers}</div>
          <div className="text-sm text-gray-500">Registered Users</div>
        </div>
      </div>

      {/* Pending Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Pending Bookings</h2>
            <Link href="/admin/bookings" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">No pending bookings</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{b.services?.name || "Service"}</div>
                    <div className="text-xs text-gray-500">{b.profiles?.full_name} &middot; {b.booking_date} at {b.time_slot}</div>
                  </div>
                  <span className="badge badge-pending text-xs capitalize">{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Pending Orders</h2>
            <Link href="/admin/orders" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">No pending orders</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Order #{o.id.slice(0, 8)}</div>
                    <div className="text-xs text-gray-500">{o.profiles?.full_name} &middot; Rs. {o.total_amount?.toLocaleString("en-IN")}</div>
                  </div>
                  <span className="badge badge-pending text-xs capitalize">{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
