import React, { useEffect, useRef, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilePdf, FaEnvelopeOpenText } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const API_BASE = 'http://localhost:5000';
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const emptyForm = {
  title: '',
  month: '',
  year: new Date().getFullYear(),
  badge: '',
  tagline: '',
  date: '',
  order: 0,
  isActive: true,
};

const NewsletterManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState(null);
  const pdfInputRef = useRef(null);

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
      let response = await fetch('/api/newsletters?limit=100');
      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/newsletters?limit=100`);
      }
      if (!response.ok) throw new Error('Failed to load newsletters');
      const data = await response.json();
      setItems(data.newsletters || []);
    } catch (err) {
      setError(err.message || 'Failed to load newsletters');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      year: new Date().getFullYear(),
    });
    setEditing(null);
    setPdfFile(null);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        title: item.title || '',
        month: item.month || '',
        year: item.year || new Date().getFullYear(),
        badge: item.badge || '',
        tagline: item.tagline || '',
        date: item.date || '',
        order: item.order ?? 0,
        isActive: item.isActive !== false,
      });
      setPdfFile(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Newsletter title is required');
      return;
    }
    if (!editing && !pdfFile) {
      setError('Newsletter PDF is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('title', formData.title.trim());
      body.append('month', formData.month);
      body.append('year', formData.year);
      body.append('badge', formData.badge.trim());
      body.append('tagline', formData.tagline.trim());
      body.append('date', formData.date.trim());
      body.append('order', formData.order);
      body.append('isActive', formData.isActive);
      if (pdfFile) body.append('pdfDocument', pdfFile);

      const url = editing
        ? `${API_BASE}/api/newsletters/${editing._id}`
        : `${API_BASE}/api/newsletters`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save newsletter');
      }

      closeModal();
      await fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save newsletter');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete newsletter "${item.title}"?`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/newsletters/${item._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete newsletter');
      setItems((prev) => prev.filter((row) => row._id !== item._id));
    } catch (err) {
      setError(err.message || 'Failed to delete newsletter');
    }
  };

  const handleToggle = async (item) => {
    try {
      const response = await fetch(`${API_BASE}/api/newsletters/${item._id}/toggle-status`, {
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
      (item.title || '').toLowerCase().includes(q) ||
      (item.month || '').toLowerCase().includes(q) ||
      (item.badge || '').toLowerCase().includes(q) ||
      (item.tagline || '').toLowerCase().includes(q) ||
      String(item.year || '').includes(q);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Newsletters', value: items.length, hint: 'All editions' },
    { label: 'Active', value: items.filter((b) => b.isActive).length, hint: 'Visible' },
    { label: 'Hidden', value: items.filter((b) => !b.isActive).length, hint: 'Inactive' },
    { label: 'Showing', value: filtered.length, hint: 'Current filters' },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading newsletters...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Editions"
          title="Monthly newsletter"
          subtitle="Manage monthly newsletter PDFs and edition details."
        >
          <button type="button" onClick={fetchItems} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openModal()} className="cms-btn-primary">
            <FaPlus className="w-3.5 h-3.5" />
            Add newsletter
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, month, badge..."
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
            icon={MailOutlineIcon}
            title="No newsletters yet"
            message={
              searchTerm || filterStatus !== 'all'
                ? 'Nothing matches these filters.'
                : 'Add the first monthly newsletter.'
            }
            action={
              <button type="button" onClick={() => openModal()} className="cms-btn-primary">
                <FaPlus className="w-3.5 h-3.5" />
                Add newsletter
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
                  <div className="w-16 h-16 rounded-xl bg-[#191f26] text-[#C5A880] flex items-center justify-center flex-shrink-0">
                    <FaEnvelopeOpenText />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#191f26] truncate">{item.title}</h3>
                    <p className="text-sm text-[#5B584C]">
                      {[item.month, item.year].filter(Boolean).join(' ')}
                      {item.date ? ` · ${item.date}` : ''}
                    </p>
                    {item.tagline && (
                      <p className="text-sm text-[#5B584C] line-clamp-1 italic mt-0.5">
                        {item.tagline}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.badge && (
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#C5A880]/15 text-[#A0725B]">
                          {item.badge}
                        </span>
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
                  {item.pdfDocument && (
                    <a
                      href={formatUrl(item.pdfDocument)}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-btn-outline !px-4"
                    >
                      <FaFilePdf className="inline mr-1" /> PDF
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
                Monthly newsletter
              </p>
              <h2 className="font-display text-2xl mt-1">
                {editing ? 'Edit newsletter' : 'Add newsletter'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Newsletter title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. Monthly Buzz June 2026"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="cms-input cursor-pointer"
                  >
                    <option value="">Select month</option>
                    {MONTHS.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: Number(e.target.value) || '' })
                    }
                    className="cms-input"
                    placeholder="e.g. 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Badge <span className="normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. Latest Edition"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Tagline / Summary
                </label>
                <textarea
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="cms-input"
                  rows={2}
                  placeholder="e.g. Summer Construction Highlights..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Newsletter PDF
                </label>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="cms-input"
                  required={!editing}
                />
                <p className="text-xs text-[#5B584C] mt-1">
                  PDF · Max 50MB
                  {editing?.pdfDocument && !pdfFile ? ' · Leave empty to keep current file' : ''}
                </p>
                {pdfFile && (
                  <p className="text-xs text-[#A0725B] mt-1 truncate">{pdfFile.name}</p>
                )}
                {!pdfFile && editing?.pdfDocument && (
                  <a
                    href={formatUrl(editing.pdfDocument)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#A0725B] underline mt-1 inline-block"
                  >
                    View current PDF
                  </a>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Date label
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. June 2026"
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
                  {saving ? 'Saving...' : editing ? 'Update newsletter' : 'Save newsletter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default NewsletterManagement;
