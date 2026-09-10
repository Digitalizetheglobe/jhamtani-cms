import React, { useEffect, useRef, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaHardHat, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import ConstructionIcon from '@mui/icons-material/Construction';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const API_BASE = 'http://localhost:5000';
const PROJECT_CATEGORIES = ['Residential', 'Commercial', 'Studio'];

const emptyForm = {
  projectName: '',
  title: '',
  month: '',
  projectCategory: 'Residential',
  location: '',
  tagline: '',
  projectLink: '',
  order: 0,
  isActive: true,
};

const SiteUpdateManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const imageInputRef = useRef(null);

  const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      let response = await fetch('/api/site-updates?limit=100');
      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/site-updates?limit=100`);
      }
      if (!response.ok) throw new Error('Failed to load site updates');
      const data = await response.json();
      setItems(data.siteUpdates || []);
    } catch (err) {
      setError(err.message || 'Failed to load site updates');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditing(null);
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        projectName: item.projectName || '',
        title: item.title || '',
        month: item.month || '',
        projectCategory: item.projectCategory || 'Residential',
        location: item.location || '',
        tagline: item.tagline || '',
        projectLink: item.projectLink || '',
        order: item.order ?? 0,
        isActive: item.isActive !== false,
      });
      setExistingImages(Array.isArray(item.images) ? item.images : []);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    } else {
      resetForm();
      setFormData((prev) => ({ ...prev, order: items.length }));
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim() || !formData.title.trim()) {
      setError('Project name and update title are required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('projectName', formData.projectName.trim());
      body.append('title', formData.title.trim());
      body.append('month', formData.month.trim());
      body.append('projectCategory', formData.projectCategory);
      body.append('location', formData.location.trim());
      body.append('tagline', formData.tagline.trim());
      body.append('projectLink', formData.projectLink.trim());
      body.append('order', formData.order);
      body.append('isActive', formData.isActive);
      body.append('existingImages', JSON.stringify(existingImages));
      newImageFiles.forEach((file) => body.append('images', file));

      const url = editing
        ? `${API_BASE}/api/site-updates/${editing._id}`
        : `${API_BASE}/api/site-updates`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save site update');
      }

      closeModal();
      await fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save site update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete site update "${item.title}"?`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/site-updates/${item._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete site update');
      setItems((prev) => prev.filter((row) => row._id !== item._id));
    } catch (err) {
      setError(err.message || 'Failed to delete site update');
    }
  };

  const handleToggle = async (item) => {
    try {
      const response = await fetch(`${API_BASE}/api/site-updates/${item._id}/toggle-status`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to update status');
      const result = await response.json();
      setItems((prev) =>
        prev.map((row) =>
          row._id === item._id ? { ...row, isActive: result.data.isActive } : row
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const filtered = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (item.projectName || '').toLowerCase().includes(q) ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q) ||
      (item.month || '').toLowerCase().includes(q) ||
      (item.tagline || '').toLowerCase().includes(q);
    const matchesCategory =
      filterCategory === 'all' || item.projectCategory === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = [
    { label: 'Updates', value: items.length, hint: 'All site updates' },
    {
      label: 'Residential',
      value: items.filter((b) => b.projectCategory === 'Residential').length,
      hint: 'Homes',
    },
    {
      label: 'Commercial',
      value: items.filter((b) => b.projectCategory === 'Commercial').length,
      hint: 'Offices',
    },
    { label: 'Showing', value: filtered.length, hint: 'Current filters' },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading site updates...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Construction"
          title="Site updates"
          subtitle="Monthly site progress updates and on-ground project photos."
        >
          <button type="button" onClick={fetchItems} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openModal()} className="cms-btn-primary">
            <FaPlus className="w-3.5 h-3.5" />
            Add update
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search updates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cms-input pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="cms-input cursor-pointer"
            >
              <option value="all">All categories</option>
              {PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="cms-input cursor-pointer"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Hidden</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="cms-card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={ConstructionIcon}
            title="No site updates yet"
            message={
              searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Nothing matches these filters.'
                : 'Add the first site progress update.'
            }
            action={
              <button type="button" onClick={() => openModal()} className="cms-btn-primary">
                <FaPlus className="w-3.5 h-3.5" />
                Add update
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <article
                key={item._id}
                className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-[#f5f3ef] border border-[#C5A880]/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {item.images?.[0] ? (
                      <img
                        src={formatUrl(item.images[0])}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#C5A880]">
                        <FaHardHat />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#191f26] truncate">{item.title}</h3>
                    <p className="text-sm text-[#5B584C]">
                      {item.projectName}
                      {item.month ? ` · ${item.month}` : ''}
                    </p>
                    {item.tagline && (
                      <p className="text-sm text-[#5B584C] line-clamp-1 italic mt-0.5">
                        {item.tagline}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#C5A880]/15 text-[#A0725B]">
                        {item.projectCategory}
                      </span>
                      {item.location && (
                        <span className="text-[11px] text-gray-500">{item.location}</span>
                      )}
                      <span className="text-[11px] text-gray-500">
                        {(item.images || []).length} image
                        {(item.images || []).length === 1 ? '' : 's'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle(item)}
                        className={`text-[11px] px-2.5 py-1 rounded-full ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.projectLink && (
                    <a
                      href={item.projectLink}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-btn-outline !px-4"
                    >
                      <FaExternalLinkAlt className="inline mr-1" /> Project
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => openModal(item)}
                    className="cms-btn-primary !px-4"
                  >
                    <FaEdit className="inline mr-1" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="cms-btn-outline !px-4"
                  >
                    <FaTrash className="inline mr-1" /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#191f26] px-6 py-5 text-white sticky top-0 z-10">
              <p className="text-[#C5A880] text-xs font-semibold tracking-[0.2em] uppercase">
                Site updates
              </p>
              <h2 className="font-display text-2xl mt-1">
                {editing ? 'Edit update' : 'Add update'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Project name
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. ACE Abode / ACE Villas"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Update title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. ACE ABODE - MAY"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Update month
                  </label>
                  <input
                    type="text"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="cms-input"
                    placeholder="e.g. MAY 2024"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.projectCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, projectCategory: e.target.value })
                    }
                    className="cms-input cursor-pointer"
                    required
                  >
                    {PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. Ravet, PCMC, Pune"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Tagline / Progress note
                </label>
                <textarea
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="cms-input"
                  rows={2}
                  placeholder="e.g. Elevated Urban Living & Architectural Finesse"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Project detail link
                </label>
                <input
                  type="text"
                  value={formData.projectLink}
                  onChange={(e) => setFormData({ ...formData, projectLink: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. /ace-villas"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Site images
                </label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="cms-input"
                />
                <p className="text-xs text-[#5B584C] mt-1">
                  Multiple JPG, PNG, WebP · Max 25MB each
                </p>

                {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {existingImages.map((url, index) => (
                      <div
                        key={`existing-${url}-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden bg-[#f5f3ef] border border-[#C5A880]/25"
                      >
                        <img
                          src={formatUrl(url)}
                          alt={`Site ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {newImagePreviews.map((preview, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden bg-[#f5f3ef] border border-[#C5A880]/25"
                      >
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Display order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: Number(e.target.value) || 0 })
                  }
                  className="cms-input"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-[#5B584C]">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </label>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-[#C5A880]/20">
                <button type="button" onClick={closeModal} className="cms-btn-outline">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cms-btn-primary disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update' : 'Save update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default SiteUpdateManagement;
