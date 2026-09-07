import axios from 'axios';
import { API_BASE_URL, getApiBaseUrl } from './config';

export { getApiBaseUrl };

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetch all banners with filters
export const getBanners = async (params = {}) => {
  const response = await api.get('/api/banners', { params });
  return response.data;
};

// Fetch single banner by ID
export const getBannerById = async (id) => {
  const response = await api.get(`/api/banners/${id}`);
  return response.data;
};

// Fetch banner for a specific placement
export const getBannerByPlacement = async (placement) => {
  const response = await api.get(`/api/banners/placement/${placement}`);
  return response.data;
};

// Create new banner (supports FormData for files)
export const createBanner = async (formData) => {
  const isFormData = formData instanceof FormData;
  const response = await api.post('/api/banners', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

// Update existing banner
export const updateBanner = async (id, formData) => {
  const isFormData = formData instanceof FormData;
  const response = await api.put(`/api/banners/${id}`, formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

// Delete banner
export const deleteBanner = async (id) => {
  const response = await api.delete(`/api/banners/${id}`);
  return response.data;
};

// Toggle banner active status
export const toggleBannerStatus = async (id) => {
  const response = await api.patch(`/api/banners/${id}/toggle-status`);
  return response.data;
};

export default {
  getBanners,
  getBannerById,
  getBannerByPlacement,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  getApiBaseUrl,
};
