"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";
import {
  Search,
  ShoppingCart,
  IndianRupee,
  Package,
  Check,
  SlidersHorizontal,
} from "lucide-react";

const CATEGORIES = [
  "all",
  "oils",
  "filters",
  "brakes",
  "engine",
  "electrical",
  "fluids",
  "lighting",
  "tires",
  "accessories",
  "tools",
];

export default function PartsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [addedId, setAddedId] = useState(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("category");
    setProducts(data || []);
    setLoading(false);
  };

  const handleAdd = (product) => {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filtered = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "all" || p.category === category;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Auto Parts Store
        </h1>
        <p className="text-gray-600">
          Quality spare parts and accessories for your vehicle
          <span className="ml-2 text-primary font-semibold">
            ({products.length} products)
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search parts, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-auto"
            >
              <option value="name">Sort: Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                category === cat
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat === "all" ? `All (${products.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="card flex flex-col group hover:shadow-lg transition-all"
            >
              <div className="w-full h-48 rounded-lg mb-4 overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16l-4-4-4 4"/><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2"/><circle cx="8" cy="9" r="1"/></svg></div>';
                    }}
                  />
                ) : (
                  <Package className="h-16 w-16 text-gray-300" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-confirmed capitalize text-xs">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                    {product.brand}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-1 leading-snug">
                {product.name}
              </h3>
              <p className="text-gray-600 text-xs flex-1 mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-lg font-bold text-primary">
                  <IndianRupee className="h-4 w-4" />
                  {product.price?.toLocaleString("en-IN")}
                </div>
                {product.stock > 0 ? (
                  <button
                    onClick={() => handleAdd(product)}
                    className={`text-sm px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      addedId === product.id
                        ? "bg-green-500 text-white"
                        : "btn-primary"
                    }`}
                  >
                    {addedId === product.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Add
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-sm text-red-500 font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="text-xs mt-2">
                {product.stock > 0 ? (
                  <span
                    className={
                      product.stock <= 5
                        ? "text-red-500 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {product.stock <= 5
                      ? `Only ${product.stock} left!`
                      : `${product.stock} in stock`}
                  </span>
                ) : (
                  <span className="text-gray-400">Currently unavailable</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            Try a different search or category filter.
          </p>
        </div>
      )}
    </div>
  );
}
