"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import EmptyState from "@/components/ui/EmptyState";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  IndianRupee,
  ArrowLeft,
  Package,
  CheckCircle,
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } =
    useCartStore();
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const total = getTotal();

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setOrderLoading(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: total,
        shipping_address: address,
        phone: phone,
        status: "pending",
        payment_method: "cod",
      })
      .select()
      .single();

    if (error || !order) {
      setOrderLoading(false);
      addToast("Failed to place order. Please try again.", "error");
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    await supabase.from("order_items").insert(orderItems);

    for (const item of items) {
      await supabase
        .from("products")
        .update({ stock: item.stock - item.quantity })
        .eq("id", item.id);
    }

    clearCart();
    setOrderLoading(false);
    setOrderSuccess(true);
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="card p-10">
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-500 mb-8">
            Your order has been placed. You can track it from your orders page.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/orders" className="btn-primary">View Orders</Link>
            <Link href="/parts" className="btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 animate-fade-in">
        <EmptyState
          icon={ShoppingCart}
          title="Your Cart is Empty"
          description="Browse our parts store to find what you need."
          actionLabel="Browse Parts"
          actionHref="/parts"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/parts" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              {/* Product Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-1.5">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full items-center justify-center ${item.image_url ? "hidden" : "flex"}`}
                >
                  <Package className="h-7 w-7 text-gray-300" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                {item.brand && <p className="text-xs text-gray-400">{item.brand}</p>}
                <div className="flex items-center text-primary font-bold text-sm mt-1">
                  <IndianRupee className="h-3 w-3" />
                  {item.price?.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Total & Remove */}
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-gray-900 text-sm flex items-center justify-end">
                  <IndianRupee className="h-3 w-3" />
                  {(item.price * item.quantity).toLocaleString("en-IN")}
                </div>
                <button
                  onClick={() => {
                    removeItem(item.id);
                    addToast(`${item.name} removed from cart`, "info");
                  }}
                  className="text-red-400 hover:text-red-600 mt-1.5 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-semibold flex items-center">
                  <IndianRupee className="h-3 w-3" />{total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-lg font-extrabold">
                <span>Total</span>
                <span className="text-primary flex items-center">
                  <IndianRupee className="h-4 w-4" />{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {!showCheckout ? (
              <button
                onClick={() => {
                  if (!user) { router.push("/auth/login"); return; }
                  setShowCheckout(true);
                }}
                className="btn-primary w-full mt-6 py-3"
              >
                Proceed to Checkout
              </button>
            ) : (
              <form onSubmit={handleCheckout} className="mt-6 space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Shipping Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Enter your full delivery address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  Payment: Cash on Delivery (COD)
                </div>
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="btn-success w-full py-3 disabled:opacity-50"
                >
                  {orderLoading ? "Placing Order..." : "Place Order"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
