//frontend/src/services/items.js
import api from "./api";

export async function getItems() {
  const response = await api.get("/listings");
  return response.data.items; // backend sends { items: [...] }
}

export async function getItemById(id) {
  const response = await api.get(`/listings/${id}`);
  return response.data; 
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
