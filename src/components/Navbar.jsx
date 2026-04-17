"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useCartStore } from "@/store/cartStore";
import {
  Car,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Wrench,
  Package,
  History,
  Shield,
  ChevronDown,
  Star,
} from "lucide-react";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const itemCount = useCartStore((s) => s.getItemCount());
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const pathname = usePathname();
  const isAdmin = profile?.role === "admin";

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const isActive = (href) => pathname === href;

  const navLink = (href, icon, label) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive(href)
          ? "bg-primary/10 text-primary"
          : "text-gray-600 hover:text-primary hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/70 sticky top-0 z-50 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo-mark.svg"
              alt="AutoCare Pro"
              width={40}
              height={40}
              priority
              className="h-10 w-10 drop-shadow-sm group-hover:drop-shadow-md transition-all group-hover:scale-105"
            />
            <span className="text-lg font-extrabold text-gray-900 hidden sm:block tracking-tight">
              AutoCare <span className="bg-linear-to-r from-primary to-blue-700 bg-clip-text text-transparent">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink("/services", <Wrench className="h-4 w-4" />, "Services")}
            {navLink("/parts", <Package className="h-4 w-4" />, "Parts Store")}
            {navLink("/reviews", <Star className="h-4 w-4" />, "Reviews")}
            {user && (
              <>
                {navLink("/bookings", <History className="h-4 w-4" />, "Bookings")}
                {navLink("/vehicles", <Car className="h-4 w-4" />, "Vehicles")}
              </>
            )}
            {isAdmin &&
              navLink("/admin", <Shield className="h-4 w-4" />, "Admin")}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className={`relative p-2.5 rounded-lg transition-all ${
                isActive("/cart")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 hover:text-primary hover:bg-gray-50"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {profile?.full_name || "User"}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform hidden sm:block ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="h-4 w-4 text-gray-400" />
                      My Orders
                    </Link>
                    <hr className="my-1.5 mx-3 border-gray-100" />
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">
                  Login
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 animate-slide-down">
            <div className="flex flex-col gap-1">
              {navLink("/services", <Wrench className="h-4 w-4" />, "Services")}
              {navLink("/parts", <Package className="h-4 w-4" />, "Parts Store")}
              {navLink("/reviews", <Star className="h-4 w-4" />, "Reviews")}
              {user && (
                <>
                  {navLink("/bookings", <History className="h-4 w-4" />, "My Bookings")}
                  {navLink("/vehicles", <Car className="h-4 w-4" />, "My Vehicles")}
                  {navLink("/orders", <Package className="h-4 w-4" />, "My Orders")}
                  {navLink("/dashboard", <LayoutDashboard className="h-4 w-4" />, "Dashboard")}
                </>
              )}
              {isAdmin &&
                navLink("/admin", <Shield className="h-4 w-4" />, "Admin Panel")}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
