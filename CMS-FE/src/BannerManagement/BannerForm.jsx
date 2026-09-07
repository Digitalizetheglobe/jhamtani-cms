import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  DesktopWindows as DesktopIcon,
  TabletMac as TabletIcon,
  PhoneIphone as PhoneIcon,
} from '@mui/icons-material';
import { CircularProgress, Alert } from '@mui/material';
import {
  getBannerById,
  createBanner,
  updateBanner,
  getApiBaseUrl,
} from '../api/bannerApi';

const BannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const baseUrl = getApiBaseUrl();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true,
    desktopBannerUrl: '',
    tabletBannerUrl: '',
    mobileBannerUrl: '',
  });

  const [files, setFiles] = useState({
    desktopBanner: null,
    tabletBanner: null,
    mobileBanner: null,
  });

  const [previews, setPreviews] = useState({
    desktopBanner: '',
    tabletBanner: '',
    mobileBanner: '',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const desktopInputRef = useRef(null);
  const tabletInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Load existing banner data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchBanner = async () => {
        try {
          setInitialLoading(true);
          const res = await getBannerById(id);
          if (res.success && res.data) {
            const b = res.data;
            setFormData({
              title: b.title || '',
              description: b.description || '',
              isActive: b.isActive !== undefined ? b.isActive : true,
              desktopBannerUrl: b.desktopBanner || '',
              tabletBannerUrl: b.tabletBanner || '',
              mobileBannerUrl: b.mobileBanner || '',
            });

            const getFull = (u) => {
              if (!u) return '';
              if (u.startsWith('http') || u.startsWith('data:')) return u;
              return `${baseUrl}${u}`;
            };

            setPreviews({
              desktopBanner: getFull(b.desktopBanner),
              tabletBanner: getFull(b.tabletBanner),
              mobileBanner: getFull(b.mobileBanner),
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Failed to load banner details');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchBanner();
    }
  }, [id, isEditMode, baseUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (field, file) => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError(`File is too large. Maximum size allowed is 100MB.`);
      return;
    }

    setFiles((prev) => ({ ...prev, [field]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: '' }));
    setFormData((prev) => ({ ...prev, [`${field}Url`]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError('Banner Title is required');
      return;
    }

    if (!files.desktopBanner && !formData.desktopBannerUrl) {
      setError('Desktop Banner image is required');
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description || '');
      submitData.append('isActive', formData.isActive);

      // Existing URLs
      if (formData.desktopBannerUrl) submitData.append('desktopBannerUrl', formData.desktopBannerUrl);
      if (formData.tabletBannerUrl) submitData.append('tabletBannerUrl', formData.tabletBannerUrl);
      if (formData.mobileBannerUrl) submitData.append('mobileBannerUrl', formData.mobileBannerUrl);

      // New files
      if (files.desktopBanner) submitData.append('desktopBanner', files.desktopBanner);
      if (files.tabletBanner) submitData.append('tabletBanner', files.tabletBanner);
      if (files.mobileBanner) submitData.append('mobileBanner', files.mobileBanner);

      let res;
      if (isEditMode) {
        res = await updateBanner(id, submitData);
      } else {
        res = await createBanner(submitData);
      }

      if (res.success) {
        setSuccess(isEditMode ? 'Banner updated successfully!' : 'Banner created successfully!');
        setTimeout(() => {
          navigate('/banner-management');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <CircularProgress />
        <p className="mt-4 text-gray-500 font-medium">Loading banner details...</p>
      </div>
    );
  }

  return (
    <div className="cms-page">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={() => navigate('/banner-management')}
          className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors mb-4 text-sm font-medium"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Back to Banner Management</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {isEditMode ? 'Edit Banner' : 'Create New Banner'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Add responsive banners for Desktop, Tablet, and Mobile
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/banner-management')}
              className="cms-btn-outline"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="cms-btn-primary disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon fontSize="small" />
              )}
              <span>{isEditMode ? 'Update Banner' : 'Save Banner'}</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
        {/* Alerts */}
        {error && (
          <Alert severity="error" className="rounded-xl shadow-sm">
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" className="rounded-xl shadow-sm">
            {success}
          </Alert>
        )}

        {/* 1. Basic Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            1. Banner Name
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Banner Name / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Ongoing Projects Banner, Festive Landing 1"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition"
              />
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition"
              />
            </div>
          </div>
        </div>

        {/* 2. Responsive Banner Uploads Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="pb-3 border-b border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              2. Upload Banners (Desktop, Tablet & Mobile)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload banners optimized for each screen size.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Desktop Banner Box */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-800">
                    <DesktopIcon className="text-red-600 text-sm" />
                    <span>Desktop Banner</span>
                  </div>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
                    Required
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  For Desktop screens
                </p>

                {/* Preview Area */}
                {previews.desktopBanner ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-black/5 aspect-[16/8] flex items-center justify-center">
                    <img
                      src={previews.desktopBanner}
                      alt="Desktop Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('desktopBanner')}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition"
                      title="Remove"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => desktopInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-red-500 rounded-xl p-6 text-center cursor-pointer transition bg-white aspect-[16/8] flex flex-col items-center justify-center group"
                  >
                    <CloudUploadIcon className="text-gray-400 group-hover:text-red-500 text-3xl mb-1 transition" />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-red-600">
                      Upload Desktop Banner
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">Click to browse file</span>
                  </div>
                )}
                <input
                  ref={desktopInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange('desktopBanner', e.target.files[0])}
                />
              </div>
            </div>

            {/* Tablet Banner Box */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-800">
                    <TabletIcon className="text-blue-600 text-sm" />
                    <span>Tablet Banner</span>
                  </div>
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  For iPad / Tablet screens
                </p>

                {previews.tabletBanner ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-black/5 aspect-[16/8] flex items-center justify-center">
                    <img
                      src={previews.tabletBanner}
                      alt="Tablet Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('tabletBanner')}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition"
                      title="Remove"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => tabletInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition bg-white aspect-[16/8] flex flex-col items-center justify-center group"
                  >
                    <CloudUploadIcon className="text-gray-400 group-hover:text-blue-500 text-3xl mb-1 transition" />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">
                      Upload Tablet Banner
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">Click to browse file</span>
                  </div>
                )}
                <input
                  ref={tabletInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange('tabletBanner', e.target.files[0])}
                />
              </div>
            </div>

            {/* Mobile Banner Box */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-800">
                    <PhoneIcon className="text-green-600 text-sm" />
                    <span>Mobile Banner</span>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  For Mobile screens
                </p>

                {previews.mobileBanner ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-black/5 aspect-[16/8] flex items-center justify-center">
                    <img
                      src={previews.mobileBanner}
                      alt="Mobile Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile('mobileBanner')}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition"
                      title="Remove"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => mobileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-green-500 rounded-xl p-6 text-center cursor-pointer transition bg-white aspect-[16/8] flex flex-col items-center justify-center group"
                  >
                    <CloudUploadIcon className="text-gray-400 group-hover:text-green-500 text-3xl mb-1 transition" />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-green-600">
                      Upload Mobile Banner
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">Click to browse file</span>
                  </div>
                )}
                <input
                  ref={mobileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange('mobileBanner', e.target.files[0])}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Status Toggle */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Banner Status
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Set banner to Active (Live on website) or Inactive (Draft)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
            <span className="text-sm font-bold text-gray-800">
              {formData.isActive ? 'Active (Live)' : 'Inactive (Draft)'}
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-end items-center gap-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/banner-management')}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="cms-btn-primary disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveIcon fontSize="small" />
            )}
            <span>{isEditMode ? 'Update Banner' : 'Create Banner'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;
