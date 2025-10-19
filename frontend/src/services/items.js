//frontend/src/services/items.js
import api from "./api";

export async function getItems() {
  const response = await api.get("/api/listings"); // keep the /api here
  return response.data.items; // backend sends { items: [...] }
}
