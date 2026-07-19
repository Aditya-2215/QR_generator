import axios from "axios";
import { User, QR, QRType } from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to dynamically inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("qrverse_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  async register(name: string, email: string, password: any) {
    const response = await api.post("/auth/register", { name, email, password });
    return response.data;
  },

  async login(email: string, password: any) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export const qrAPI = {
  // Generate a code (supports guest / logged in)
  async generate(data: {
    title?: string;
    type: QRType;
    url: string;
    foregroundColor?: string;
    backgroundColor?: string;
    size?: number;
    margin?: number;
    logo?: string;
  }) {
    const response = await api.post("/qr/generate", data);
    return response.data;
  },

  // Get user QRs (authenticated)
  async getMyQRs(params?: { search?: string; type?: string }) {
    const response = await api.get("/qr", { params });
    return response.data;
  },

  // Get specific details
  async getById(id: string) {
    const response = await api.get(`/qr/${id}`);
    return response.data;
  },

  // Update a QR
  async update(
    id: string,
    data: {
      title?: string;
      url?: string;
      foregroundColor?: string;
      backgroundColor?: string;
      size?: number;
      margin?: number;
      logo?: string;
    }
  ) {
    const response = await api.put(`/qr/${id}`, data);
    return response.data;
  },

  // Delete QR
  async delete(id: string) {
    const response = await api.delete(`/qr/${id}`);
    return response.data;
  },

  // Toggle favorite
  async toggleFavorite(id: string) {
    const response = await api.patch(`/qr/${id}/favorite`);
    return response.data;
  },

  // Increment download
  async recordDownload(id: string) {
    const response = await api.patch(`/qr/${id}/download`);
    return response.data;
  },
};

export default api;
