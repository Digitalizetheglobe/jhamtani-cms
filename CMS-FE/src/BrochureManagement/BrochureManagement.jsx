import React, { useEffect, useRef, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilePdf, FaExternalLinkAlt } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const API_BASE = 'http://localhost:5000';
const PROJECT_TITLES = ['Residential', 'Commercial', 'Studio'];

const emptyForm = {
  projectName: '',
  projectTitle: 'Residential',
  location: '',
  tagline: '',
  projectPageUrl: '',
  isActive: true,
};

const BrochureManagement = () => {
  const [brochures, setBrochures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTitle, setFilterTitle] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [brochureFile, setBrochureFile] = useState(null);
  const logoInputRef = useRef(null);
  const brochureInputRef = useRef(null);

  const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchBrochures = async () => {
    setLoading(true);
    setError('');
    try {
      let response = await fetch('/api/brochures?limit=100');
      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/brochures?limit=100`);
      }
      if (!response.ok) throw new Error('Failed to load brochures');
      const data = await response.json();
      setBrochures(data.brochures || []);
    } catch (err) {
      setError(err.message || 'Failed to load brochures');
      setBrochures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrochures();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setLogoFile(null);
    setLogoPreview('');
    setBrochureFile(null);
    setEditing(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
    if (brochureInputRef.current) brochureInputRef.current.value = '';
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        projectName: item.projectName || '',
        projectTitle: item.projectTitle || 'Residential',
        location: item.location || '',
        tagline: item.tagline || '',
        projectPageUrl: item.projectPageUrl || '',
        isActive: item.isActive !== false,
      });
      setLogoPreview(formatUrl(item.projectLogo));
      setLogoFile(null);
      setBrochureFile(null);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleBrochureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBrochureFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      setError('Project name is required');
      return;
    }
    if (!editing && !brochureFile) {
      setError('Brochure document is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('projectName', formData.projectName.trim());
      body.append('projectTitle', formData.projectTitle);
      body.append('location', formData.location.trim());
      body.append('tagline', formData.tagline.trim());
      body.append('projectPageUrl', formData.projectPageUrl.trim());
      body.append('isActive', formData.isActive);
      if (logoFile) body.append('logo', logoFile);
      if (brochureFile) body.append('brochure', brochureFile);

      const url = editing
        ? `${API_BASE}/api/brochures/${editing._id}`
        : `${API_BASE}/api/brochures`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save brochure');
      }

      closeModal();
      await fetchBrochures();
    } catch (err) {
      setError(err.message || 'Failed to save brochure');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete brochure for "${item.projectName}"?`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/brochures/${item._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete brochure');
      setBrochures((prev) => prev.filter((b) => b._id !== item._id));
    } catch (err) {
      setError(err.message || 'Failed to delete brochure');
    }
  };

  const handleToggle = async (item) => {
    try {
      const response = await fetch(`${API_BASE}/api/brochures/${item._id}/toggle-status`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to update status');
      const result = await response.json();
      setBrochures((prev) =>
        prev.map((b) => (b._id === item._id ? { ...b, isActive: result.data.isActive } : b))
      );
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const filtered = brochures.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (item.projectName || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q) ||
      (item.tagline || '').toLowerCase().includes(q) ||
      (item.projectTitle || '').toLowerCase().includes(q);
    const matchesTitle = filterTitle === 'all' || item.projectTitle === filterTitle;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
    return matchesSearch && matchesTitle && matchesStatus;
  });

  const stats = [
    { label: 'Brochures', value: brochures.length, hint: 'All projects' },
    {
      label: 'Residential',
      value: brochures.filter((b) => b.projectTitle === 'Residential').length,
      hint: 'Homes',
    },
    {
      label: 'Commercial',
      value: brochures.filter((b) => b.projectTitle === 'Commercial').length,
      hint: 'Offices',
    },
    { label: 'Showing', value: filtered.length, hint: 'Current filters' },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading brochures...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Downloads"
          title="Brochure"
          subtitle="Manage project brochures, logos, and landing page links."
        >
          <button type="button" onClick={fetchBrochures} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openModal()} className="cms-btn-primary">
            <FaPlus className="w-3.5 h-3.5" />
            Add brochure
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search brochures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cms-input pl-10"
              />
            </div>
            <select
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              className="cms-input cursor-pointer"
            >
              <option value="all">All titles</option>
              {PROJECT_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
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
            icon={DescriptionIcon}
            title="No brochures yet"
            message={
              searchTerm || filterTitle !== 'all' || filterStatus !== 'all'
                ? 'Nothing matches these filters.'
                : 'Add the first project brochure.'
            }
            action={
              <button type="button" onClick={() => openModal()} className="cms-btn-primary">
                <FaPlus className="w-3.5 h-3.5" />
                Add brochure
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
                    {item.projectLogo ? (
                      <img
                        src={formatUrl(item.projectLogo)}
                        alt={item.projectName}
                        className="w-full h-full object-contain p-1.5"
                      />
                    ) : (
                      <DescriptionIcon sx={{ color: '#C5A880' }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#191f26] truncate">{item.projectName}</h3>
                    {item.tagline && (
                      <p className="text-sm text-[#5B584C] line-clamp-1 italic">{item.tagline}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#C5A880]/15 text-[#A0725B]">
                        {item.projectTitle}
                      </span>
                      {item.location && (
                        <span className="text-[11px] text-gray-500">{item.location}</span>
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
                  {item.brochureDocument && (
                    <a
                      href={formatUrl(item.brochureDocument)}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-btn-outline !px-4"
                    >
                      <FaFilePdf className="inline mr-1" /> PDF
                    </a>
                  )}
                  {item.projectPageUrl && (
                    <a
                      href={item.projectPageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-btn-outline !px-4"
                    >
                      <FaExternalLinkAlt className="inline mr-1" /> Page
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
                Brochure
              </p>
              <h2 className="font-display text-2xl mt-1">
                {editing ? 'Edit brochure' : 'Add brochure'}
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
                  Project logo
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                {logoPreview ? (
                  <div className="relative h-28 bg-[#f5f3ef] rounded-xl overflow-hidden border border-[#C5A880]/25 flex items-center justify-center group">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain p-3"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      <span className="cms-btn-primary">Change logo</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#C5A880]/40 hover:border-[#C5A880] rounded-xl p-6 text-center bg-[#f5f3ef]"
                  >
                    <CloudUploadIcon className="text-[#A0725B] mb-1" />
                    <p className="text-sm font-semibold text-[#191f26]">Upload project logo</p>
                    <p className="text-xs text-[#5B584C] mt-1">JPG, PNG, WebP</p>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Project title
                </label>
                <select
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                  className="cms-input cursor-pointer"
                  required
                >
                  {PROJECT_TITLES.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
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
                  Project page URL
                </label>
                <input
                  type="url"
                  value={formData.projectPageUrl}
                  onChange={(e) => setFormData({ ...formData, projectPageUrl: e.target.value })}
                  className="cms-input"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Brochure document
                </label>
                <input
                  ref={brochureInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf"
                  onChange={handleBrochureChange}
                  className="cms-input"
                  required={!editing}
                />
                <p className="text-xs text-[#5B584C] mt-1">
                  PDF or Word · Max 50MB
                  {editing?.brochureDocument && !brochureFile
                    ? ' · Leave empty to keep current file'
                    : ''}
                </p>
                {brochureFile && (
                  <p className="text-xs text-[#A0725B] mt-1 truncate">{brochureFile.name}</p>
                )}
                {!brochureFile && editing?.brochureDocument && (
                  <a
                    href={formatUrl(editing.brochureDocument)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#A0725B] underline mt-1 inline-block"
                  >
                    View current brochure
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
                  {saving ? 'Saving...' : editing ? 'Update brochure' : 'Save brochure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default BrochureManagement;
