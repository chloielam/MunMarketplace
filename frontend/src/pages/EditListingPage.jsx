import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyListingById, updateListing, markListingSold } from '../services/items';
import { authService, authUtils } from '../services/auth';
import api from '../services/api';

const categories = [
  'Furniture',
  'Textbooks',
  'Electronics',
  'Housing',
  'Transportation',
  'Academic Services'
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SOLD', label: 'Sold' }
];

const emptyForm = {
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
};

const EditListingPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [listingTitle, setListingTitle] = useState('');
  const [buyerOptions, setBuyerOptions] = useState([]);
  const [isBuyerLoading, setIsBuyerLoading] = useState(false);
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);

  const loadBuyerOptions = useCallback(async (userId, targetListingId) => {
    if (!userId) return;
    setIsBuyerLoading(true);
    try {
      const { data } = await api.get(`/chat/users/${userId}/conversations`);
      const conversations = data || [];
      const normalizeParticipants = (p) => {
        if (Array.isArray(p)) return p;
        if (typeof p === 'string') return p.split(',').map((x) => x.trim()).filter(Boolean);
        return [];
      };

      const relevant = conversations.filter((c) => c.listingId === targetListingId);
      const pool = relevant.length ? relevant : conversations;

      const uniqueOtherIds = Array.from(new Set(pool
        .map((c) => normalizeParticipants(c.participantIds).find((id) => id !== userId))
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
          console.warn('Failed to load buyer option, using fallback', otherId, err?.response?.data || err?.message);
          // Fallback so the user can still pick the participant even if user lookup fails
          optionResults.push({
            id: otherId,
            name: 'Chat participant',
            email: otherId
          });
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
    const init = async () => {
      try {
        const sessionUser = await authUtils.refreshSession();
        if (!sessionUser) {
          navigate('/login');
          return;
        }

        const userId = sessionUser.id || sessionUser.user_id;
        const listing = await getMyListingById(listingId);
        const normalizedStatus = ['ACTIVE', 'PENDING', 'SOLD'].includes(listing.status)
          ? listing.status
          : 'ACTIVE';

        setListingTitle(listing.title || 'Edit Listing');
        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          price: listing.price != null ? String(listing.price) : '',
          currency: listing.currency || 'CAD',
          category: listing.category || '',
          city: listing.city || '',
          campus: listing.campus || '',
          imageUrls: Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0 ? listing.imageUrls : [''],
          status: normalizedStatus,
          soldToUserId: listing.sold_to_user_id || ''
        });

        await loadBuyerOptions(userId, listingId);
      } catch (err) {
        const message = err.response?.data?.message || 'Unable to load listing for editing';
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [listingId, navigate, loadBuyerOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'soldToUserId') {
      setShowBuyerDropdown(true);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData((prev) => ({
      ...prev,
      imageUrls: newImageUrls
    }));
  };

  const addImageUrlField = () => {
    if (formData.imageUrls.length < 10) {
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, '']
      }));
    }
  };

  const removeImageUrlField = (index) => {
    if (formData.imageUrls.length > 1) {
      setFormData((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index)
      }));
    }
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
      soldToUserId: value === 'SOLD' ? prev.soldToUserId : ''
    }));
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';

    const priceNum = parseFloat(formData.price);
    if (Number.isNaN(priceNum) || priceNum < 0) newErrors.price = 'Price must be a valid number';

    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.campus.trim()) newErrors.campus = 'Campus is required';

    const validImageUrls = formData.imageUrls.filter((url) => url.trim() !== '');
    if (validImageUrls.length > 10) newErrors.imageUrls = 'Maximum 10 images allowed';

    if (formData.status === 'SOLD' && !formData.soldToUserId.trim()) {
      newErrors.soldToUserId = 'Select who bought the item';
    }

    if (!['ACTIVE', 'PENDING', 'SOLD'].includes(formData.status)) {
      newErrors.status = 'Invalid status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setSaving(true);
    try {
      const imageUrls = formData.imageUrls
        .map((url) => url.trim())
        .filter((url) => url !== '');

      const listingPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        currency: formData.currency,
        category: formData.category,
        city: formData.city.trim(),
        campus: formData.campus.trim(),
        imageUrls: imageUrls.length ? imageUrls : undefined,
        status: formData.status
      };

      // First update all fields including desired status
      await updateListing(listingId, listingPayload);

      // If marking as sold, ensure buyer link is set
      if (formData.status === 'SOLD') {
        await markListingSold(listingId, formData.soldToUserId.trim());
      }

      navigate(`/listings/${listingId}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update listing';
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

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

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-lg">{errorMessage}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-10 text-gray-500 hover:text-gray-700 text-2xl font-bold"
      >
        ←
      </button>

      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Edit Listing</h1>
          <p className="text-gray-600">{listingTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded bg-red-50 text-red-700 border border-red-200">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
            />
          </div>

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
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
              >
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campus <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                  errors.campus ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.campus && <p className="text-red-500 text-sm mt-1">{errors.campus}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs (max 10)</label>
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                />
                {formData.imageUrls.length > 1 && (
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
            {formData.imageUrls.length < 10 && (
              <button
                type="button"
                onClick={addImageUrlField}
                className="mt-2 px-4 py-2 text-mun-red border border-mun-red rounded-lg hover:bg-mun-red hover:text-white transition-colors"
              >
                + Add Another Image URL
              </button>
            )}
            {errors.imageUrls && <p className="text-red-500 text-sm mt-1">{errors.imageUrls}</p>}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Listing Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer ${
                    formData.status === option.value ? 'border-mun-red bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={() => handleStatusChange(option.value)}
                  />
                  <span className="font-medium text-gray-800">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}

            {formData.status === 'SOLD' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Buyer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="soldToUserId"
                  value={formData.soldToUserId}
                  onChange={handleChange}
                  placeholder="Start typing a buyer's name or paste their user ID"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                    errors.soldToUserId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  onFocus={() => setShowBuyerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowBuyerDropdown(false), 200)}
                />
                {showBuyerDropdown && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md shadow-sm bg-white divide-y divide-gray-100">
                    {buyerOptions
                      .filter((buyer) => {
                        const query = formData.soldToUserId.toLowerCase();
                        if (!query) return true; // show all when empty
                        const tokens = query.split(/\s+/).filter(Boolean);
                        const haystack = `${buyer.name} ${buyer.email} ${buyer.id}`.toLowerCase();
                        return tokens.every(tok => haystack.includes(tok));
                      })
                      .map((buyer) => (
                        <button
                          type="button"
                          key={buyer.id}
                          onClick={() => setFormData((prev) => ({ ...prev, soldToUserId: buyer.id }))}
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
                {errors.soldToUserId && <p className="text-red-500 text-sm mt-1">{errors.soldToUserId}</p>}
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-col md:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto bg-mun-red text-white py-3 px-6 rounded-lg font-medium hover:bg-red-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/listings/${listingId}`)}
              className="w-full md:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListingPage;
