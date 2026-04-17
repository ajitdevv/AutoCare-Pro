"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  Package,
  IndianRupee,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) {
      router.push("/");
      return;
    }
    if (user && profile?.role === "admin") fetchOrders();
  }, [user, profile, authLoading]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*), profiles(full_name, email, phone)")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    fetchOrders();
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const getStatusBadge = (status) => {
    const map = {
      pending: "badge-pending",
      processing: "badge-processing",
      shipped: "badge-shipped",
      delivered: "badge-delivered",
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-600 mt-1">View and manage all parts orders</p>
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
            {s === "all" ? `All (${orders.length})` : `${s} (${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((order) => (
          <div key={order.id} className="card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div
                className="flex-1 cursor-pointer"
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
              >
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900">
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <span className={`badge ${getStatusBadge(order.status)} capitalize`}>
                    {order.status}
                  </span>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Customer:</span>{" "}
                  {order.profiles?.full_name || order.profiles?.email}
                  {order.profiles?.phone && ` (${order.profiles.phone})`}
                  &middot;{" "}
                  {format(new Date(order.created_at), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center gap-1 text-primary font-bold mt-1">
                  <IndianRupee className="h-4 w-4" />
                  {order.total_amount?.toLocaleString("en-IN")}
                  <span className="text-gray-400 text-xs font-normal ml-2">
                    ({order.order_items?.length} items)
                  </span>
                </div>
              </div>
              <div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="input text-sm w-40"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {expandedOrder === order.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product_name}{" "}
                        <span className="text-gray-400">x{item.quantity}</span>
                      </span>
                      <span className="font-medium flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
                {order.shipping_address && (
                  <div className="mt-3 text-sm text-gray-500">
                    <strong>Ship to:</strong> {order.shipping_address}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">No orders found.</div>
      )}
    </div>
  );
}
