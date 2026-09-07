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

// Fetch all projects with optional filters (category, isActive, search)
export const getProjects = async (params = {}) => {
  const response = await api.get('/api/projects', { params });
  return response.data;
};

// Fetch single project by ID
export const getProjectById = async (id) => {
  const response = await api.get(`/api/projects/${id}`);
  return response.data;
};

// Create new project (FormData for image upload)
export const createProject = async (formData) => {
  const isFormData = formData instanceof FormData;
  const response = await api.post('/api/projects', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

// Update existing project
export const updateProject = async (id, formData) => {
  const isFormData = formData instanceof FormData;
  const response = await api.put(`/api/projects/${id}`, formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

// Delete project
export const deleteProject = async (id) => {
  const response = await api.delete(`/api/projects/${id}`);
  return response.data;
};

// Toggle project active status
export const toggleProjectStatus = async (id) => {
  const response = await api.patch(`/api/projects/${id}/toggle-status`);
  return response.data;
};

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectStatus,
  getApiBaseUrl,
};
