import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItemById } from "../services/items";
import { authUtils } from '../services/auth';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function fetchItem() {
      try {
        const data = await getItemById(id);
        setItem(data);
      } catch (err) {
        setError(err.message || "Failed to fetch item");
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  const handleChatClick = (item) => {
    // 1. Create the comprehensive context object
    const chatContext = {
      // Current User Details
      currentUser: authUtils.getSessionUser(),
      // Other User Details (Seller)
      otherUser: {
        id: item.seller_id,
      },
      // Product Details
      product: {
        productId: item.id,
        ...item
      }
    };
    // 2. Navigate and pass the context object via state
    navigate('/chat', { state: { chatContext } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading item...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  if (!item) return <p className="text-center mt-10 text-gray-500">Item not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition"
        >
          <span className="mr-2">←</span> Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative bg-gray-100">
                <img
                  src={item.imageUrls?.[selectedImage] || "https://via.placeholder.com/800x600"}
                  alt={item.title}
                  className="w-full h-96 object-cover"
                />
                {item.status === 'SOLD' && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">SOLD</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 p-4 overflow-x-auto">
                {item.imageUrls?.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition ${selectedImage === index
                        ? "border-red-500"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-20 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {item.description || "No description available"}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h2 className="text-2xl font-semibold mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Category</p>
                  <p className="font-medium capitalize">{item.category}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="font-medium">{item.city}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Campus</p>
                  <p className="font-medium">{item.campus}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Posted</p>
                  <p className="font-medium">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {item.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ${item.price} <span className="text-lg text-gray-500">{item.currency}</span>
                </p>
                <p className="text-gray-500 text-sm mt-1 capitalize">{item.category}</p>
              </div>

              <h1 className="text-xl font-semibold mb-6">{item.title}</h1>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleChatClick(item)}
                  disabled={item.status === 'SOLD'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center ${item.status === 'SOLD'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                    }`}
                >
                  <span className="mr-2">💬</span>
                  {item.status === 'SOLD' ? 'Item Sold' : 'Chat with Seller'}
                </button>

              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Seller Information</h3>

                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {item.seller?.name?.charAt(0) || 'S'}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{item.seller?.name || 'Seller'}</p>
                    <p className="text-sm text-gray-500">
                      Joined {item.seller?.joinedDate || 'Recently'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium">{item.seller?.responseTime || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active listings:</span>
                    <span className="font-medium">{item.seller?.activeListings || 0}</span>
                  </div>
                </div>

                <button className="w-full mt-4 py-2 px-4 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition">
                  View Seller Profile
                </button>
              </div>

              <div className="border-t mt-6 pt-6">
                <h3 className="font-semibold mb-2 text-sm">⚠️ Safety Tips</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Meet in public places</li>
                  <li>• Check the item before paying</li>
                  <li>• Don't share financial information</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}