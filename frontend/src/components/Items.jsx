// frontend/src/components/Items.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getItems, createListing } from "../services/items";
import { authUtils } from "../services/auth";

const CATEGORIES = [
  "All Categories",
  "Furniture",
  "Textbooks",
  "Electronics",
  "Housing",
  "Transportation",
  "Academic Services",
];

const LISTING_CATEGORIES = CATEGORIES.filter((cat) => cat !== "All Categories");

const getInitialFormState = () => ({
  title: "",
  description: "",
  price: "",
  currency: "CAD",
  category: LISTING_CATEGORIES[0] || "",
  city: "",
  campus: "",
  imageUrls: "",
});

export default function Items() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [formData, setFormData] = useState(getInitialFormState);
  const [formError, setFormError] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const navigate = useNavigate();

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

  const handlePostListingClick = () => {
    if (!authUtils.isAuthenticated()) {
      alert("Please log in to post a listing.");
      navigate("/login");
      return;
    }
    setIsPostModalOpen(true);
  };

  const handleModalClose = () => {
    setIsPostModalOpen(false);
    setFormError(null);
    setFormData(getInitialFormState());
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateListing = async (event) => {
    event.preventDefault();
    setFormError(null);

    const priceValue = parseFloat(formData.price);
    if (Number.isNaN(priceValue)) {
      setFormError("Please enter a valid price.");
      return;
    }

    if (!formData.category) {
      setFormError("Please select a category.");
      return;
    }

    setIsPosting(true);

    const imageUrls = formData.imageUrls
      ? formData.imageUrls
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
      : [];

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      price: priceValue,
      currency: formData.currency.trim() || "CAD",
      category: formData.category,
      city: formData.city.trim(),
      campus: formData.campus.trim(),
    };

    if (imageUrls.length > 0) {
      payload.imageUrls = imageUrls;
    }

    try {
      await createListing(payload);
      const updatedItems = await getItems();
      setItems(updatedItems);
      handleModalClose();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to post listing"
      );
    } finally {
      setIsPosting(false);
    }
  };

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
      // Handle category matching with normalization for backward compatibility
      // Map "Books" to "Textbooks" for filtering
      const normalizedItemCategory = item.category === "Books" ? "Textbooks" : item.category;
      const categoryMatch = selectedCategory === "All Categories" || normalizedItemCategory === selectedCategory;
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
        <button
          onClick={handlePostListingClick}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow"
        >
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
        {CATEGORIES.map((cat) => (
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
              onClick={() => navigate(`/listings/${item.id}`)}
              className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
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

      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Post a Listing</h2>
              <button
                type="button"
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close Post a Listing form"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleCreateListing}>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  placeholder="What are you selling?"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Add condition, usage details, or contact preferences"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                    placeholder="0.00"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <input
                    id="currency"
                    name="currency"
                    type="text"
                    value={formData.currency}
                    onChange={handleFormChange}
                    required
                    placeholder="CAD"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">Select a category</option>
                    {LISTING_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleFormChange}
                    required
                    placeholder="St. John's"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="campus" className="block text-sm font-medium text-gray-700">
                    Campus
                  </label>
                  <input
                    id="campus"
                    name="campus"
                    type="text"
                    value={formData.campus}
                    onChange={handleFormChange}
                    required
                    placeholder="St. John's"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label htmlFor="imageUrls" className="block text-sm font-medium text-gray-700">
                    Image URLs (optional)
                  </label>
                  <textarea
                    id="imageUrls"
                    name="imageUrls"
                    rows={2}
                    value={formData.imageUrls}
                    onChange={handleFormChange}
                    placeholder="Separate multiple links with commas"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Example: https://example.com/photo.jpg, https://example.com/photo2.jpg
                  </p>
                </div>
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 disabled:opacity-70"
                >
                  {isPosting ? "Posting..." : "Post Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
