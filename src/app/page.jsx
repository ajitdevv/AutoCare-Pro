"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  Car,
  Wrench,
  Package,
  History,
  Clock,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Sparkles,
  ChevronRight,
  Phone,
  Zap,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 rounded-full text-primary-light text-sm font-medium mb-6 border border-primary/30">
                <Sparkles className="h-4 w-4" />
                Trusted by 10,000+ car owners
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Your Car Deserves
                <br />
                the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Best Care</span>
              </h1>
              <p className="text-lg text-blue-200/80 mb-8 leading-relaxed max-w-lg">
                Book car servicing, buy genuine auto parts, and track your
                complete vehicle maintenance history — all in one platform.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  href={user ? "/services" : "/auth/signup"}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/40 flex items-center gap-2 text-base"
                >
                  {user ? "Book a Service" : "Get Started Free"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/parts"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 text-base backdrop-blur-sm"
                >
                  Browse Parts
                  <Package className="h-5 w-5" />
                </Link>
              </div>
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-blue-300/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-400" />
                  Verified workshops
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-green-400" />
                  Instant booking
                </span>
              </div>
            </div>
            {/* Hero Visual */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-primary/30 to-blue-500/20 rounded-3xl rotate-6 border border-white/10" />
                <div className="absolute inset-0 w-80 h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl -rotate-3 border border-white/10 flex flex-col items-center justify-center backdrop-blur-sm p-8">
                  <Car className="h-20 w-20 text-white/80 mb-4" />
                  <div className="text-white/90 text-center">
                    <p className="text-3xl font-bold">500+</p>
                    <p className="text-blue-200/70 text-sm">Services completed this month</p>
                  </div>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-blue-200/60 text-xs mt-1">4.8 average rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wide">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Everything You Need for Your Vehicle
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From routine maintenance to quality spare parts — we make car care simple, reliable, and affordable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wrench, color: "blue", title: "Service Booking", desc: "Schedule appointments with trusted workshops. Choose service types and convenient time slots." },
              { icon: Package, color: "amber", title: "Auto Parts Store", desc: "Browse and purchase genuine spare parts, accessories, and essentials for your vehicle." },
              { icon: History, color: "green", title: "Service History", desc: "Track complete service records for all your vehicles. Never miss a maintenance schedule." },
              { icon: Shield, color: "purple", title: "Trusted Workshops", desc: "All partner workshops are verified and rated by real customers for quality assurance." },
            ].map((f) => {
              const colors = {
                blue: { bg: "bg-blue-50", icon: "text-blue-600", hover: "group-hover:bg-blue-600" },
                amber: { bg: "bg-amber-50", icon: "text-amber-600", hover: "group-hover:bg-amber-500" },
                green: { bg: "bg-green-50", icon: "text-green-600", hover: "group-hover:bg-green-600" },
                purple: { bg: "bg-purple-50", icon: "text-purple-600", hover: "group-hover:bg-purple-600" },
              };
              const c = colors[f.color];
              return (
                <div key={f.title} className="card text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 ${c.bg} ${c.hover} rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300`}>
                    <f.icon className={`h-7 w-7 ${c.icon} group-hover:text-white transition-colors`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wide">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-500">Get your vehicle serviced in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            {[
              { step: "1", icon: Car, title: "Add Your Vehicle", desc: "Register your vehicle details for personalized service." },
              { step: "2", icon: Wrench, title: "Choose a Service", desc: "Select from our range of maintenance and repair services." },
              { step: "3", icon: Clock, title: "Pick a Time Slot", desc: "Choose a convenient date and time for your appointment." },
              { step: "4", icon: CheckCircle, title: "Get Serviced", desc: "Drop off your vehicle and we take care of the rest." },
            ].map((item) => (
              <div key={item.step} className="text-center relative z-10">
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-lg shadow-primary/20">
                  <item.icon className="h-7 w-7" />
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Step {item.step}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-primary via-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: "10,000+", label: "Happy Customers", icon: Users },
              { value: "500+", label: "Services Completed", icon: CheckCircle },
              { value: "200+", label: "Auto Parts", icon: Package },
              { value: "4.8", label: "Average Rating", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-white/70 group-hover:text-amber-300 transition-colors" />
                <div className="text-3xl md:text-4xl font-extrabold mb-1">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wide">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Rajesh Kumar", role: "Car Owner", text: "Best platform for car service! Booked my first general service and the workshop was amazing. Very transparent pricing.", stars: 5 },
              { name: "Priya Sharma", role: "Regular Customer", text: "I love the parts store. Genuine products at great prices. Delivered right to my doorstep. Highly recommended!", stars: 5 },
              { name: "Amit Patel", role: "Workshop Owner", text: "As a workshop owner, this platform helped me get more customers and manage bookings efficiently. Great tool!", stars: 4 },
            ].map((t) => (
              <div key={t.name} className="card hover:shadow-xl transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.stars ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">
                  &quot;{t.text}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Ready to Give Your Car the Best Care?
              </h2>
              <p className="text-blue-200/80 mb-8 max-w-md mx-auto">
                Join thousands of car owners who trust AutoCare Pro for their
                vehicle maintenance needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href={user ? "/services" : "/auth/signup"}
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-10 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
                >
                  {user ? "Book a Service" : "Get Started Free"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/services"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-10 py-3.5 rounded-xl transition-all flex items-center gap-2"
                >
                  View Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
