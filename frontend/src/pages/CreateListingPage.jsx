import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../services/items';
import { authUtils } from '../services/auth';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'CAD',
    category: '',
    city: '',
    campus: '',
    imageUrls: ['']
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const categories = [
    'Furniture',
    'Textbooks',
    'Electronics',
    'Housing',
    'Transportation',
    'Academic Services'
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authUtils.refreshSession();
      if (!user) {
        navigate('/login');
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Validate price
    if (name === 'price') {
      const numValue = parseFloat(value);
      if (value && (isNaN(numValue) || numValue < 0)) {
        setErrors({
          ...errors,
          price: 'Price must be a valid number greater than or equal to 0'
        });
      } else if (value && numValue >= 0) {
        setErrors({
          ...errors,
          price: ''
        });
      }
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData({
      ...formData,
      imageUrls: newImageUrls
    });
  };

  const addImageUrlField = () => {
    if (formData.imageUrls.length < 10) {
      setFormData({
        ...formData,
        imageUrls: [...formData.imageUrls, '']
      });
    }
  };

  const removeImageUrlField = (index) => {
    if (formData.imageUrls.length > 1) {
      const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        imageUrls: newImageUrls
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.price = 'Price must be a valid number greater than or equal to 0';
      }
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.campus.trim()) {
      newErrors.campus = 'Campus is required';
    }
    
    // Validate image URLs
    const validImageUrls = formData.imageUrls.filter(url => url.trim() !== '');
    if (validImageUrls.length > 10) {
      newErrors.imageUrls = 'Maximum 10 images allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Filter out empty image URLs
      const imageUrls = formData.imageUrls.filter(url => url.trim() !== '');
      
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        currency: formData.currency,
        category: formData.category,
        city: formData.city.trim(),
        campus: formData.campus.trim(),
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined
      };

      const createdListing = await createListing(listingData);
      
      // Navigate to success confirmation page
      navigate('/listing-created', {
        state: {
          listingTitle: listingData.title,
          listingId: createdListing.id
        }
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Close button */}
      <button
        onClick={() => navigate('/items')}
        className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl font-bold"
      >
        ×
      </button>
      
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/items')}
            className="text-gray-500 hover:text-gray-700 mb-6 flex items-center"
          >
            ← Back to Listings
          </button>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create New Listing</h1>
          <p className="text-gray-600">
            List your item for sale on the MUN Marketplace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., MacBook Pro 2020"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item in detail..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
            />
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
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
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

          {/* Category */}
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
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
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., St. John's"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
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
                placeholder="e.g., MUN-StJohns"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                  errors.campus ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.campus && (
                <p className="text-red-500 text-sm mt-1">{errors.campus}</p>
              )}
            </div>
          </div>

          {/* Image URLs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URLs (Optional, max 10)
            </label>
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
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
            {errors.imageUrls && (
              <p className="text-red-500 text-sm mt-1">{errors.imageUrls}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-mun-red text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Listing...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListingPage;

