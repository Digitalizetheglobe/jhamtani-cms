import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  HomeWork as HomeWorkIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { CircularProgress, Alert } from '@mui/material';
import {
  getProjectById,
  createProject,
  updateProject,
  getApiBaseUrl,
} from '../api/projectApi';
import PageShell from '../components/PageShell';

const QUICK_PAGE_LINKS = [
  { label: '/ace-ayodha', value: '/ace-ayodha' },
  { label: '/ace-abundance', value: '/ace-abundance' },
  { label: '/ace-villas', value: '/ace-villas' },
  { label: '/ace-atmosphere', value: '/ace-atmosphere' },
  { label: '/ace-aster', value: '/ace-aster' },
  { label: '/jhamtani-bizcore', value: '/jhamtani-bizcore' },
  { label: '/jhamtani-elevate', value: '/jhamtani-elevate' },
  { label: '/jhamtani-spacebiz', value: '/jhamtani-spacebiz' },
  { label: 'Live site URL', value: 'https://jhamtani.netlify.app/' },
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
    category: 'residential',
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
    if (!isEditMode) return;

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
            category: p.category || 'residential',
            isActive: p.isActive !== undefined ? p.isActive : true,
            order: p.order !== undefined && p.order !== null ? p.order : '',
            imageUrl: p.image || '',
          });

          const getFullUrl = (u) => {
            if (!u) return '';
            if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) {
              return u;
            }
            return `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`;
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
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
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

      const res = isEditMode
        ? await updateProject(id, submitData)
        : await createProject(submitData);

      if (res.success) {
        setSuccess(isEditMode ? 'Project updated successfully!' : 'Project created successfully!');
        setTimeout(() => navigate('/project-management'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm font-medium">Loading project details...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5">
        <button
          onClick={() => navigate('/project-management')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5B584C] hover:text-[#191f26] bg-white border border-[#C5A880]/30 px-4 py-2 rounded-xl"
        >
          <ArrowBackIcon className="w-4 h-4" />
          Back to Projects
        </button>

        <div className="cms-card p-4 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#A0725B]">
            <HomeWorkIcon />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#191f26]">
              {isEditMode ? 'Edit Project' : 'Add New Project'}
            </h1>
            <p className="text-sm text-[#5B584C] mt-0.5">
              Listing card for jhamtani.netlify.app
            </p>
          </div>
        </div>

        {error && (
          <Alert severity="error" className="rounded-xl" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && <Alert severity="success" className="rounded-xl">{success}</Alert>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-3 cms-card p-5 sm:p-7">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5B584C] mb-5 pb-3 border-b border-[#C5A880]/20">
              Project details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                  Project Title <span className="text-[#A0725B]">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., ACE Ayodhya"
                  required
                  className="cms-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                  Status Badge
                </label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="e.g., New Launch"
                  className="cms-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                  Location <span className="text-[#A0725B]">*</span>
                </label>
                <div className="relative">
                  <LocationIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Thergaon, Mundhwa, Ravet"
                    required
                    className="cms-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                  Category <span className="text-[#A0725B]">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="cms-input cursor-pointer"
                >
                  <option value="residential">Residential</option>
                  <option value="villas">Villas</option>
                  <option value="studios">Studios</option>
                  <option value="commercial">Commercial</option>
                  <option value="xo-series">XO Series</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                  Unit / Plot Size
                </label>
                <input
                  type="text"
                  name="plotSize"
                  value={formData.plotSize}
                  onChange={handleChange}
                  placeholder="e.g., Premium 2 & 3 BHK"
                  className="cms-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                  Property Type
                </label>
                <input
                  type="text"
                  name="naStatus"
                  value={formData.naStatus}
                  onChange={handleChange}
                  placeholder="e.g., Ultra-Luxury Villas"
                  className="cms-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  placeholder="1, 2, 3..."
                  className="cms-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                  Page Link
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="pageLink"
                    value={formData.pageLink}
                    onChange={handleChange}
                    placeholder="/ace-ayodha"
                    className="cms-input pl-10 font-mono"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {QUICK_PAGE_LINKS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, pageLink: item.value }))}
                      className="px-2.5 py-1 rounded-lg bg-[#f5f3ef] border border-[#C5A880]/25 text-xs text-[#5B584C] hover:border-[#C5A880] hover:text-[#191f26]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-3 p-4 bg-[#f5f3ef] rounded-xl border border-[#C5A880]/20">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-[#C5A880] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-[#191f26] cursor-pointer">
                  Visible on jhamtani.netlify.app
                </label>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-5">
            <div className="cms-card p-5 sm:p-6 xl:sticky xl:top-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5B584C] mb-4 pb-3 border-b border-[#C5A880]/20">
                Listing photo
              </h2>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative aspect-[4/5] bg-[#191f26] rounded-xl overflow-hidden group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/55 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#C5A880] text-[#191f26] text-xs font-semibold rounded-xl"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 bg-white/90 text-[#191f26] text-xs font-semibold rounded-xl"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#C5A880]/40 hover:border-[#C5A880] rounded-xl p-8 text-center bg-[#f5f3ef]"
                >
                  <div className="w-14 h-14 bg-[#C5A880]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[#A0725B]">
                    <CloudUploadIcon />
                  </div>
                  <h3 className="text-sm font-semibold text-[#191f26] mb-1">Upload project image</h3>
                  <p className="text-xs text-[#5B584C]">Portrait 4:5 recommended · JPG, PNG, WebP</p>
                </button>
              )}
            </div>
          </div>

          <div className="xl:col-span-5 cms-sticky-actions flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/project-management')}
              className="px-5 py-2.5 bg-white border border-[#C5A880]/30 text-[#191f26] text-sm font-medium rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="cms-btn-primary disabled:opacity-50">
              {loading ? <CircularProgress size={18} sx={{ color: '#191f26' }} /> : <SaveIcon className="w-4 h-4" />}
              <span>{isEditMode ? 'Update Project' : 'Save Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default ProjectForm;
