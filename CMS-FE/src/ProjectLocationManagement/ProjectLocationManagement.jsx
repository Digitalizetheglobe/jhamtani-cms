import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import PlaceIcon from '@mui/icons-material/Place';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const API_BASE = 'http://localhost:5000';
const PROJECT_TYPES = ['Residential', 'Commercial', 'Studio'];

const emptyForm = {
  projectName: '',
  projectType: 'Residential',
  location: '',
  tagline: '',
  locationUrl: '',
  isActive: true,
};

const ProjectLocationManagement = () => {
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

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      let response = await fetch('/api/project-locations?limit=100');
      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/project-locations?limit=100`);
      }
      if (!response.ok) throw new Error('Failed to load project locations');
      const data = await response.json();
      setItems(data.locations || []);
    } catch (err) {
      setError(err.message || 'Failed to load project locations');
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
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        projectName: item.projectName || '',
        projectType: item.projectType || 'Residential',
        location: item.location || '',
        tagline: item.tagline || '',
        locationUrl: item.locationUrl || '',
        isActive: item.isActive !== false,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        projectName: formData.projectName.trim(),
        projectType: formData.projectType,
        location: formData.location.trim(),
        tagline: formData.tagline.trim(),
        locationUrl: formData.locationUrl.trim(),
        isActive: formData.isActive,
      };

      const url = editing
        ? `${API_BASE}/api/project-locations/${editing._id}`
        : `${API_BASE}/api/project-locations`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save project location');
      }

      closeModal();
      await fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save project location');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete location for "${item.projectName}"?`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/project-locations/${item._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project location');
      setItems((prev) => prev.filter((row) => row._id !== item._id));
    } catch (err) {
      setError(err.message || 'Failed to delete project location');
    }
  };

  const handleToggle = async (item) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/project-locations/${item._id}/toggle-status`,
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
      (item.projectName || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q) ||
      (item.tagline || '').toLowerCase().includes(q) ||
      (item.projectType || '').toLowerCase().includes(q);
    const matchesType = filterType === 'all' || item.projectType === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = [
    { label: 'Locations', value: items.length, hint: 'All projects' },
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
          <p className="mt-4 text-[#5B584C] text-sm">Loading project locations...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Maps"
          title="Project location"
          subtitle="Manage project locations and map links for the public site."
        >
          <button type="button" onClick={fetchItems} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openModal()} className="cms-btn-primary">
            <FaPlus className="w-3.5 h-3.5" />
            Add location
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations..."
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
            icon={PlaceIcon}
            title="No project locations yet"
            message={
              searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Nothing matches these filters.'
                : 'Add the first project location.'
            }
            action={
              <button type="button" onClick={() => openModal()} className="cms-btn-primary">
                <FaPlus className="w-3.5 h-3.5" />
                Add location
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
                  <div className="w-14 h-14 rounded-xl bg-[#191f26] text-[#C5A880] flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#191f26] truncate">{item.projectName}</h3>
                    {item.tagline && (
                      <p className="text-sm text-[#5B584C] line-clamp-1 italic">{item.tagline}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#C5A880]/15 text-[#A0725B]">
                        {item.projectType}
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
                  {item.locationUrl && (
                    <a
                      href={item.locationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-btn-outline !px-4"
                    >
                      <FaExternalLinkAlt className="inline mr-1" /> Map
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
                Project location
              </p>
              <h2 className="font-display text-2xl mt-1">
                {editing ? 'Edit location' : 'Add location'}
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
                  Location URL
                </label>
                <input
                  type="url"
                  value={formData.locationUrl}
                  onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                  className="cms-input"
                  placeholder="https://maps.google.com/..."
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
                  {saving ? 'Saving...' : editing ? 'Update location' : 'Save location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default ProjectLocationManagement;
