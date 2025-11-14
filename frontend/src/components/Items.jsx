// frontend/src/components/Items.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getItems } from "../services/items";
import { authUtils } from "../services/auth";

export default function Items() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
    let active = true;

    const syncAuth = (user) => {
      if (!active) return;
      setIsAuthenticated(!!user);
    };

    const handleStorageChange = () => {
      syncAuth(authUtils.getSessionUser());
    };

    const handleAuthChange = (event) => {
      if (event?.detail && Object.prototype.hasOwnProperty.call(event.detail, 'user')) {
        syncAuth(event.detail.user);
        return;
      }
      handleStorageChange();
    };

    // Handle URL parameters
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }

    async function fetchItems() {
      try {
        const data = await getItems();
        if (active) setItems(data);
      } catch (err) {
        if (active) setError(err.message || "Failed to fetch items");
      } finally {
        if (active) setLoading(false);
      }
    }

    syncAuth(authUtils.getSessionUser());
    authUtils.refreshSession().then(syncAuth);
    fetchItems();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [location.search]);

  const handleSortChange = (e) => {
    const value = e.target.value;
    switch (value) {
      case "Newest":
        setSortBy("createdAt");
        setSortOrder("desc");
        break;
      case "Oldest":
        setSortBy("createdAt");
        setSortOrder("asc");
        break;
      case "Price: Low to High":
        setSortBy("price");
        setSortOrder("asc");
        break;
      case "Price: High to Low":
        setSortBy("price");
        setSortOrder("desc");
        break;
      default:
        setSortBy("createdAt");
        setSortOrder("desc");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading items...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  const filteredItems = items
    .filter((item) => {
      const categoryMatch = selectedCategory === "All Categories" || item.category === selectedCategory;
      const searchMatch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === "price") {
        aValue = parseFloat(a.price);
        bValue = parseFloat(b.price);
      } else if (sortBy === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Browse Listings</h1>
          {searchQuery && (
            <p className="text-gray-600 mt-1">Search results for: "{searchQuery}"</p>
          )}
          {selectedCategory !== "All Categories" && (
            <p className="text-gray-600 mt-1">Category: {selectedCategory}</p>
          )}
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow">
          Post a Listing
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 max-w-md">
          <input 
            type="text" 
            placeholder="Search listings..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none bg-transparent outline-none flex-1 px-2 text-sm"
          />
          <button className="text-gray-600 hover:text-gray-800">🔍</button>
        </div>
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
        <select 
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          onChange={handleSortChange}
        >
          <option>Newest</option>
          <option>Oldest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No listings found</p>
            {!isAuthenticated && (
              <p className="text-gray-400 mt-2">Sign in to see all available listings</p>
            )}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                        if (!authUtils.isAuthenticated()) {
                          alert("Please log in to view item details.");
                          navigate("/login");
                          return;
                        }
                        navigate(`/items/${item.id}`);
                      }}
              className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative">
                <img
                  src={item.imageUrls?.[0] || "https://via.placeholder.com/300x200"}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                {!isAuthenticated && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold">
                    Sign in to View
                  </div>
                )}
                {item.status === 'SOLD' && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    SOLD
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-lg">${item.price} {item.currency}</p>
                <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                <p className="text-gray-800 mt-1 font-medium truncate">{item.title}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {item.city} • {item.campus}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Posted {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
