"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PageSkeleton } from "@/components/ui/Skeleton";
import {
  Car,
  Calendar,
  Package,
  History,
  Wrench,
  ArrowRight,
  IndianRupee,
  Plus,
  CheckCircle,
  Circle,
} from "lucide-react";
import { format } from "date-fns";

const STAT_STYLES = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600" },
  green: { bg: "bg-green-50", icon: "text-green-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600" },
};

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ vehicles: 0, bookings: 0, orders: 0, serviceHistory: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (user) fetchDashboardData();
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    const [vehiclesRes, bookingsRes, ordersRes, historyRes] = await Promise.all([
      supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("bookings").select("*, services(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("service_history").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setStats({
      vehicles: vehiclesRes.count || 0,
      bookings: bookingsRes.data?.length || 0,
      orders: ordersRes.data?.length || 0,
      serviceHistory: historyRes.count || 0,
    });
    setRecentBookings(bookingsRes.data || []);
    setRecentOrders(ordersRes.data || []);
    setLoading(false);
  };

  if (authLoading || loading) return <PageSkeleton />;

  const showOnboarding = stats.vehicles === 0 || stats.bookings === 0;

  const statCards = [
    { label: "Vehicles", value: stats.vehicles, icon: Car, color: "blue", href: "/vehicles" },
    { label: "Bookings", value: stats.bookings, icon: Calendar, color: "green", href: "/bookings" },
    { label: "Orders", value: stats.orders, icon: Package, color: "amber", href: "/orders" },
    { label: "Service Records", value: stats.serviceHistory, icon: History, color: "purple", href: "/vehicles" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Welcome back, {profile?.full_name || "User"}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your vehicle care overview</p>
      </div>

      {/* Onboarding */}
      {showOnboarding && (
        <div className="card mb-8 bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Get Started with AutoCare Pro</h3>
              <p className="text-sm text-gray-500 mb-4">Complete these steps to make the most of your account:</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  {stats.vehicles > 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  <Link href="/vehicles" className={`text-sm font-medium ${stats.vehicles > 0 ? "text-gray-400 line-through" : "text-primary hover:underline"}`}>
                    Add your first vehicle
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  {stats.bookings > 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  <Link href="/services" className={`text-sm font-medium ${stats.bookings > 0 ? "text-gray-400 line-through" : "text-primary hover:underline"}`}>
                    Book your first service
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <Circle className="h-5 w-5 text-gray-300" />
                  <Link href="/parts" className="text-sm font-medium text-primary hover:underline">
                    Browse auto parts store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const style = STAT_STYLES[stat.color];
          return (
            <Link key={stat.label} href={stat.href} className="card group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-11 h-11 ${style.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-5 w-5 ${style.icon}`} />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
            <Link href="/bookings" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm mb-3">No bookings yet</p>
              <Link href="/services" className="btn-primary text-xs py-2 px-4">Book a Service</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{b.services?.name || "Service"}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {b.booking_date ? format(new Date(b.booking_date), "MMM dd, yyyy") : "N/A"} at {b.time_slot}
                    </div>
                  </div>
                  <span className={`badge badge-${b.status === "completed" ? "completed" : b.status === "cancelled" ? "cancelled" : "pending"} text-xs capitalize`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link href="/orders" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm mb-3">No orders yet</p>
              <Link href="/parts" className="btn-primary text-xs py-2 px-4">Browse Parts</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 4).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Order #{o.id.slice(0, 8)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{format(new Date(o.created_at), "MMM dd, yyyy")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-primary flex items-center">
                      <IndianRupee className="h-3 w-3" />{o.total_amount?.toLocaleString("en-IN")}
                    </div>
                    <span className={`badge badge-${o.status === "delivered" ? "delivered" : o.status === "cancelled" ? "cancelled" : "pending"} text-xs capitalize mt-0.5`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/services", icon: Wrench, label: "Book Service", color: "text-primary", bg: "bg-blue-50" },
            { href: "/parts", icon: Package, label: "Buy Parts", color: "text-amber-600", bg: "bg-amber-50" },
            { href: "/vehicles", icon: Car, label: "My Vehicles", color: "text-green-600", bg: "bg-green-50" },
            { href: "/bookings", icon: Calendar, label: "My Bookings", color: "text-purple-600", bg: "bg-purple-50" },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="card text-center group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5">
              <div className={`w-12 h-12 ${a.bg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <a.icon className={`h-6 w-6 ${a.color}`} />
              </div>
              <span className="text-sm font-semibold text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
