import React, { useEffect, useRef, useState } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFileAlt,
  FaBriefcase,
  FaExternalLinkAlt,
  FaTimes,
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
const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship'];

const emptyApplicationForm = {
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

const emptyJobForm = {
  slug: '',
  title: '',
  department: '',
  location: '',
  type: 'Full Time',
  experience: '',
  description: '',
  responsibilities: [''],
  requirements: [''],
  isActive: true,
  order: 0,
};

const ListFieldEditor = ({ label, items, onChange, placeholder }) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[index] = e.target.value;
              onChange(next);
            }}
            className="cms-input flex-1"
            placeholder={placeholder}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="cms-btn-outline !px-3 !py-2"
              aria-label="Remove item"
            >
              <FaTimes />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="cms-btn-outline !px-4 !py-2 text-sm"
      >
        <FaPlus className="inline mr-1 w-3 h-3" /> Add item
      </button>
    </div>
  </div>
);

const CareerManagement = () => {
  const [activeTab, setActiveTab] = useState('applications');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyApplicationForm);
  const [resumeFile, setResumeFile] = useState(null);
  const resumeInputRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobFilterStatus, setJobFilterStatus] = useState('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobFormData, setJobFormData] = useState(emptyJobForm);
  const [jobSaving, setJobSaving] = useState(false);

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

  const fetchJobs = async () => {
    setJobsLoading(true);
    setError('');
    try {
      let response = await fetch('/api/career-jobs?limit=100');
      if (!response.ok) {
        response = await fetch(`${API_BASE}/api/career-jobs?limit=100`);
      }
      if (!response.ok) throw new Error('Failed to load job postings');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message || 'Failed to load job postings');
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchJobs();
  }, []);

  const resetForm = () => {
    setFormData(emptyApplicationForm);
    setEditing(null);
    setResumeFile(null);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const resetJobForm = () => {
    setJobFormData(emptyJobForm);
    setEditingJob(null);
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

  const openJobModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setJobFormData({
        slug: job.slug || '',
        title: job.title || '',
        department: job.department || '',
        location: job.location || '',
        type: job.type || 'Full Time',
        experience: job.experience || '',
        description: job.description || '',
        responsibilities:
          Array.isArray(job.responsibilities) && job.responsibilities.length
            ? job.responsibilities
            : [''],
        requirements:
          Array.isArray(job.requirements) && job.requirements.length ? job.requirements : [''],
        isActive: job.isActive !== false,
        order: job.order ?? 0,
      });
    } else {
      resetJobForm();
      setJobFormData((prev) => ({ ...prev, order: jobs.length }));
    }
    setShowJobModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    resetJobForm();
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

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const responsibilities = jobFormData.responsibilities.map((s) => s.trim()).filter(Boolean);
    const requirements = jobFormData.requirements.map((s) => s.trim()).filter(Boolean);

    if (
      !jobFormData.slug.trim() ||
      !jobFormData.title.trim() ||
      !jobFormData.department.trim() ||
      !jobFormData.location.trim() ||
      !jobFormData.experience.trim() ||
      !jobFormData.description.trim()
    ) {
      setError('Please fill all required fields');
      return;
    }
    if (!responsibilities.length) {
      setError('At least one responsibility is required');
      return;
    }
    if (!requirements.length) {
      setError('At least one requirement is required');
      return;
    }

    setJobSaving(true);
    setError('');
    try {
      const payload = {
        slug: jobFormData.slug.trim(),
        title: jobFormData.title.trim(),
        department: jobFormData.department.trim(),
        location: jobFormData.location.trim(),
        type: jobFormData.type,
        experience: jobFormData.experience.trim(),
        description: jobFormData.description.trim(),
        responsibilities,
        requirements,
        isActive: jobFormData.isActive,
        order: jobFormData.order,
      };

      const url = editingJob
        ? `${API_BASE}/api/career-jobs/${editingJob._id}`
        : `${API_BASE}/api/career-jobs`;
      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save job');
      }

      closeJobModal();
      await fetchJobs();
    } catch (err) {
      setError(err.message || 'Failed to save job');
    } finally {
      setJobSaving(false);
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

  const handleJobDelete = async (job) => {
    if (!window.confirm(`Delete job "${job.title}"?`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/career-jobs/${job._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete job');
      setJobs((prev) => prev.filter((row) => row._id !== job._id));
    } catch (err) {
      setError(err.message || 'Failed to delete job');
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

  const filteredJobs = jobs.filter((job) => {
    const q = jobSearchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (job.title || '').toLowerCase().includes(q) ||
      (job.department || '').toLowerCase().includes(q) ||
      (job.location || '').toLowerCase().includes(q) ||
      (job.slug || '').toLowerCase().includes(q);
    const matchesStatus =
      jobFilterStatus === 'all' ||
      (jobFilterStatus === 'active' && job.isActive !== false) ||
      (jobFilterStatus === 'inactive' && job.isActive === false);
    return matchesSearch && matchesStatus;
  });

  const applicationStats = [
    { label: 'Applications', value: items.length, hint: 'All careers' },
    { label: 'New', value: items.filter((b) => b.status === 'new').length, hint: 'Unread' },
    {
      label: 'Shortlisted',
      value: items.filter((b) => b.status === 'shortlisted').length,
      hint: 'Selected',
    },
    { label: 'Showing', value: filtered.length, hint: 'Current filters' },
  ];

  const jobStats = [
    { label: 'Job postings', value: jobs.length, hint: 'All roles' },
    { label: 'Active', value: jobs.filter((j) => j.isActive !== false).length, hint: 'Published' },
    { label: 'Inactive', value: jobs.filter((j) => j.isActive === false).length, hint: 'Hidden' },
    { label: 'Showing', value: filteredJobs.length, hint: 'Current filters' },
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

  const isPageLoading =
    activeTab === 'applications' ? loading : jobsLoading;

  if (isPageLoading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">
            {activeTab === 'applications'
              ? 'Loading career applications...'
              : 'Loading job postings...'}
          </p>
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
          subtitle={
            activeTab === 'applications'
              ? 'Manage job applications submitted from the careers form.'
              : 'Create and manage job postings shown on the careers page.'
          }
        >
          <button
            type="button"
            onClick={activeTab === 'applications' ? fetchItems : fetchJobs}
            className="cms-btn-outline"
          >
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          {activeTab === 'applications' ? (
            <button type="button" onClick={() => openModal()} className="cms-btn-primary">
              <FaPlus className="w-3.5 h-3.5" />
              Add application
            </button>
          ) : (
            <button type="button" onClick={() => openJobModal()} className="cms-btn-primary">
              <FaPlus className="w-3.5 h-3.5" />
              Create job
            </button>
          )}
        </PageHero>

        <div className="cms-card p-1.5 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'applications'
                ? 'bg-[#191f26] text-white'
                : 'text-[#5B584C] hover:bg-[#C5A880]/10'
            }`}
          >
            Applications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'jobs'
                ? 'bg-[#191f26] text-white'
                : 'text-[#5B584C] hover:bg-[#C5A880]/10'
            }`}
          >
            Job postings
          </button>
        </div>

        <StatCards items={activeTab === 'applications' ? applicationStats : jobStats} />

        {activeTab === 'applications' ? (
          <>
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
                        <p className="text-sm text-[#5B584C] truncate">{item.positionApplyingFor}</p>
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
          </>
        ) : (
          <>
            <div className="cms-card p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, department, location, job ID..."
                    value={jobSearchTerm}
                    onChange={(e) => setJobSearchTerm(e.target.value)}
                    className="cms-input pl-10"
                  />
                </div>
                <select
                  value={jobFilterStatus}
                  onChange={(e) => setJobFilterStatus(e.target.value)}
                  className="cms-input cursor-pointer"
                >
                  <option value="all">All jobs</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <EmptyState
                icon={WorkOutlineIcon}
                title="No job postings yet"
                message={
                  jobSearchTerm || jobFilterStatus !== 'all'
                    ? 'Nothing matches these filters.'
                    : 'Create your first job posting to display on the careers page.'
                }
                action={
                  <button type="button" onClick={() => openJobModal()} className="cms-btn-primary">
                    <FaPlus className="w-3.5 h-3.5" />
                    Create job
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <article
                    key={job._id}
                    className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-[#191f26] text-[#C5A880] flex items-center justify-center flex-shrink-0">
                        <FaBriefcase />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#191f26] truncate">{job.title}</h3>
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#C5A880]/15 text-[#A0725B]">
                            {job.slug}
                          </span>
                        </div>
                        <p className="text-sm text-[#5B584C] truncate">
                          {job.department} · {job.location}
                        </p>
                        <p className="text-sm text-[#5B584C] mt-0.5">
                          {job.type} · {job.experience}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[11px] px-2.5 py-1 rounded-full ${
                              job.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {job.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {Array.isArray(job.responsibilities) ? job.responsibilities.length : 0}{' '}
                            responsibilities ·{' '}
                            {Array.isArray(job.requirements) ? job.requirements.length : 0}{' '}
                            requirements
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => openJobModal(job)}
                        className="cms-btn-primary !px-4"
                      >
                        <FaEdit className="inline mr-1" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleJobDelete(job)}
                        className="cms-btn-outline !px-4"
                      >
                        <FaTrash className="inline mr-1" /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {error && (
          <div className="cms-card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
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

      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#191f26] px-6 py-5 text-white sticky top-0 z-10">
              <p className="text-[#C5A880] text-xs font-semibold tracking-[0.2em] uppercase">
                Join Jhamtani
              </p>
              <h2 className="font-display text-2xl mt-1">
                {editingJob ? 'Edit job posting' : 'Create job posting'}
              </h2>
              {jobFormData.title && (
                <p className="text-sm text-white/70 mt-1">{jobFormData.title}</p>
              )}
            </div>

            <form onSubmit={handleJobSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Job ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jobFormData.slug}
                    onChange={(e) => setJobFormData({ ...jobFormData, slug: e.target.value })}
                    className="cms-input"
                    placeholder="e.g. job-1"
                    required
                  />
                  <p className="text-xs text-[#5B584C] mt-1">Unique identifier used on the website</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Job type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jobFormData.type}
                    onChange={(e) => setJobFormData({ ...jobFormData, type: e.target.value })}
                    className="cms-input cursor-pointer"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Job title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobFormData.title}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  className="cms-input"
                  placeholder="e.g. Senior Project Architect & Design Lead"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jobFormData.department}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, department: e.target.value })
                    }
                    className="cms-input"
                    placeholder="e.g. Architecture & Design"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                    className="cms-input"
                    placeholder="e.g. Head Office – Balewadi, Pune"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobFormData.experience}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, experience: e.target.value })
                  }
                  className="cms-input"
                  placeholder="e.g. 5 - 8 Years"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={jobFormData.description}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, description: e.target.value })
                  }
                  className="cms-input"
                  rows={4}
                  placeholder="Brief overview of the role..."
                  required
                />
              </div>

              <ListFieldEditor
                label="Responsibilities"
                items={jobFormData.responsibilities}
                onChange={(responsibilities) =>
                  setJobFormData({ ...jobFormData, responsibilities })
                }
                placeholder="e.g. Collaborate with principal designers..."
              />

              <ListFieldEditor
                label="Requirements"
                items={jobFormData.requirements}
                onChange={(requirements) => setJobFormData({ ...jobFormData, requirements })}
                placeholder="e.g. B.Arch / M.Arch from a recognized institute."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Display order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={jobFormData.order}
                    onChange={(e) =>
                      setJobFormData({ ...jobFormData, order: Number(e.target.value) || 0 })
                    }
                    className="cms-input"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-[#5B584C] pb-2.5">
                    <input
                      type="checkbox"
                      checked={jobFormData.isActive}
                      onChange={(e) =>
                        setJobFormData({ ...jobFormData, isActive: e.target.checked })
                      }
                      className="accent-[#C5A880]"
                    />
                    Active (visible on careers page)
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-[#C5A880]/20">
                <button type="button" onClick={closeJobModal} className="cms-btn-outline">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={jobSaving}
                  className="cms-btn-primary disabled:opacity-50"
                >
                  {jobSaving ? 'Saving...' : editingJob ? 'Update job' : 'Create job'}
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
