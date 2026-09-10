import React, { useEffect, useRef, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilePdf, FaShieldAlt } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import GavelIcon from '@mui/icons-material/Gavel';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const API_BASE = 'http://localhost:5000';
const PROJECT_TYPES = ['Residential', 'Commercial', 'Studio'];

const emptyForm = {
  projectName: '',
  projectType: 'Residential',
  projectLocation: '',
  tagline: '',
  mahareraNo: '',
  isActive: true,
};

const MahareraManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [documentFile, setDocumentFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const documentInputRef = useRef(null);
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
      let response = await fetch('/api/mahareras?limit=100');
      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/mahareras?limit=100`);
      }
      if (!response.ok) throw new Error('Failed to load Maharera records');
      const data = await response.json();
      setItems(data.mahareras || []);
    } catch (err) {
      setError(err.message || 'Failed to load Maharera records');
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
    setDocumentFile(null);
    setImageFile(null);
    setImagePreview('');
    if (documentInputRef.current) documentInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        projectName: item.projectName || '',
        projectType: item.projectType || 'Residential',
        projectLocation: item.projectLocation || '',
        tagline: item.tagline || '',
        mahareraNo: item.mahareraNo || '',
        isActive: item.isActive !== false,
      });
      setDocumentFile(null);
      setImageFile(null);
      setImagePreview(formatUrl(item.projectImage));
    } else {
      resetForm();
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
    if (!formData.projectName.trim()) {
      setError('Project name is required');
      return;
    }
    if (!editing && !documentFile) {
      setError('Maharera document is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('projectName', formData.projectName.trim());
      body.append('projectType', formData.projectType);
      body.append('projectLocation', formData.projectLocation.trim());
      body.append('tagline', formData.tagline.trim());
      body.append('mahareraNo', formData.mahareraNo.trim());
      body.append('isActive', formData.isActive);
      if (imageFile) body.append('projectImage', imageFile);
      if (documentFile) body.append('document', documentFile);

      const url = editing
        ? `${API_BASE}/api/mahareras/${editing._id}`
        : `${API_BASE}/api/mahareras`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save Maharera record');
      }

      closeModal();
      await fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save Maharera record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete Maharera record for "${item.projectName}"?`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/mahareras/${item._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete Maharera record');
      setItems((prev) => prev.filter((row) => row._id !== item._id));
    } catch (err) {
      setError(err.message || 'Failed to delete Maharera record');
    }
  };

  const handleToggle = async (item) => {
    try {
      const response = await fetch(`${API_BASE}/api/mahareras/${item._id}/toggle-status`, {
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
      (item.projectLocation || '').toLowerCase().includes(q) ||
      (item.tagline || '').toLowerCase().includes(q) ||
      (item.mahareraNo || '').toLowerCase().includes(q) ||
      (item.projectType || '').toLowerCase().includes(q);
    const matchesType = filterType === 'all' || item.projectType === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = [
    { label: 'Records', value: items.length, hint: 'All projects' },
    {
      label: 'Residential',
      value: items.filter((b) => b.projectType === 'Residential').length,
      hint: 'Homes',
    },
    {
      label: 'Commercial',
      value: items.filter((b) => b.projectType === 'Commercial').length,
      hint: 'Offices',
    },
    { label: 'Showing', value: filtered.length, hint: 'Current filters' },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading Maharera records...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Compliance"
          title="Maharera"
          subtitle="Manage MahaRERA numbers and registration documents."
        >
          <button type="button" onClick={fetchItems} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openModal()} className="cms-btn-primary">
            <FaPlus className="w-3.5 h-3.5" />
            Add Maharera
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project, number, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cms-input pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="cms-input cursor-pointer"
            >
              <option value="all">All types</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
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
            icon={GavelIcon}
            title="No Maharera records yet"
            message={
              searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Nothing matches these filters.'
                : 'Add the first Maharera registration.'
            }
            action={
              <button type="button" onClick={() => openModal()} className="cms-btn-primary">
                <FaPlus className="w-3.5 h-3.5" />
                Add Maharera
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
                  <div className="w-14 h-14 rounded-xl bg-[#f5f3ef] border border-[#C5A880]/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {item.projectImage ? (
                      <img
                        src={formatUrl(item.projectImage)}
                        alt={item.projectName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#C5A880]">
                        <FaShieldAlt />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#191f26] truncate">{item.projectName}</h3>
                    {item.tagline && (
                      <p className="text-sm text-[#5B584C] line-clamp-1 italic">{item.tagline}</p>
                    )}
                    {item.mahareraNo && (
                      <p className="text-sm text-[#191f26] mt-1">
                        No: <span className="font-medium">{item.mahareraNo}</span>
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#C5A880]/15 text-[#A0725B]">
                        {item.projectType}
                      </span>
                      {item.projectLocation && (
                        <span className="text-[11px] text-gray-500">{item.projectLocation}</span>
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
                  {item.mahareraDocument && (
                    <a
                      href={formatUrl(item.mahareraDocument)}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-btn-outline !px-4"
                    >
                      <FaFilePdf className="inline mr-1" /> Document
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
                Maharera
              </p>
              <h2 className="font-display text-2xl mt-1">
                {editing ? 'Edit Maharera' : 'Add Maharera'}
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
                  placeholder="e.g. ACE Residences"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Project type
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="cms-input cursor-pointer"
                  required
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Project image
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
                  {editing?.projectImage && !imageFile ? ' · Leave empty to keep current image' : ''}
                </p>
                {imagePreview && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden bg-[#f5f3ef] border border-[#C5A880]/25 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Project preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Project location
                </label>
                <input
                  type="text"
                  value={formData.projectLocation}
                  onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. Baner, Pune"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="cms-input"
                  placeholder="Short project line"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Maharera no
                </label>
                <input
                  type="text"
                  value={formData.mahareraNo}
                  onChange={(e) => setFormData({ ...formData, mahareraNo: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. P52100012345"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Maharera document
                </label>
                <input
                  ref={documentInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="cms-input"
                  required={!editing}
                />
                <p className="text-xs text-[#5B584C] mt-1">
                  PDF or Word · Max 50MB
                  {editing?.mahareraDocument && !documentFile
                    ? ' · Leave empty to keep current file'
                    : ''}
                </p>
                {documentFile && (
                  <p className="text-xs text-[#A0725B] mt-1 truncate">{documentFile.name}</p>
                )}
                {!documentFile && editing?.mahareraDocument && (
                  <a
                    href={formatUrl(editing.mahareraDocument)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#A0725B] underline mt-1 inline-block"
                  >
                    View current document
                  </a>
                )}
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
                  {saving ? 'Saving...' : editing ? 'Update Maharera' : 'Save Maharera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default MahareraManagement;
