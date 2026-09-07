import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const FormManagementDashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // Fetch all forms
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:5000/api/forms/forms');
        if (!response.ok) {
          throw new Error('Failed to load forms');
        }

        const data = await response.json();
        setForms(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  // Filter forms based on search and filter
  const safeForms = Array.isArray(forms) ? forms : [];
  const filteredForms = safeForms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.page.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && form.isActive) ||
      (filter === 'inactive' && !form.isActive);
    return matchesSearch && matchesFilter;
  });

  // Delete form
  const openDeleteDialog = (form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/forms/forms/${formToDelete._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete form');
      }

      // Remove from list
      setForms(forms.filter(f => f._id !== formToDelete._id));
      closeDeleteDialog();
    } catch (err) {
      setError(err.message);
      closeDeleteDialog();
    }
  };

  const stats = [
    { label: 'Forms', value: safeForms.length, hint: 'All builders' },
    { label: 'Active', value: safeForms.filter((f) => f.isActive).length, hint: 'Live on site' },
    { label: 'Inactive', value: safeForms.filter((f) => !f.isActive).length, hint: 'Hidden' },
    { label: 'Showing', value: filteredForms.length, hint: 'Current filters' },
  ];

  if (loading && forms.length === 0) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading forms...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
      <PageHero
        kicker="Form Builder"
        title="Website forms"
        subtitle="Create, manage, and track enquiry forms on the public site."
      >
        <button type="button" onClick={() => navigate('/leads-management')} className="cms-btn-outline">
          View leads
        </button>
        <button type="button" onClick={() => navigate('/form-management/create')} className="cms-btn-primary">
          <AddIcon className="w-4 h-4" />
          Create form
        </button>
      </PageHero>

      <StatCards items={stats} />

      <div className="cms-card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search forms..."
              className="cms-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="cms-input cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All forms</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="rounded-xl" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <EmptyState
          icon={DescriptionIcon}
          title="No forms yet"
          message={
            searchTerm || filter !== 'all'
              ? 'Nothing matches these filters. Clear search and try again.'
              : 'Create the first enquiry form for the public site.'
          }
          action={
            <button type="button" onClick={() => navigate('/form-management/create')} className="cms-btn-primary">
              <AddIcon className="w-4 h-4" />
              Create form
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredForms.map((form) => (
            <article
              key={form._id}
              className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#191f26] truncate">{form.title}</h3>
                <p className="text-sm text-[#5B584C] mt-0.5">Page: {form.page}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full ${
                      form.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {form.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {form.fields.length} {form.fields.length === 1 ? 'field' : 'fields'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/form-management/preview/${form._id}`)}
                  className="cms-btn-outline !px-4"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/form-management/submissions/${form._id}`)}
                  className="cms-btn-outline !px-4"
                >
                  Submissions
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/form-management/edit/${form._id}`)}
                  className="cms-btn-primary !px-4"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteDialog(form)}
                  className="cms-btn-outline !px-4"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        PaperProps={{ className: '!rounded-2xl' }}
      >
        <DialogTitle className="!text-lg !font-semibold text-[#191f26]">
          Delete form
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="!text-[#5B584C]">
            Remove "{formToDelete?.title}" and all its submissions? This cannot be undone.
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
      </div>
    </PageShell>
  );
};

export default FormManagementDashboard;
