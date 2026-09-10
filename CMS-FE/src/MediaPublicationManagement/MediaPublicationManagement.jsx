import React, { useEffect, useRef, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExternalLinkAlt, FaNewspaper } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import ArticleIcon from '@mui/icons-material/Article';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const API_BASE = 'http://localhost:5000';

const emptyForm = {
  publisher: '',
  category: '',
  date: '',
  readTime: '',
  title: '',
  excerpt: '',
  articleUrl: '',
  order: 0,
  isActive: true,
};

const MediaPublicationManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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
      let response = await fetch('/api/media-publications?limit=100');
      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/media-publications?limit=100`);
      }
      if (!response.ok) throw new Error('Failed to load media publications');
      const data = await response.json();
      setItems(data.mediaArticles || []);
    } catch (err) {
      setError(err.message || 'Failed to load media publications');
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
    setImageFile(null);
    setImagePreview('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        publisher: item.publisher || '',
        category: item.category || '',
        date: item.date || '',
        readTime: item.readTime || '',
        title: item.title || '',
        excerpt: item.excerpt || '',
        articleUrl: item.articleUrl || '',
        order: item.order ?? 0,
        isActive: item.isActive !== false,
      });
      setImagePreview(formatUrl(item.image));
      setImageFile(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.publisher.trim() || !formData.title.trim()) {
      setError('Publisher and title are required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('publisher', formData.publisher.trim());
      body.append('category', formData.category.trim());
      body.append('date', formData.date.trim());
      body.append('readTime', formData.readTime.trim());
      body.append('title', formData.title.trim());
      body.append('excerpt', formData.excerpt.trim());
      body.append('articleUrl', formData.articleUrl.trim());
      body.append('order', formData.order);
      body.append('isActive', formData.isActive);
      if (imageFile) body.append('image', imageFile);

      const url = editing
        ? `${API_BASE}/api/media-publications/${editing._id}`
        : `${API_BASE}/api/media-publications`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save media publication');
      }

      closeModal();
      await fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save media publication');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete article "${item.title}"?`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/media-publications/${item._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete media publication');
      setItems((prev) => prev.filter((row) => row._id !== item._id));
    } catch (err) {
      setError(err.message || 'Failed to delete media publication');
    }
  };

  const handleToggle = async (item) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/media-publications/${item._id}/toggle-status`,
        { method: 'PATCH' }
      );
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
      (item.title || '').toLowerCase().includes(q) ||
      (item.publisher || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.excerpt || '').toLowerCase().includes(q);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Articles', value: items.length, hint: 'All media' },
    { label: 'Active', value: items.filter((b) => b.isActive).length, hint: 'Visible' },
    { label: 'Hidden', value: items.filter((b) => !b.isActive).length, hint: 'Inactive' },
    { label: 'Showing', value: filtered.length, hint: 'Current filters' },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading media publications...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Press"
          title="Media publication"
          subtitle="Manage featured articles and press coverage for the public site."
        >
          <button type="button" onClick={fetchItems} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openModal()} className="cms-btn-primary">
            <FaPlus className="w-3.5 h-3.5" />
            Add article
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, publisher, category..."
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
            icon={ArticleIcon}
            title="No media articles yet"
            message={
              searchTerm || filterStatus !== 'all'
                ? 'Nothing matches these filters.'
                : 'Add the first media publication.'
            }
            action={
              <button type="button" onClick={() => openModal()} className="cms-btn-primary">
                <FaPlus className="w-3.5 h-3.5" />
                Add article
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
                    {item.image ? (
                      <img
                        src={formatUrl(item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#C5A880]">
                        <FaNewspaper />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#191f26] line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-[#5B584C] mt-0.5">
                      {item.publisher}
                      {item.category ? ` · ${item.category}` : ''}
                    </p>
                    {item.excerpt && (
                      <p className="text-sm text-[#5B584C] line-clamp-2 mt-1">{item.excerpt}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.date && (
                        <span className="text-[11px] text-gray-500">{item.date}</span>
                      )}
                      {item.readTime && (
                        <span className="text-[11px] text-gray-500">{item.readTime}</span>
                      )}
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
                  {item.articleUrl && (
                    <a
                      href={item.articleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-btn-outline !px-4"
                    >
                      <FaExternalLinkAlt className="inline mr-1" /> Article
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
                Media publication
              </p>
              <h2 className="font-display text-2xl mt-1">
                {editing ? 'Edit article' : 'Add article'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Publisher
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. BW Businessworld"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. Featured Article"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Date
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="cms-input"
                    placeholder="e.g. May 2024"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Read time
                  </label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="cms-input"
                    placeholder="e.g. 4 min read"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="cms-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="cms-input"
                  rows={3}
                  placeholder="Short article summary"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Image
                </label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cms-input"
                />
                <p className="text-xs text-[#5B584C] mt-1">
                  JPG, PNG, WebP · Max 25MB
                  {editing?.image && !imageFile ? ' · Leave empty to keep current image' : ''}
                </p>
                {imagePreview && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden bg-[#f5f3ef] border border-[#C5A880]/25 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Article preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Article URL
                </label>
                <input
                  type="url"
                  value={formData.articleUrl}
                  onChange={(e) => setFormData({ ...formData, articleUrl: e.target.value })}
                  className="cms-input"
                  placeholder="https://..."
                />
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
                  {saving ? 'Saving...' : editing ? 'Update article' : 'Save article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default MediaPublicationManagement;
