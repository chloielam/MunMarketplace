//frontend/src/services/items.js
import api from "./api";

export async function getItems() {
  const response = await api.get("/listings");
  return response.data.items; // backend sends { items: [...] }
}

export async function getUserListings(userId) {
  // Only support getting current user's listings via /me/listings
  // For other users, we'd need a backend endpoint like /listings?sellerId=xxx
  // For now, return empty array for other users
  if (userId) {
    // TODO: Add backend endpoint to get listings by seller ID
    // For now, return empty array
    return [];
  }
  const endpoint = '/me/listings';
  const response = await api.get(endpoint);
  return response.data.items || response.data || [];
}

// Create a new listing
// Backend endpoint: POST /api/me/listings
// Required fields: title, price, category, city, campus
// Optional fields: description, currency (defaults to CAD), imageUrls (max 10), status (defaults to ACTIVE)
export async function createListing(listingData) {
  const response = await api.post('/me/listings', listingData);
  return response.data;
}

// Get a single listing by ID
// Backend endpoint: GET /api/listings/:id
export async function getListingById(listingId) {
  const response = await api.get(`/listings/${listingId}`);
  return response.data;
}

// Alias for backward compatibility with ItemDetail component
export const getItemById = getListingById;

// Update a listing
// Backend endpoint: PATCH /api/me/listings/:listingId
// Only the listing owner can update their own listing
export async function updateListing(listingId, listingData) {
  const response = await api.patch(`/me/listings/${listingId}`, listingData);
  return response.data;
}

// Delete a listing
// Backend endpoint: DELETE /api/me/listings/:listingId
// Only the listing owner can delete their own listing
export async function deleteListing(listingId) {
  await api.delete(`/me/listings/${listingId}`);
}
