//frontend/src/services/api.js
import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to surface auth errors without mutating storage
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
