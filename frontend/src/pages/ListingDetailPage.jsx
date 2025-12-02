import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById, getMyListingById, deleteListing, updateListing, markListingSold } from '../services/items';
import { authService, authUtils } from '../services/auth';
import ProfilePicture from '../components/ProfilePicture';
import StarRating from '../components/StarRating';
import api from '../services/api';

const ListingDetailPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'CAD',
    category: '',
    city: '',
    campus: '',
    imageUrls: [''],
    status: 'ACTIVE',
    soldToUserId: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [buyerOptions, setBuyerOptions] = useState([]);
  const [isBuyerLoading, setIsBuyerLoading] = useState(false);
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(true);
  const [hasRated, setHasRated] = useState(false);

  const categories = [
    'Furniture',
    'Textbooks',
    'Electronics',
    'Housing',
    'Transportation',
    'Academic Services'
  ];

  // Initialize edit form data when entering edit mode
  useEffect(() => {
    if (isEditing && listing) {
      setEditFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price?.toString() || '',
        currency: listing.currency || 'CAD',
        category: listing.category || '',
        city: listing.city || '',
        campus: listing.campus || '',
        imageUrls: listing.imageUrls && listing.imageUrls.length > 0 
          ? listing.imageUrls 
          : [''],
        status: listing.status || 'ACTIVE',
        soldToUserId: listing.sold_to_user_id || ''
      });
      setEditErrors({});
    }
  }, [isEditing, listing]);

  const loadBuyerOptions = useCallback(async (userId, targetListingId) => {
    if (!userId) return;
    setIsBuyerLoading(true);
    try {
      const { data } = await api.get(`/chat/users/${userId}/conversations`);
      const conversations = data || [];
      const relevant = conversations.filter((c) => c.listingId === targetListingId);
      const pool = (relevant.length ? relevant : conversations).filter((c) => Array.isArray(c.participantIds));

      const uniqueOtherIds = Array.from(new Set(pool
        .map((c) => c.participantIds.find((id) => id !== userId))
        .filter(Boolean)));

      const optionResults = [];
      for (const otherId of uniqueOtherIds) {
        try {
          const user = await authService.getUser(otherId);
          optionResults.push({
            id: user.user_id || user.id || otherId,
            name: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Marketplace user',
            email: user.mun_email || user.email || ''
          });
        } catch (err) {
          optionResults.push({ id: otherId, name: 'Chat participant', email: otherId });
        }
      }
      setBuyerOptions(optionResults);
    } catch (err) {
      console.error('Unable to load buyer options', err);
    } finally {
      setIsBuyerLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        setLoading(true);
        
        // Get current user ID
        const sessionUser = await authUtils.refreshSession();
        const userId = sessionUser?.id || authUtils.getUserId();
        setCurrentUserId(userId);

        // Get listing - try public endpoint first, fallback to user's own listing if 404
        let listingData = null;
        try {
          listingData = await getListingById(listingId);
        } catch (err) {
          if (err.response?.status === 404 && userId) {
            listingData = await getMyListingById(listingId);
          } else {
            throw err;
          }
        }
        setListing(listingData);

        // Fetch seller information
        if (listingData.seller_id) {
          try {
            const [sellerData, profileData] = await Promise.all([
              authService.getUser(listingData.seller_id),
              authService.getUserProfile(listingData.seller_id).catch(() => null)
            ]);
            setSeller(sellerData);
            setSellerProfile(profileData);
          } catch (err) {
            console.error('Error fetching seller info:', err);
            // Continue even if seller info fails
          }
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.response?.data?.message || 'Listing not found');
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchListingData();
    }
  }, [listingId]);

  useEffect(() => {
    if (listing && currentUserId && listing.seller_id === currentUserId) {
      loadBuyerOptions(currentUserId, listingId);
    }
  }, [listing, currentUserId, listingId, loadBuyerOptions]);

  useEffect(() => {
    const checkRatingState = async () => {
      if (!listing?.id || !currentUserId) return;
      try {
        const res = await api.get(`/chat/users/${currentUserId}/conversations`);
        const hasConvoForListing = (res.data || []).some(c => c.listingId === listing.id);
        if (!hasConvoForListing) return;

        const ratingRes = await api.get(`/users/${listing.seller_id}/ratings`);
        const already = (ratingRes.data || []).some(r => r.listing_id === listing.id && r.buyer?.user_id === currentUserId);
        setHasRated(already);
        setShowRatingForm(!already);
      } catch (err) {
        // ignore failures, default to showing form
        setHasRated(false);
      }
    };

    checkRatingState();
  }, [listing?.id, listing?.seller_id, currentUserId]);

  useEffect(() => {
    // Reset rating form visibility when viewing a new listing or when buyer changes
    setShowRatingForm(true);
    setRatingSuccess(false);
    setRatingError('');
  }, [listingId, currentUserId, listing?.sold_to_user_id]);

  const handleSubmitRating = async () => {
    if (!seller?.user_id || !listing?.id) return;
    setRatingError('');
    setRatingSuccess(false);
    setRatingSubmitting(true);
    try {
      await api.post(`/users/${seller.user_id}/ratings`, {
        listingId: listing.id,
        rating: Number(ratingScore),
        review: ratingComment?.trim() || undefined,
      });
      setRatingSuccess(true);
      setShowRatingForm(false);
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSellerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const sellerId = seller?.user_id || seller?.id || listing?.seller_id;
    if (sellerId) {
      navigate(`/users/${sellerId}`);
    } else {
      console.error('Seller ID not found', { seller, listing });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteListing(listingId);
      navigate('/listing-deleted', { 
        state: { listingTitle: listing.title } 
      });
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert(err.response?.data?.message || 'Failed to delete listing');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };
  const handleChatClickModal= () => {
    const chatContext = {
      currentUser: authUtils.getSessionUser(),
      otherUser: {
        id: listing.seller_id,
      },
      product: {
        productId: listing.id,
        ...listing
      }
    };
    navigate('/chat', { state: { chatContext } });
  };

  const handleChatClick = () => {
    const sellerName = seller
      ? `${seller.first_name || ''} ${seller.last_name || ''}`.trim() || 'Seller'
      : 'Seller';
    const chatContext = {
      currentUser: authUtils.getSessionUser(),
      otherUser: {
        id: listing.seller_id,
        name: sellerName,
        email: seller?.mun_email || seller?.email || '',
      },
      product: {
        productId: listing.id,
        ...listing
      }
    };
    navigate('/chat', { state: { chatContext } });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      title: '',
      description: '',
      price: '',
      currency: 'CAD',
      category: '',
      city: '',
      campus: '',
      imageUrls: ['']
    });
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
    
    // Clear errors when typing
    if (editErrors[name]) {
      setEditErrors({
        ...editErrors,
        [name]: ''
      });
    }

    // Validate price
    if (name === 'price') {
      const numValue = parseFloat(value);
      if (value && (isNaN(numValue) || numValue < 0)) {
        setEditErrors({
          ...editErrors,
          price: 'Price must be a valid number greater than or equal to 0'
        });
      } else if (value && numValue >= 0) {
        setEditErrors({
          ...editErrors,
          price: ''
        });
      }
    }
  };

  const handleStatusChangeInline = (value) => {
    setEditFormData((prev) => ({
      ...prev,
      status: value,
      soldToUserId: value === 'SOLD' ? prev.soldToUserId : ''
    }));
    if (editErrors.status) {
      setEditErrors((prev) => ({ ...prev, status: '' }));
    }
    if (value === 'SOLD' && !buyerOptions.length) {
      // Try to load buyer options if not already loaded
      const userId = currentUserId || authUtils.getUserId();
      loadBuyerOptions(userId, listingId);
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...editFormData.imageUrls];
    newImageUrls[index] = value;
    setEditFormData({
      ...editFormData,
      imageUrls: newImageUrls
    });
  };

  const addImageUrlField = () => {
    if (editFormData.imageUrls.length < 10) {
      setEditFormData({
        ...editFormData,
        imageUrls: [...editFormData.imageUrls, '']
      });
    }
  };

  const removeImageUrlField = (index) => {
    if (editFormData.imageUrls.length > 1) {
      const newImageUrls = editFormData.imageUrls.filter((_, i) => i !== index);
      setEditFormData({
        ...editFormData,
        imageUrls: newImageUrls
      });
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editFormData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!editFormData.price) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(editFormData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.price = 'Price must be a valid number greater than or equal to 0';
      }
    }
    
    if (!editFormData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!editFormData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!editFormData.campus.trim()) {
      newErrors.campus = 'Campus is required';
    }
    
    // Validate image URLs
    const validImageUrls = editFormData.imageUrls.filter(url => url.trim() !== '');
    if (validImageUrls.length > 10) {
      newErrors.imageUrls = 'Maximum 10 images allowed';
    }

    if (!['ACTIVE', 'PENDING', 'SOLD'].includes(editFormData.status)) {
      newErrors.status = 'Invalid status';
    }
    if (editFormData.status === 'SOLD' && !editFormData.soldToUserId.trim()) {
      newErrors.soldToUserId = 'Select buyer before marking sold';
    }
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    setIsUpdating(true);
    try {
      // Filter out empty image URLs
      const imageUrls = editFormData.imageUrls.filter(url => url.trim() !== '');
      
      const listingData = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim() || undefined,
        price: parseFloat(editFormData.price),
        currency: editFormData.currency,
        category: editFormData.category,
        city: editFormData.city.trim(),
        campus: editFormData.campus.trim(),
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        status: editFormData.status
      };

      await updateListing(listingId, listingData);

      if (editFormData.status === 'SOLD') {
        await markListingSold(listingId, editFormData.soldToUserId.trim());
      }

      const updatedListing = await getListingById(listingId);
      setListing(updatedListing);
      setIsEditing(false);
      setCurrentImageIndex(0); // Reset to first image
    } catch (err) {
      console.error('Error updating listing:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update listing');
    } finally {
      setIsUpdating(false);
    }
  };

  const isOwner = currentUserId && listing && currentUserId === listing.seller_id;
  const isBuyer = currentUserId && listing && currentUserId === listing.sold_to_user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mun-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4 text-lg">{error || 'Listing not found'}</p>
          <button 
            onClick={() => navigate('/items')}
            className="bg-mun-red text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const images = listing.imageUrls && listing.imageUrls.length > 0 
    ? listing.imageUrls 
    : ['https://via.placeholder.com/800x600'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-lg aspect-square">
              <img
                src={images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {listing.status === 'SOLD' && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  SOLD
                </div>
              )}
              {listing.status === 'PENDING' && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                  PENDING
                </div>
              )}
              {listing.status === 'ACTIVE' && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  ACTIVE
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index 
                        ? 'border-mun-red' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleEditSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Listing</h2>
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    placeholder="e.g., MacBook Pro 2020"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                      editErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {editErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    placeholder="Describe your item in detail..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                  />
                </div>

                {/* Status */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['ACTIVE','PENDING','SOLD'].map((status) => (
                      <label
                        key={status}
                        className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer ${
                          editFormData.status === status ? 'border-mun-red bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={editFormData.status === status}
                          onChange={() => handleStatusChangeInline(status)}
                        />
                        <span className="font-medium text-gray-800">{status}</span>
                      </label>
                    ))}
                  </div>
                  {editErrors.status && <p className="text-red-500 text-sm mt-1">{editErrors.status}</p>}

                  {editFormData.status === 'SOLD' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Buyer <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="soldToUserId"
                        value={editFormData.soldToUserId}
                        onChange={handleEditChange}
                        placeholder="Start typing a buyer's name or paste their user ID"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                          editErrors.soldToUserId ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                        onFocus={() => setShowBuyerDropdown(true)}
                        onBlur={() => setTimeout(() => setShowBuyerDropdown(false), 200)}
                      />
                      {showBuyerDropdown && (
                        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md shadow-sm bg-white divide-y divide-gray-100">
                          {buyerOptions
                            .filter((buyer) => {
                              const query = editFormData.soldToUserId.toLowerCase();
                              if (!query) return true; // show all when empty
                              const tokens = query.split(/\s+/).filter(Boolean);
                              const haystack = `${buyer.name} ${buyer.email} ${buyer.id}`.toLowerCase();
                              return tokens.every(tok => haystack.includes(tok));
                            })
                            .map((buyer) => (
                              <button
                                type="button"
                                key={buyer.id}
                                onClick={() => setEditFormData((prev) => ({ ...prev, soldToUserId: buyer.id }))}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-red-50"
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <div className="font-medium text-gray-800">{buyer.name}</div>
                                <div className="text-xs text-gray-500">{buyer.email || buyer.id}</div>
                              </button>
                            ))}
                          {buyerOptions.length === 0 && !isBuyerLoading && (
                            <div className="px-3 py-2 text-sm text-gray-500">No buyers found. Paste the user ID.</div>
                          )}
                        </div>
                      )}
                      {isBuyerLoading && (
                        <p className="text-sm text-gray-500 mt-1">Loading recent buyers...</p>
                      )}
                      {!isBuyerLoading && buyerOptions.length === 0 && (
                        <p className="text-sm text-gray-500 mt-1">No recent chats found. You can paste the buyer's user ID.</p>
                      )}
                      {editErrors.soldToUserId && <p className="text-red-500 text-sm mt-1">{editErrors.soldToUserId}</p>}
                    </div>
                  )}
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (CAD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                          editErrors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                    </div>
                    {editErrors.price && (
                      <p className="text-red-500 text-sm mt-1">{editErrors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={editFormData.currency}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                    >
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                      editErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {editErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.category}</p>
                  )}
                </div>

                {/* City and Campus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={editFormData.city}
                      onChange={handleEditChange}
                      placeholder="e.g., St. John's"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                        editErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {editErrors.city && (
                      <p className="text-red-500 text-sm mt-1">{editErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campus <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="campus"
                      value={editFormData.campus}
                      onChange={handleEditChange}
                      placeholder="e.g., MUN-StJohns"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                        editErrors.campus ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {editErrors.campus && (
                      <p className="text-red-500 text-sm mt-1">{editErrors.campus}</p>
                    )}
                  </div>
                </div>

                {/* Image URLs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs (Optional, max 10)
                  </label>
                  {editFormData.imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      />
                      {editFormData.imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageUrlField(index)}
                          className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {editFormData.imageUrls.length < 10 && (
                    <button
                      type="button"
                      onClick={addImageUrlField}
                      className="mt-2 px-4 py-2 text-mun-red border border-mun-red rounded-lg hover:bg-mun-red hover:text-white transition-colors"
                    >
                      + Add Another Image URL
                    </button>
                  )}
                  {editErrors.imageUrls && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.imageUrls}</p>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isUpdating || isDeleting}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || isDeleting}
                    className="flex-1 px-6 py-3 bg-mun-red text-white rounded-lg font-medium hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={isUpdating || isDeleting}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <>
                {/* Title and Price */}
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-mun-red">
                      ${listing.price}
                    </span>
                    <span className="text-lg text-gray-600">{listing.currency}</span>
                  </div>
                </div>

                {/* Category and Location */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium capitalize">{listing.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{listing.city} • {listing.campus}</span>
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                  </div>
                )}

                {/* Listing Info */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Listed:</span>
                      <span className="ml-2 font-medium">{formatDate(listing.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium capitalize">{listing.status}</span>
                    </div>
                  </div>
                </div>

                {/* Seller Section */}
                {seller && (
                  <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Seller Information</h2>
                    <div 
                      onClick={handleSellerClick}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-mun-red hover:shadow-md transition-all cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSellerClick(e);
                        }
                      }}
                    >
                      <div className="flex-shrink-0 pointer-events-none">
                        <ProfilePicture 
                          src={seller.profile_picture_url}
                          size="large"
                        />
                      </div>
                      <div className="flex-1 pointer-events-none">
                        <div className="font-semibold text-gray-900">
                          {seller.first_name} {seller.last_name}
                        </div>
                        {sellerProfile && (
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating 
                              rating={parseFloat(sellerProfile.rating || 0)} 
                              size="sm"
                            />
                            <span className="text-sm text-gray-600">
                              ({sellerProfile.total_ratings || 0} reviews)
                            </span>
                          </div>
                        )}
                        {sellerProfile?.location && (
                          <div className="text-sm text-gray-500 mt-1">
                            📍 {sellerProfile.location}
                          </div>
                        )}
                      </div>
                      <div className="text-mun-red pointer-events-none">→</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  {isOwner && (
                    <button
                      onClick={handleEditClick}
                      className="px-6 py-3 bg-mun-red text-white rounded-lg font-medium hover:bg-red-800 transition-colors"
                    >
                      Edit Listing
                    </button>
                  )}
             
              {!isOwner && (
                <button
                  onClick={handleChatClick}
                  disabled={listing.status === 'SOLD'}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center ${
                    listing.status === 'SOLD'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-mun-red hover:bg-red-600 text-white shadow-sm'
                  }`}
                >
                  <span className="mr-2">💬</span>
                  {listing.status === 'SOLD' ? 'Item Sold' : 'Chat with Seller'}
                </button>
              )}
              <button
                    onClick={() => navigate('/items')}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                Browse More Listings
              </button>
            </div>

            {/* Buyer Rating Prompt */}
            {isBuyer && listing.status === 'SOLD' && showRatingForm && !hasRated && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="text-xl">⭐</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Rate your experience with {seller?.first_name || 'the seller'}</h3>
                    <p className="text-sm text-gray-600 mb-3">This item is marked as sold to you. Please leave a rating.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Score (1-5)</label>
                        <select
                          value={ratingScore}
                          onChange={(e) => setRatingScore(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          {[1,2,3,4,5].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                        <textarea
                          rows={3}
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Share your experience"
                        />
                      </div>
                    </div>
                    {ratingError && <p className="text-red-600 text-sm mt-2">{ratingError}</p>}
                    {ratingSuccess && !showRatingForm && <p className="text-green-700 text-sm mt-2">Thanks for rating!</p>}
                  </div>
                  <button
                    onClick={handleSubmitRating}
                    disabled={ratingSubmitting}
                    className="bg-mun-red text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {ratingSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            )}
              </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Listing</h3>
                  <p className="text-gray-700 mb-6">
                    Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleDeleteCancel}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
