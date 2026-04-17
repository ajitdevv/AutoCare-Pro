"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Package, IndianRupee, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

const STATUS_BADGE = { pending: "badge-pending", processing: "badge-processing", shipped: "badge-shipped", delivered: "badge-delivered", cancelled: "badge-cancelled" };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (user) fetchOrders();
  }, [user, authLoading]);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (authLoading || loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="skeleton h-9 w-48 mb-2" /><div className="skeleton h-5 w-72 mb-8" />
      <ListSkeleton rows={4} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      {orders.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === s ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {s === "all" ? `All (${orders.length})` : `${s} (${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No Orders Yet" description="Browse our parts store to place your first order." actionLabel="Browse Parts" actionHref="/parts" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No orders with this status.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="card hover:shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                    <span className={`badge ${STATUS_BADGE[order.status]} capitalize`}>{order.status}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(order.created_at), "MMM dd, yyyy")}</span>
                    <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{order.order_items?.length} items</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary flex items-center"><IndianRupee className="h-4 w-4" />{order.total_amount?.toLocaleString("en-IN")}</span>
                  {expandedOrder === order.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
              </div>
              {expandedOrder === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-down">
                  <div className="space-y-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <div><span className="font-medium text-gray-900">{item.product_name}</span><span className="text-gray-400 ml-2">x{item.quantity}</span></div>
                        <span className="font-medium flex items-center"><IndianRupee className="h-3 w-3" />{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                  {order.shipping_address && <div className="mt-3 text-sm text-gray-500"><strong>Shipping:</strong> {order.shipping_address}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
