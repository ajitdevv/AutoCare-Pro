"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import {
  Car, Plus, Trash2, Edit3, Fuel, Gauge, Hash, History, Wrench, Calendar,
} from "lucide-react";
import { format } from "date-fns";

const FUEL_TYPES = ["petrol", "diesel", "electric", "hybrid", "cng"];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [serviceHistory, setServiceHistory] = useState({});
  const [form, setForm] = useState({
    make: "", model: "", year: new Date().getFullYear(),
    license_plate: "", vin: "", color: "", mileage: 0, fuel_type: "petrol",
  });
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (user) fetchVehicles();
  }, [user, authLoading]);

  const fetchVehicles = async () => {
    const { data, error } = await supabase.from("vehicles").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) console.error("Fetch vehicles error:", error);
    setVehicles(data || []);
    setLoading(false);
  };

  const fetchHistory = async (vehicleId) => {
    if (serviceHistory[vehicleId]) { setExpandedHistory(expandedHistory === vehicleId ? null : vehicleId); return; }
    const { data } = await supabase.from("service_history").select("*").eq("vehicle_id", vehicleId).order("service_date", { ascending: false });
    setServiceHistory((prev) => ({ ...prev, [vehicleId]: data || [] }));
    setExpandedHistory(vehicleId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let error;
    if (editVehicle) {
      const res = await supabase.from("vehicles").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editVehicle.id);
      error = res.error;
    } else {
      const res = await supabase.from("vehicles").insert({
        user_id: user.id, make: form.make, model: form.model, year: form.year,
        license_plate: form.license_plate || null, vin: form.vin || null,
        color: form.color || null, mileage: form.mileage || 0, fuel_type: form.fuel_type,
      });
      error = res.error;
    }
    if (error) { addToast("Failed to save vehicle: " + error.message, "error"); return; }
    addToast(editVehicle ? "Vehicle updated!" : "Vehicle added!", "success");
    setShowForm(false);
    setEditVehicle(null);
    setForm({ make: "", model: "", year: new Date().getFullYear(), license_plate: "", vin: "", color: "", mileage: 0, fuel_type: "petrol" });
    fetchVehicles();
  };

  const handleEdit = (v) => {
    setEditVehicle(v);
    setForm({ make: v.make, model: v.model, year: v.year, license_plate: v.license_plate || "", vin: v.vin || "", color: v.color || "", mileage: v.mileage || 0, fuel_type: v.fuel_type || "petrol" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) { addToast("Failed to delete vehicle", "error"); return; }
    addToast("Vehicle deleted", "success");
    fetchVehicles();
  };

  if (authLoading || loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="skeleton h-9 w-48 mb-2" />
      <div className="skeleton h-5 w-72 mb-8" />
      <ListSkeleton rows={3} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Vehicles</h1>
          <p className="text-gray-500 mt-1">{vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => { setEditVehicle(null); setForm({ make: "", model: "", year: new Date().getFullYear(), license_plate: "", vin: "", color: "", mileage: 0, fuel_type: "petrol" }); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState icon={Car} title="No Vehicles Added" description="Add your vehicle to book services and track service history." actionLabel="Add Your First Vehicle" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => (
            <div key={v.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{v.year} {v.make} {v.model}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                      {v.license_plate && <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{v.license_plate}</span>}
                      <span className="flex items-center gap-1 capitalize"><Fuel className="h-3 w-3" />{v.fuel_type}</span>
                      {v.mileage > 0 && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.mileage.toLocaleString()} km</span>}
                      {v.color && <span className="capitalize">{v.color}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => fetchHistory(v.id)} className="btn-secondary text-sm">
                    <History className="h-4 w-4" /> History
                  </button>
                  <button onClick={() => handleEdit(v)} className="btn-secondary text-sm">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(v.id)} className="btn-danger text-sm">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Service History Dropdown */}
              {expandedHistory === v.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-down">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <History className="h-4 w-4" /> Service History
                  </h4>
                  {(!serviceHistory[v.id] || serviceHistory[v.id].length === 0) ? (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-sm mb-3">No service records for this vehicle</p>
                      <a href="/services" className="btn-primary text-xs py-2 px-4">
                        <Wrench className="h-3 w-3" /> Book a Service
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {serviceHistory[v.id].map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                          <div>
                            <span className="font-semibold text-gray-900">{h.service_name}</span>
                            {h.description && <p className="text-xs text-gray-500 mt-0.5">{h.description}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {h.service_date ? format(new Date(h.service_date), "MMM dd, yyyy") : "N/A"}
                            </div>
                            {h.cost && <div className="text-xs font-semibold text-primary mt-0.5">Rs. {h.cost.toLocaleString("en-IN")}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditVehicle(null); }} title={editVehicle ? "Edit Vehicle" : "Add New Vehicle"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input type="text" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className="input" placeholder="e.g. Toyota" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="input" placeholder="e.g. Corolla" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="input" min={1990} max={2030} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
              <input type="text" value={form.license_plate} onChange={(e) => setForm({ ...form, license_plate: e.target.value })} className="input" placeholder="MH 01 AB 1234" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} className="input">
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input" placeholder="Silver" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Mileage (km)</label>
            <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) || 0 })} className="input" min={0} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditVehicle(null); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editVehicle ? "Update Vehicle" : "Add Vehicle"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
