"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  Wrench,
  Plus,
  Edit3,
  Trash2,
  IndianRupee,
  ArrowLeft,
  Save,
  X,
  Clock,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "maintenance",
  "repair",
  "diagnostics",
  "tires",
  "electrical",
  "detailing",
  "bodywork",
];

export default function AdminServicesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "maintenance",
    price: 0,
    duration_minutes: 60,
    is_active: true,
  });

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) {
      router.push("/");
      return;
    }
    if (user && profile?.role === "admin") fetchServices();
  }, [user, profile, authLoading]);

  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("category");
    setServices(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editService) {
      await supabase.from("services").update(form).eq("id", editService.id);
    } else {
      await supabase.from("services").insert(form);
    }
    setShowForm(false);
    setEditService(null);
    resetForm();
    fetchServices();
  };

  const handleEdit = (service) => {
    setEditService(service);
    setForm({
      name: service.name,
      description: service.description || "",
      category: service.category,
      price: service.price,
      duration_minutes: service.duration_minutes,
      is_active: service.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    fetchServices();
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "maintenance",
      price: 0,
      duration_minutes: 60,
      is_active: true,
    });
  };

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
            <p className="text-gray-600 mt-1">{services.length} services total</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditService(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <span className="badge badge-confirmed capitalize text-xs">
                {service.category}
              </span>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(service)} className="p-1 text-gray-400 hover:text-primary">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(service.id)} className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {service.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center">
                <IndianRupee className="h-4 w-4" />
                {service.price?.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.duration_minutes} min
              </span>
            </div>
            {!service.is_active && (
              <span className="badge badge-cancelled text-xs mt-2">Inactive</span>
            )}
          </div>
        ))}
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editService ? "Edit Service" : "Add New Service"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditService(null); }}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })}
                    className="input"
                    min={15}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="input"
                  min={0}
                  step="0.01"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible to customers)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditService(null); }} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4" />
                  {editService ? "Update" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
