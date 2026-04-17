"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  IndianRupee,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "oils",
  "filters",
  "brakes",
  "engine",
  "electrical",
  "fluids",
  "lighting",
  "accessories",
  "tools",
];

export default function AdminProductsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "accessories",
    price: 0,
    stock: 0,
    brand: "",
    sku: "",
    is_active: true,
  });

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) {
      router.push("/");
      return;
    }
    if (user && profile?.role === "admin") fetchProducts();
  }, [user, profile, authLoading]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editProduct) {
      await supabase
        .from("products")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", editProduct.id);
    } else {
      await supabase.from("products").insert(form);
    }
    setShowForm(false);
    setEditProduct(null);
    resetForm();
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      stock: product.stock,
      brand: product.brand || "",
      sku: product.sku || "",
      is_active: product.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "accessories",
      price: 0,
      stock: 0,
      brand: "",
      sku: "",
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-600 mt-1">{products.length} products total</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditProduct(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Price</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Stock</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.brand} &middot; {product.sku}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="badge badge-confirmed capitalize">{product.category}</span>
                </td>
                <td className="py-3 px-4 font-medium flex items-center">
                  <IndianRupee className="h-3 w-3" />
                  {product.price?.toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-4">
                  <span className={product.stock <= 5 ? "text-red-500 font-semibold" : ""}>
                    {product.stock}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`badge ${product.is_active ? "badge-completed" : "badge-cancelled"}`}>
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-500 hover:text-primary">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-500 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditProduct(null); }}>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="input"
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible in store)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditProduct(null); }} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  <Save className="h-4 w-4" />
                  {editProduct ? "Update" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
