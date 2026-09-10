import React, { useEffect, useRef, useState } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFileAlt,
  FaBriefcase,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const API_BASE = 'http://localhost:5000';
const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
];

const emptyForm = {
  positionApplyingFor: '',
  fullName: '',
  email: '',
  phone: '',
  experienceYears: '',
  linkedinUrl: '',
  briefNote: '',
  consent: true,
  status: 'new',
};

const CareerManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState(null);
  const resumeInputRef = useRef(null);

  const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      let response = await fetch('/api/careers?limit=100');
      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/careers?limit=100`);
      }
      if (!response.ok) throw new Error('Failed to load career applications');
      const data = await response.json();
      setItems(data.applications || []);
    } catch (err) {
      setError(err.message || 'Failed to load career applications');
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
    setResumeFile(null);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        positionApplyingFor: item.positionApplyingFor || '',
        fullName: item.fullName || '',
        email: item.email || '',
        phone: item.phone || '',
        experienceYears: item.experienceYears || '',
        linkedinUrl: item.linkedinUrl || '',
        briefNote: item.briefNote || '',
        consent: item.consent !== false,
        status: item.status || 'new',
      });
      setResumeFile(null);
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
    if (
      !formData.positionApplyingFor.trim() ||
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.experienceYears.trim()
    ) {
      setError('Please fill all required fields');
      return;
    }
    if (!editing && !resumeFile) {
      setError('Resume / CV is required');
      return;
    }
    if (!formData.consent) {
      setError('Consent is required to submit the application');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('positionApplyingFor', formData.positionApplyingFor.trim());
      body.append('fullName', formData.fullName.trim());
      body.append('email', formData.email.trim());
      body.append('phone', formData.phone.trim());
      body.append('experienceYears', formData.experienceYears.trim());
      body.append('linkedinUrl', formData.linkedinUrl.trim());
      body.append('briefNote', formData.briefNote.trim());
      body.append('consent', formData.consent);
      body.append('status', formData.status);
      if (resumeFile) body.append('resume', resumeFile);

      const url = editing
        ? `${API_BASE}/api/careers/${editing._id}`
        : `${API_BASE}/api/careers`;
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save application');
      }

      closeModal();
      await fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save application');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete application from "${item.fullName}"?`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/careers/${item._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete application');
      setItems((prev) => prev.filter((row) => row._id !== item._id));
    } catch (err) {
      setError(err.message || 'Failed to delete application');
    }
  };

  const handleStatusChange = async (item, status) => {
    try {
      const response = await fetch(`${API_BASE}/api/careers/${item._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const result = await response.json();
      setItems((prev) =>
        prev.map((row) => (row._id === item._id ? { ...row, status: result.data.status } : row))
      );
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const filtered = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (item.fullName || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.phone || '').toLowerCase().includes(q) ||
      (item.positionApplyingFor || '').toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Applications', value: items.length, hint: 'All careers' },
    { label: 'New', value: items.filter((b) => b.status === 'new').length, hint: 'Unread' },
    {
      label: 'Shortlisted',
      value: items.filter((b) => b.status === 'shortlisted').length,
      hint: 'Selected',
    },
    { label: 'Showing', value: filtered.length, hint: 'Current filters' },
  ];

  const statusBadge = (status) => {
    const map = {
      new: 'bg-sky-50 text-sky-700',
      reviewed: 'bg-amber-50 text-amber-700',
      shortlisted: 'bg-emerald-50 text-emerald-700',
      rejected: 'bg-gray-100 text-gray-600',
    };
    return map[status] || map.new;
  };

  if (loading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading career applications...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Join Jhamtani"
          title="Career"
          subtitle="Manage job applications submitted from the careers form."
        >
          <button type="button" onClick={fetchItems} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openModal()} className="cms-btn-primary">
            <FaPlus className="w-3.5 h-3.5" />
            Add application
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, position..."
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
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
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
            icon={WorkOutlineIcon}
            title="No applications yet"
            message={
              searchTerm || filterStatus !== 'all'
                ? 'Nothing matches these filters.'
                : 'Career applications will appear here.'
            }
            action={
              <button type="button" onClick={() => openModal()} className="cms-btn-primary">
                <FaPlus className="w-3.5 h-3.5" />
                Add application
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
                    <FaBriefcase />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#191f26] truncate">{item.fullName}</h3>
                    <p className="text-sm text-[#5B584C] truncate">
                      {item.positionApplyingFor}
                    </p>
                    <p className="text-sm text-[#5B584C] mt-0.5">
                      {item.email} · {item.phone}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-gray-500">
                        Exp: {item.experienceYears}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full capitalize ${statusBadge(
                          item.status
                        )}`}
                      >
                        {item.status || 'new'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={item.status || 'new'}
                    onChange={(e) => handleStatusChange(item, e.target.value)}
                    className="cms-input !w-auto !py-2 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {item.resumeUrl && (
                    <a
                      href={formatUrl(item.resumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-btn-outline !px-4"
                    >
                      <FaFileAlt className="inline mr-1" /> Resume
                    </a>
                  )}
                  {item.linkedinUrl && (
                    <a
                      href={item.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cms-btn-outline !px-4"
                    >
                      <FaExternalLinkAlt className="inline mr-1" /> Profile
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
                Join Jhamtani
              </p>
              <h2 className="font-display text-2xl mt-1">
                {editing ? 'Edit application' : 'Add application'}
              </h2>
              {formData.positionApplyingFor && (
                <p className="text-sm text-white/70 mt-1">
                  Applying for: {formData.positionApplyingFor}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Position applying for <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.positionApplyingFor}
                  onChange={(e) =>
                    setFormData({ ...formData, positionApplyingFor: e.target.value })
                  }
                  className="cms-input"
                  placeholder="e.g. Assistant Manager – Sales & Business Development"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="cms-input"
                  placeholder="Your Full Name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="cms-input"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="cms-input"
                  placeholder="10-digit Mobile Number"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Experience (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceYears: e.target.value })
                  }
                  className="cms-input"
                  placeholder="e.g. 5 Years"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  LinkedIn / Portfolio URL
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="cms-input"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Upload resume / CV (PDF, DOCX) <span className="text-red-500">*</span>
                </label>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="cms-input"
                  required={!editing}
                />
                <p className="text-xs text-[#5B584C] mt-1">
                  PDF, DOC, DOCX · Max 10MB
                  {editing?.resumeUrl && !resumeFile
                    ? ' · Leave empty to keep current file'
                    : ''}
                </p>
                {resumeFile && (
                  <p className="text-xs text-[#A0725B] mt-1 truncate">{resumeFile.name}</p>
                )}
                {!resumeFile && editing?.resumeUrl && (
                  <a
                    href={formatUrl(editing.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#A0725B] underline mt-1 inline-block"
                  >
                    View current resume
                  </a>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Brief note / Why Jhamtani?
                </label>
                <textarea
                  value={formData.briefNote}
                  onChange={(e) => setFormData({ ...formData, briefNote: e.target.value })}
                  className="cms-input"
                  rows={3}
                  placeholder="Tell us briefly about yourself..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="cms-input cursor-pointer"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-start gap-2 text-sm text-[#5B584C]">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 accent-[#C5A880]"
                />
                <span>
                  I authorize Jhamtani and its representative to contact me with updates and
                  notifications via Email, SMS, WhatsApp, and Call. This will override the
                  registry on DND / NDNC.
                </span>
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
                  {saving
                    ? 'Saving...'
                    : editing
                      ? 'Update application'
                      : 'Submit application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default CareerManagement;
