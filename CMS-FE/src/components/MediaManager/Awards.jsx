import React, { useEffect, useRef, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageShell from '../PageShell';
import { PageHero, StatCards, EmptyState } from '../PageHero';

const API_BASE = 'http://localhost:5000';

const Awards = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAward, setEditingAward] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    isActive: true,
    order: 0,
  });
  const fileInputRef = useRef(null);

  const fetchAwards = async () => {
    setLoading(true);
    setError('');
    try {
      let response = await fetch('/api/awards?limit=100');
      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/awards?limit=100`);
      }
      if (!response.ok) throw new Error('Failed to load awards');
      const data = await response.json();
      setAwards(data.awards || []);
    } catch (err) {
      setError(err.message || 'Failed to load awards');
      setAwards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const openModal = (award = null) => {
    if (award) {
      setEditingAward(award);
      setFormData({
        title: award.title || '',
        isActive: award.isActive !== false,
        order: award.order ?? 0,
      });
      setImagePreview(formatImageUrl(award.imageUrl));
      setImageFile(null);
    } else {
      setEditingAward(null);
      setFormData({ title: '', isActive: true, order: awards.length });
      setImagePreview('');
      setImageFile(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAward(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({ title: '', isActive: true, order: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingAward && !imageFile) {
      setError('Please upload an award image');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('title', formData.title.trim());
      body.append('isActive', formData.isActive);
      body.append('order', formData.order);
      if (imageFile) {
        body.append('image', imageFile);
      }

      const url = editingAward
        ? `${API_BASE}/api/awards/${editingAward._id}`
        : `${API_BASE}/api/awards`;
      const method = editingAward ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save award');
      }

      closeModal();
      await fetchAwards();
    } catch (err) {
      setError(err.message || 'Failed to save award');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (award) => {
    if (!window.confirm('Delete this award image?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/awards/${award._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete award');
      setAwards((prev) => prev.filter((item) => item._id !== award._id));
    } catch (err) {
      setError(err.message || 'Failed to delete award');
    }
  };

  const handleToggle = async (award) => {
    try {
      const response = await fetch(`${API_BASE}/api/awards/${award._id}/toggle-status`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to update status');
      const result = await response.json();
      setAwards((prev) =>
        prev.map((item) => (item._id === award._id ? { ...item, isActive: result.data.isActive } : item))
      );
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const filtered = awards.filter((award) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (award.title || '').toLowerCase().includes(q) ||
      (award.imageUrl || '').toLowerCase().includes(q);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && award.isActive) ||
      (filterStatus === 'inactive' && !award.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Awards', value: awards.length, hint: 'All logos' },
    { label: 'Active', value: awards.filter((a) => a.isActive).length, hint: 'Visible' },
    { label: 'Hidden', value: awards.filter((a) => !a.isActive).length, hint: 'Inactive' },
    { label: 'Showing', value: filtered.length, hint: 'Current filters' },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading awards...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Recognition"
          title="Awards"
          subtitle="Upload award and recognition images for the public website."
        >
          <button type="button" onClick={fetchAwards} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openModal()} className="cms-btn-primary">
            <FaPlus className="w-3.5 h-3.5" />
            Add award
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search awards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cms-input pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="cms-input cursor-pointer"
            >
              <option value="all">All awards</option>
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
            icon={EmojiEventsIcon}
            title="No awards yet"
            message={
              searchTerm || filterStatus !== 'all'
                ? 'Nothing matches these filters.'
                : 'Add award images to show recognition logos on the site.'
            }
            action={
              <button type="button" onClick={() => openModal()} className="cms-btn-primary">
                <FaPlus className="w-3.5 h-3.5" />
                Add award
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((award) => (
              <article key={award._id} className="cms-card overflow-hidden flex flex-col">
                <div className="aspect-square bg-[#f5f3ef] flex items-center justify-center p-4">
                  <img
                    src={formatImageUrl(award.imageUrl)}
                    alt={award.title || 'Award'}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#191f26] truncate">
                      {award.title || 'Award image'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleToggle(award)}
                      className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full ${
                        award.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {award.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => openModal(award)}
                      className="cms-btn-primary !px-3 flex-1"
                    >
                      <FaEdit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(award)}
                      className="cms-btn-outline !px-3"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#191f26] px-6 py-5 text-white">
              <p className="text-[#C5A880] text-xs font-semibold tracking-[0.2em] uppercase">
                Awards
              </p>
              <h2 className="font-display text-2xl mt-1">
                {editingAward ? 'Edit award' : 'Add award image'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {imagePreview ? (
                <div className="relative aspect-[4/3] bg-[#f5f3ef] rounded-xl overflow-hidden border border-[#C5A880]/25 group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cms-btn-primary"
                    >
                      Change image
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#C5A880]/40 hover:border-[#C5A880] rounded-xl p-10 text-center bg-[#f5f3ef]"
                >
                  <div className="w-14 h-14 bg-[#C5A880]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[#A0725B]">
                    <CloudUploadIcon />
                  </div>
                  <p className="text-sm font-semibold text-[#191f26]">Upload award image</p>
                  <p className="text-xs text-[#5B584C] mt-1">JPG, PNG, WebP · Max 25MB</p>
                </button>
              )}

              <div>
                <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                  Label <span className="text-[#5B584C] font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Best Developer 2025"
                  className="cms-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#191f26] uppercase tracking-wider mb-2">
                    Display order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))
                    }
                    className="cms-input"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cms-input cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="accent-[#C5A880]"
                    />
                    <span className="text-sm text-[#191f26]">Visible on site</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="cms-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="cms-btn-primary disabled:opacity-50">
                  {saving ? 'Saving...' : editingAward ? 'Update award' : 'Save award'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Awards;
