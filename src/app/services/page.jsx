"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Wrench, Clock, IndianRupee, Search, Calendar, Car, CheckCircle, AlertCircle } from "lucide-react";

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
const CATEGORIES = ["all", "maintenance", "repair", "diagnostics", "tires", "electrical", "detailing", "bodywork"];
const CAT_COLORS = { maintenance: "bg-blue-50 text-blue-700", repair: "bg-red-50 text-red-700", diagnostics: "bg-purple-50 text-purple-700", tires: "bg-gray-100 text-gray-700", electrical: "bg-amber-50 text-amber-700", detailing: "bg-green-50 text-green-700", bodywork: "bg-pink-50 text-pink-700" };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [bookingService, setBookingService] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => { fetchServices(); }, []);
  useEffect(() => { if (user) fetchVehicles(); }, [user]);

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").eq("is_active", true).order("category");
    setServices(data || []);
    setLoading(false);
  };

  const fetchVehicles = async () => {
    const { data } = await supabase.from("vehicles").select("*").eq("user_id", user.id);
    setVehicles(data || []);
  };

  const openBooking = (service) => {
    if (!user) { router.push("/auth/login"); return; }
    setBookingService(service);
    setStep(1);
    setBookingDate("");
    setBookingTime("");
    setNotes("");
    setSelectedVehicle("");
  };

  const handleBook = async () => {
    setBookingLoading(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id, vehicle_id: selectedVehicle,
      service_id: bookingService.id, booking_date: bookingDate,
      time_slot: bookingTime, notes, total_price: bookingService.price, status: "pending",
    });
    setBookingLoading(false);
    if (error) { addToast("Failed to book: " + error.message, "error"); return; }
    addToast("Service booked successfully!", "success");
    setBookingService(null);
    router.push("/bookings");
  };

  const filtered = services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || s.category === category;
    return matchSearch && matchCategory;
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Car Services</h1>
        <p className="text-gray-500">Choose from our range of professional services</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${category === cat ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No services found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <div key={service.id} className="card flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${CAT_COLORS[service.category] || "bg-gray-100 text-gray-700"}`}>
                  {service.category}
                </span>
                <div className="flex items-center text-gray-400 text-xs gap-1">
                  <Clock className="h-3.5 w-3.5" />{service.duration_minutes} min
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-500 text-sm flex-1 mb-5 leading-relaxed">{service.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-xl font-extrabold text-primary">
                  <IndianRupee className="h-5 w-5" />{service.price?.toLocaleString("en-IN")}
                </div>
                <button onClick={() => openBooking(service)} className="btn-primary text-sm">
                  <Calendar className="h-4 w-4" /> Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal - Multi Step */}
      <Modal isOpen={!!bookingService} onClose={() => setBookingService(null)} title={`Book: ${bookingService?.name || ""}`} maxWidth="max-w-md">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-primary" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Vehicle */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 font-medium">Choose your car <span className="text-red-500">*</span></p>
            {vehicles.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No vehicles added</p>
                  <p className="text-xs text-amber-600 mt-0.5">Please <a href="/vehicles" className="underline font-semibold">add a vehicle</a> before booking a service.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <label key={v.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedVehicle === v.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="vehicle" value={v.id} checked={selectedVehicle === v.id} onChange={() => setSelectedVehicle(v.id)} className="accent-primary" />
                    <Car className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{v.year} {v.make} {v.model}</span>
                    {v.license_plate && <span className="text-xs text-gray-400 ml-auto">{v.license_plate}</span>}
                  </label>
                ))}
              </div>
            )}
            <button onClick={() => setStep(2)} disabled={!selectedVehicle} className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">Continue</button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Date</label>
              <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={today} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Time Slot</label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button key={slot} type="button" onClick={() => setBookingTime(slot)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${bookingTime === slot ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-gray-600 hover:border-primary/50"}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" rows={2} placeholder="Any specific concerns..." />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button onClick={() => setStep(3)} disabled={!bookingDate || !bookingTime} className="btn-primary flex-1 disabled:opacity-50">Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Service</span><span className="font-semibold text-gray-900">{bookingService?.name}</span></div>
              {selectedVehicle && vehicles.find((v) => v.id === selectedVehicle) && (
                <div className="flex justify-between text-sm"><span className="text-gray-500">Car</span><span className="font-semibold text-gray-900">{(() => { const v = vehicles.find((x) => x.id === selectedVehicle); return `${v.year} ${v.make} ${v.model}`; })()}</span></div>
              )}
              <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-semibold text-gray-900">{bookingDate}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Time</span><span className="font-semibold text-gray-900">{bookingTime}</span></div>
              {notes && <div className="flex justify-between text-sm"><span className="text-gray-500">Notes</span><span className="font-semibold text-gray-900 text-right max-w-[60%]">{notes}</span></div>}
              <hr />
              <div className="flex justify-between text-base"><span className="font-semibold text-gray-700">Total</span><span className="font-extrabold text-primary flex items-center"><IndianRupee className="h-4 w-4" />{bookingService?.price?.toLocaleString("en-IN")}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleBook} disabled={bookingLoading} className="btn-success flex-1 disabled:opacity-50">
                {bookingLoading ? "Booking..." : <><CheckCircle className="h-4 w-4" /> Confirm Booking</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
