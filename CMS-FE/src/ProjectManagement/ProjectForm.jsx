import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  HomeWork as HomeWorkIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  AspectRatio as AspectRatioIcon,
} from '@mui/icons-material';
import { CircularProgress, Alert } from '@mui/material';
import {
  getProjectById,
  createProject,
  updateProject,
  getApiBaseUrl,
} from '../api/projectApi';

const QUICK_PAGE_LINKS = [
  { label: '/mountville', value: '/mountville' },
  { label: '/red-stone', value: '/red-stone' },
  { label: '/eco-town', value: '/eco-town' },
  { label: '/18-aangan', value: '/18-aangan' },
  { label: '/own-edge', value: '/own-edge' },
  { label: 'External URL (https://...)', value: 'https://' },
];

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const baseUrl = getApiBaseUrl();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    status: '',
    plotSize: '',
    naStatus: '',
    pageLink: '',
    category: 'na-plots',
    isActive: true,
    order: '',
    imageUrl: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchProject = async () => {
        try {
          setInitialLoading(true);
          const res = await getProjectById(id);
          if (res.success && res.data) {
            const p = res.data;
            setFormData({
              title: p.title || '',
              location: p.location || '',
              status: p.status || '',
              plotSize: p.plotSize || '',
              naStatus: p.naStatus || '',
              pageLink: p.pageLink || '',
              category: p.category || 'na-plots',
              isActive: p.isActive !== undefined ? p.isActive : true,
              order: p.order !== undefined && p.order !== null ? p.order : '',
              imageUrl: p.image || '',
            });

            const getFullUrl = (u) => {
              if (!u) return '';
              if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) {
                return u;
              }
              return `${baseUrl}${u.startsWith('/') ? '' : '/'}${url}`;
            };

            setImagePreview(getFullUrl(p.image));
          }
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Failed to load project details');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, isEditMode, baseUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Project location is required');
      return;
    }
    if (!imageFile && !formData.imageUrl && !imagePreview) {
      setError('Project image is required');
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('location', formData.location.trim());
      submitData.append('status', formData.status.trim() || formData.title.trim());
      submitData.append('plotSize', formData.plotSize.trim());
      submitData.append('naStatus', formData.naStatus.trim());
      submitData.append('pageLink', formData.pageLink.trim());
      submitData.append('category', formData.category);
      submitData.append('isActive', formData.isActive);
      submitData.append('order', formData.order !== '' ? formData.order : 0);

      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }

      let res;
      if (isEditMode) {
        res = await updateProject(id, submitData);
      } else {
        res = await createProject(submitData);
      }

      if (res.success) {
        setSuccess(isEditMode ? 'Project updated successfully!' : 'Project created successfully!');
        setTimeout(() => {
          navigate('/project-management');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <CircularProgress color="error" />
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/project-management')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-xs hover:bg-gray-50 transition cursor-pointer"
          >
            <ArrowBackIcon className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>
        </div>

        {/* Page Title Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
            <HomeWorkIcon className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEditMode ? 'Edit Ongoing Project' : 'Add New Ongoing Project'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Configure project card details for website's Ongoing Projects section
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert severity="error" className="rounded-xl shadow-sm" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" className="rounded-xl shadow-sm">
            {success}
          </Alert>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Project Information */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Project Details</span>
              <span className="text-xs font-normal text-gray-400">* Required fields</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Mountville, Red Stone, Eco Town"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-xs"
                />
              </div>

              {/* Status Tag */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Status Badge Text
                </label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="e.g., Mountville, The f Row, Red Stone"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-xs"
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LocationIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Kanhe Phata, Pune, Maharashtra"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-xs"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Category (Tab Filter) <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition cursor-pointer shadow-xs"
                >
                  <option value="na-plots">NA Plots</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              {/* Plot Size */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Plot Size / Unit Size
                </label>
                <input
                  type="text"
                  name="plotSize"
                  value={formData.plotSize}
                  onChange={handleChange}
                  placeholder="e.g., 1300 sqft., 2153 sqft, 1,694 sqft"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-xs"
                />
              </div>

              {/* NA Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  NA / Property Sub-Status
                </label>
                <input
                  type="text"
                  name="naStatus"
                  value={formData.naStatus}
                  onChange={handleChange}
                  placeholder="e.g., Residential NA Plots, Row Houses, Villas"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-xs"
                />
              </div>

              {/* Order (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Display Order Sequence <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  placeholder="e.g., 1, 2, 3 (Optional - default: 0)"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-xs"
                />
              </div>

              {/* Page Link */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Page Link (Target URL or Internal Route)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="pageLink"
                    value={formData.pageLink}
                    onChange={handleChange}
                    placeholder="e.g., /mountville, /red-stone, or https://thefrow.in/"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-xs"
                  />
                </div>

                {/* Quick select suggestions */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="text-xs text-gray-400 font-medium">Quick Suggestions:</span>
                  {QUICK_PAGE_LINKS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, pageLink: item.value }))}
                      className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-white border-gray-300 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-800 cursor-pointer">
                  Card is Active (Visible in website Ongoing Projects section)
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Image Upload */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Project Card Photo</span>
              <span className="text-xs text-gray-400 font-normal">Aspect ratio: 16:10 / 4:3 recommended</span>
            </h2>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative aspect-[16/10] max-w-lg mx-auto bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 group shadow-md">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow transition cursor-pointer"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-red-500 rounded-2xl p-8 text-center cursor-pointer transition bg-gray-50/60 hover:bg-gray-50 group"
              >
                <div className="w-14 h-14 bg-red-50 group-hover:bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500 transition">
                  <CloudUploadIcon className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  Click or Drag & Drop to upload project image
                </h3>
                <p className="text-xs text-gray-400">Supports JPG, PNG, WebP, GIF (Max 25MB)</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/project-management')}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-xl shadow-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-red-600/10 transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon className="w-4 h-4" />
              )}
              <span>{isEditMode ? 'Update Project' : 'Save Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
