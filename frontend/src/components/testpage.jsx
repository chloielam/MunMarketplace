// frontend/src/components/TestItems.jsx
import { useEffect, useState } from "react";
import { getItems } from "../services/items";

export default function TestItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const categories = [
    "All Categories",
    "Furniture",
    "Textbooks",
    "Electronics",
    "Housing",
    "Transportation",
    "Academic Services",
  ];

  useEffect(() => {
    async function fetchItems() {
      try {
        const data = await getItems();
        setItems(data);
      } catch (err) {
        setError(err.message || "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading items...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  const filteredItems =
    selectedCategory === "All Categories"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Browse Listings</h1>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow">
          Post a Listing
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`pb-2 text-sm font-medium ${
              selectedCategory === cat
                ? "border-b-2 border-red-500 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-end mb-4">
        <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
          <option>Newest</option>
          <option>Oldest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <img
              src={item.imageUrls || "https://via.placeholder.com/300x200"}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="font-semibold">${item.price}</p>
              <p className="text-sm text-gray-600">{item.category}</p>
              <p className="text-gray-800 mt-1 font-medium truncate">{item.title}</p>
              <p className="text-gray-400 text-xs mt-2">
                {item.user || "Unknown"} • {item.time || "Just now"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
