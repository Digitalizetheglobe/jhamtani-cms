import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  CircularProgress, Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterForm, setFilterForm] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/forms/forms');
      if (!response.ok) {
        throw new Error('Failed to load forms');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setForms(result.data);

        const allSubmissions = [];
        result.data.forEach((form) => {
          if (form.submissions && Array.isArray(form.submissions)) {
            const submissionsWithFormInfo = form.submissions.map((submission) => ({
              ...submission,
              formId: form._id,
              formTitle: form.title || 'Untitled Form',
              formPage: form.page || 'Unknown Page',
              formDescription: form.description || '',
              formIsActive: form.isActive,
              formFields: form.fields || [],
            }));
            allSubmissions.push(...submissionsWithFormInfo);
          }
        });

        allSubmissions.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setLeads(allSubmissions);
      } else {
        setForms([]);
        setLeads([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getAllFieldNames = () => {
    const fieldNames = new Set();
    leads.forEach((lead) => {
      if (lead.data) {
        Object.keys(lead.data).forEach((key) => fieldNames.add(key));
      }
    });
    return Array.from(fieldNames);
  };

  const getAllFormTitles = () => {
    return forms.map((form) => form.title || 'Untitled Form');
  };

  const getLeadPreview = (lead) => {
    const data = lead.data || {};
    const entries = Object.entries(data);
    const pick = (re) => {
      const hit = entries.find(([k]) => re.test(k));
      return hit ? String(hit[1]) : '';
    };
    return {
      name: pick(/name/i) || 'Website enquiry',
      email: pick(/email/i),
      phone: pick(/phone|mobile|whatsapp|tel/i),
    };
  };

  const filteredLeads = leads.filter((lead) => {
    if (!lead.data) return false;

    const searchMatch =
      Object.values(lead.data).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (lead.formTitle && lead.formTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.formPage && lead.formPage.toLowerCase().includes(searchTerm.toLowerCase()));

    const formMatch = filterForm === 'all' || lead.formTitle === filterForm;
    const statusMatch =
      filterStatus === 'all' ||
      (filterStatus === 'active' && lead.formIsActive) ||
      (filterStatus === 'inactive' && !lead.formIsActive);

    const createdAt = lead.createdAt ? new Date(lead.createdAt) : null;
    let dateMatch = true;

    if (startDate) {
      const start = new Date(startDate);
      dateMatch = dateMatch && createdAt && createdAt >= start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      dateMatch = dateMatch && createdAt && createdAt < end;
    }

    return searchMatch && formMatch && statusMatch && dateMatch;
  });

  const handleFilterByDate = (dateString) => {
    setStartDate(dateString);
    setEndDate(dateString);
  };

  const openLeadDetail = (lead) => {
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };

  const closeLeadDetail = () => {
    setDetailDialogOpen(false);
    setSelectedLead(null);
  };

  const openDeleteDialog = (lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setLeadToDelete(null);
  };

  const confirmDelete = async () => {
    if (!leadToDelete || !leadToDelete._id) {
      setError('Invalid lead selected for deletion');
      closeDeleteDialog();
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/forms/submissions/${leadToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete lead');
      }

      setLeads(leads.filter((l) => l._id !== leadToDelete._id));
      closeDeleteDialog();
    } catch (err) {
      setError(err.message || 'Failed to delete lead. Please try again.');
      closeDeleteDialog();
    }
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) return;

    const fieldNames = getAllFieldNames();
    const csvHeaders = [
      'Form Title',
      'Form Page',
      'Form Description',
      'Form Status',
      'Form ID',
      'Submission Date',
      'IP Address',
      ...fieldNames.map((field) => field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())),
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...filteredLeads.map((lead) => {
        const row = [
          `"${(lead.formTitle || 'Untitled Form').replace(/"/g, '""')}"`,
          `"${(lead.formPage || 'Unknown').replace(/"/g, '""')}"`,
          `"${(lead.formDescription || 'No description').replace(/"/g, '""')}"`,
          `"${lead.formIsActive ? 'Active' : 'Inactive'}"`,
          `"${(lead.formId || 'N/A').replace(/"/g, '""')}"`,
          `"${new Date(lead.createdAt).toLocaleString().replace(/"/g, '""')}"`,
          `"${(lead.ipAddress || 'N/A').replace(/"/g, '""')}"`,
          ...fieldNames.map((field) => {
            const value = lead.data[field] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
          }),
        ];
        return row.join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Submissions', value: leads.length, hint: 'All enquiries' },
    { label: 'Showing', value: filteredLeads.length, hint: 'Current filters' },
    { label: 'Active forms', value: forms.filter((form) => form.isActive).length, hint: 'Live on site' },
    { label: 'Total forms', value: forms.length, hint: 'Form builder' },
  ];

  if (loading && leads.length === 0) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading enquiries...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Quick Enquiry"
          title="Website leads"
          subtitle="Submissions from contact and enquiry forms on jhamtani.netlify.app"
        >
          <button type="button" onClick={fetchLeads} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            disabled={filteredLeads.length === 0}
            className="cms-btn-primary"
          >
            <DownloadIcon className="w-4 h-4" />
            Export CSV
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3"
          >
            <div className="relative sm:col-span-2 xl:col-span-2">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search name, email, phone, form..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cms-input pl-10"
              />
            </div>
            <select
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
              className="cms-input cursor-pointer"
            >
              <option value="all">All forms</option>
              {getAllFormTitles().map((formTitle) => (
                <option key={formTitle} value={formTitle}>
                  {formTitle}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="cms-input cursor-pointer"
            >
              <option value="all">All status</option>
              <option value="active">Active forms</option>
              <option value="inactive">Inactive forms</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="cms-input"
              title="From date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="cms-input"
              title="To date"
            />
          </form>
        </div>

        {error && (
          <Alert severity="error" className="rounded-xl" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {filteredLeads.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="No enquiries yet"
            message={
              searchTerm || filterForm !== 'all' || filterStatus !== 'all' || startDate || endDate
                ? 'Nothing matches these filters. Clear search or dates and try again.'
                : 'Leads from the public website will appear here when someone submits a form.'
            }
            action={
              <Link to="/form-management" className="cms-btn-primary">
                Open form builder
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead, index) => {
              const preview = getLeadPreview(lead);
              return (
                <article
                  key={lead._id || index}
                  className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#C5A880]/20 text-[#A0725B] flex items-center justify-center font-semibold flex-shrink-0">
                      {preview.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#191f26] truncate">{preview.name}</h3>
                      <p className="text-sm text-[#5B584C] truncate">
                        {[preview.email, preview.phone].filter(Boolean).join(' · ') || 'No contact fields'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#f5f3ef] text-[#5B584C] border border-[#C5A880]/25">
                          {lead.formTitle || 'Form'}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full ${
                            lead.formIsActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {lead.formIsActive ? 'Active form' : 'Inactive form'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-6">
                    <button
                      type="button"
                      onClick={() =>
                        handleFilterByDate(
                          lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : ''
                        )
                      }
                      className="text-left text-xs text-[#A0725B] hover:underline"
                    >
                      {lead.createdAt
                        ? `${new Date(lead.createdAt).toLocaleDateString()} · ${new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'No date'}
                    </button>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openLeadDetail(lead)} className="cms-btn-outline !px-4">
                        <VisibilityIcon className="w-4 h-4" />
                        View
                      </button>
                      <button type="button" onClick={() => openDeleteDialog(lead)} className="cms-btn-outline !px-4">
                        <DeleteIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={detailDialogOpen}
        onClose={closeLeadDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: '!rounded-2xl' }}
      >
        <DialogTitle className="!font-display !text-2xl text-[#191f26]">Enquiry details</DialogTitle>
        <DialogContent>
          {selectedLead && (
            <div className="space-y-5 pt-2">
              <div className="bg-[#f5f3ef] p-4 rounded-xl">
                <p className="text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-3">Form</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="block text-[#5B584C] text-xs">Title</span>
                    <span className="font-semibold text-[#191f26]">{selectedLead.formTitle || 'Untitled Form'}</span>
                  </div>
                  <div>
                    <span className="block text-[#5B584C] text-xs">Page</span>
                    <span className="font-semibold text-[#191f26]">{selectedLead.formPage || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="block text-[#5B584C] text-xs">Status</span>
                    <span className="font-semibold text-[#191f26]">
                      {selectedLead.formIsActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#5B584C] text-xs">Submitted</span>
                    <span className="font-semibold text-[#191f26]">
                      {new Date(selectedLead.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedLead.data && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-3">Lead data</p>
                  <div className="space-y-3">
                    {Object.entries(selectedLead.data).map(([key, value]) => {
                      const field = selectedLead.formFields?.find((f) => f.name === key);
                      const label =
                        field?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                      return (
                        <div key={key} className="border-b border-[#C5A880]/20 pb-3">
                          <p className="text-xs text-[#5B584C]">{label}</p>
                          <p className="text-[#191f26] mt-0.5">{String(value) || '(Empty)'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions className="!p-4 !border-t !border-[#C5A880]/20">
          <button type="button" onClick={closeLeadDetail} className="cms-btn-primary">
            Close
          </button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        PaperProps={{ className: '!rounded-2xl' }}
      >
        <DialogTitle className="!text-lg !font-semibold text-[#191f26]">Delete enquiry</DialogTitle>
        <DialogContent>
          <DialogContentText className="!text-[#5B584C]">
            Remove this lead permanently? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4 gap-2">
          <button type="button" onClick={closeDeleteDialog} className="cms-btn-outline">
            Cancel
          </button>
          <button type="button" onClick={confirmDelete} className="cms-btn-primary">
            Delete
          </button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
};

export default LeadsManagement;
