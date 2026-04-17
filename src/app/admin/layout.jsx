"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  ShoppingCart,
  Package,
  Wrench,
  ArrowLeft,
  Star,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/bookings", icon: Calendar, label: "Bookings" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/services", icon: Wrench, label: "Services" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.push("/");
    }
  }, [user, profile, loading]);

  if (loading || !profile || profile.role !== "admin") return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 text-white flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <h2 className="font-bold text-lg">Admin Panel</h2>
          <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile admin nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40 px-2 py-1.5">
        <div className="flex justify-around">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active ? "text-primary" : "text-gray-500"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 lg:pb-0 pb-16">
        {children}
      </div>
    </div>
  );
}
