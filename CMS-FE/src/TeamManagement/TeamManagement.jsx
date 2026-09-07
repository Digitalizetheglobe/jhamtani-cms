import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  CircularProgress, Alert, Avatar, Switch, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

/**
 * TeamManagement Component
 * 
 * Features:
 * - CRUD operations for team members
 * - LinkedIn URL validation with real-time feedback
 * - URL normalization (auto-adds https://, converts http to https)
 * - Supports various LinkedIn URL formats (in/, pub/, with/without www)
 * - Visual validation indicators
 */

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    designation: '',
    description: '',
    linkedinUrl: '',
    isActive: true
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [linkedinUrlError, setLinkedinUrlError] = useState('');

  // Fetch team members from API
  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/team');
      if (!response.ok) {
        throw new Error('Failed to load team members');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setTeamMembers(result.data);
      } else {
        setTeamMembers([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Filter team members based on search and filter
  const filteredMembers = teamMembers.filter(member => {
    // Add null checks to prevent errors
    if (!member || !member.fullName || !member.designation) {
      return false;
    }

    const searchMatch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = filterStatus === 'all' ||
      (filterStatus === 'active' && member.isActive) ||
      (filterStatus === 'inactive' && !member.isActive);

    return searchMatch && statusMatch;
  });

  // Open member detail dialog
  const openMemberDetail = (member) => {
    setSelectedMember(member);
    setDetailDialogOpen(true);
  };

  // Close member detail dialog
  const closeMemberDetail = () => {
    setDetailDialogOpen(false);
    setSelectedMember(null);
  };

  // Open delete dialog
  const openDeleteDialog = (member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  // Open form dialog for create/edit
  const openFormDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        fullName: member.fullName,
        designation: member.designation,
        description: member.description || '',
        linkedinUrl: member.linkedinUrl || '',
        isActive: member.isActive
      });
      setPhotoPreview(member.photo ? `http://localhost:5000/uploads/team/${member.photo}` : null);
    } else {
      setEditingMember(null);
      setFormData({
        fullName: '',
        designation: '',
        description: '',
        linkedinUrl: '',
        isActive: true
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setFormDialogOpen(true);
  };

  // Close form dialog
  const closeFormDialog = () => {
    setFormDialogOpen(false);
    setEditingMember(null);
    setFormData({
      fullName: '',
      designation: '',
      description: '',
      linkedinUrl: '',
      isActive: true
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setLinkedinUrlError('');
  };

  // Handle photo file change
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate LinkedIn URL
  const validateLinkedInUrl = (url) => {
    if (!url) return true; // Allow empty URLs
    if (url.trim() === '') return true; // Allow empty URLs after trimming

    // More flexible pattern that accepts various LinkedIn URL formats
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9\-_]+\/?(\?.*)?$/;
    return linkedinPattern.test(url.trim());
  };

  // Normalize LinkedIn URL
  const normalizeLinkedInUrl = (url) => {
    if (!url) return url;

    // Remove leading/trailing whitespace
    let normalized = url.trim();

    // Add https:// if no protocol is specified
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }

    // Ensure it starts with https:// (LinkedIn requires HTTPS)
    if (normalized.startsWith('http://')) {
      normalized = normalized.replace('http://', 'https://');
    }

    return normalized;
  };

  // Handle LinkedIn URL change with validation
  const handleLinkedInUrlChange = (e) => {
    const url = e.target.value;
    const normalizedUrl = normalizeLinkedInUrl(url);
    setFormData({ ...formData, linkedinUrl: normalizedUrl });

    if (normalizedUrl && !validateLinkedInUrl(normalizedUrl)) {
      setLinkedinUrlError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)');
    } else {
      setLinkedinUrlError('');
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate LinkedIn URL before submission
    if (formData.linkedinUrl && !validateLinkedInUrl(formData.linkedinUrl)) {
      setLinkedinUrlError('Please provide a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)');
      return;
    }

    // Normalize the LinkedIn URL before submission
    const normalizedFormData = {
      ...formData,
      linkedinUrl: normalizeLinkedInUrl(formData.linkedinUrl)
    };

    try {
      let response;

      if (photoFile) {
        // Upload with photo
        const formDataToSend = new FormData();
        formDataToSend.append('photo', photoFile);
        formDataToSend.append('fullName', formData.fullName);
        formDataToSend.append('designation', formData.designation);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('linkedinUrl', normalizedFormData.linkedinUrl);
        formDataToSend.append('isActive', formData.isActive);

        response = await fetch(`http://localhost:5000/api/team${editingMember ? `/${editingMember._id}` : ''}`, {
          method: editingMember ? 'PUT' : 'POST',
          body: formDataToSend
        });
      } else {
        // Upload without photo
        response = await fetch(`http://localhost:5000/api/team${editingMember ? `/${editingMember._id}` : ''}`, {
          method: editingMember ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(normalizedFormData)
        });
      }

      const result = await response.json();

      if (result.success) {
        closeFormDialog();
        fetchTeamMembers();
        setError(null); // Clear any previous errors
      } else {
        setError(result.message || 'Failed to save team member');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/team/${memberToDelete._id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setTeamMembers(teamMembers.filter(m => m._id !== memberToDelete._id));
        closeDeleteDialog();
      } else {
        setError(result.message || 'Failed to delete team member');
      }
    } catch (err) {
      setError(err.message);
      closeDeleteDialog();
    }
  };
  // Toggle active status
  const toggleStatus = async (member) => {
    try {
      const response = await fetch(`http://localhost:5000/api/team/${member._id}/toggle-status`, {
        method: 'PATCH'
      });

      const result = await response.json();

      if (result.success) {
        setTeamMembers(teamMembers.map(m =>
          m._id === member._id ? { ...m, isActive: result.data.isActive } : m
        ));
      } else {
        setError(result.message || 'Failed to toggle status');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && teamMembers.length === 0) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading team...</p>
        </div>
      </PageShell>
    );
  }

  const stats = [
    { label: 'Members', value: teamMembers.length, hint: 'All profiles' },
    { label: 'Active', value: teamMembers.filter((m) => m.isActive).length, hint: 'Visible on site' },
    { label: 'Inactive', value: teamMembers.filter((m) => !m.isActive).length, hint: 'Hidden' },
    { label: 'Showing', value: filteredMembers.length, hint: 'Current filters' },
  ];

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Our People"
          title="Team"
          subtitle="Manage team members and their profiles for the public site."
        >
          <button type="button" onClick={fetchTeamMembers} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openFormDialog()} className="cms-btn-primary">
            <AddIcon className="w-4 h-4" />
            Add member
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or designation..."
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
              <option value="all">All members</option>
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

        {filteredMembers.length === 0 ? (
          <EmptyState
            icon={PersonIcon}
            title="No team members yet"
            message={
              searchTerm || filterStatus !== 'all'
                ? 'Nothing matches these filters. Clear search and try again.'
                : 'Add the first profile to show on the public website.'
            }
            action={
              <button type="button" onClick={() => openFormDialog()} className="cms-btn-primary">
                <AddIcon className="w-4 h-4" />
                Add member
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <article
                key={member._id}
                className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar
                    src={member.photo ? `http://localhost:5000/uploads/team/${member.photo}` : undefined}
                    className="!w-12 !h-12 !bg-[#C5A880]/20 !text-[#A0725B]"
                  >
                    {member.fullName ? member.fullName.charAt(0) : '?'}
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#191f26] truncate">{member.fullName}</h3>
                    <p className="text-sm text-[#5B584C] truncate">{member.designation}</p>
                    {member.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{member.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full ${
                          member.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Hidden'}
                      </span>
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#A0725B] hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => openMemberDetail(member)} className="cms-btn-outline !px-4">
                    <VisibilityIcon className="w-4 h-4" />
                    View
                  </button>
                  <button type="button" onClick={() => openFormDialog(member)} className="cms-btn-primary !px-4">
                    <EditIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button type="button" onClick={() => openDeleteDialog(member)} className="cms-btn-outline !px-4">
                    <DeleteIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={detailDialogOpen}
        onClose={closeMemberDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: '!rounded-2xl' }}
      >
        <DialogTitle className="!font-display !text-2xl text-[#191f26]">
          Team member details
        </DialogTitle>
        <DialogContent>
          {selectedMember && (
            <div className="space-y-5 pt-2">
              <div className="bg-[#f5f3ef] p-4 rounded-xl flex items-center gap-4">
                <Avatar
                  src={selectedMember.photo ? `http://localhost:5000/uploads/team/${selectedMember.photo}` : undefined}
                  className="!w-16 !h-16 !bg-[#C5A880]/20 !text-[#A0725B]"
                >
                  {selectedMember.fullName ? selectedMember.fullName.charAt(0) : '?'}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-[#191f26] text-lg">
                    {selectedMember.fullName || 'Unknown Name'}
                  </h3>
                  <p className="text-sm text-[#5B584C]">
                    {selectedMember.designation || 'Unknown Designation'}
                  </p>
                  <span
                    className={`mt-2 inline-flex text-[11px] px-2.5 py-1 rounded-full ${
                      selectedMember.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedMember.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-[#5B584C] text-xs uppercase tracking-wider font-semibold">Full name</span>
                  <span className="font-semibold text-[#191f26]">{selectedMember.fullName || 'Not provided'}</span>
                </div>
                <div>
                  <span className="block text-[#5B584C] text-xs uppercase tracking-wider font-semibold">Designation</span>
                  <span className="font-semibold text-[#191f26]">{selectedMember.designation || 'Not provided'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[#5B584C] text-xs uppercase tracking-wider font-semibold">Description</span>
                  <span className="text-[#191f26]">{selectedMember.description || 'Not provided'}</span>
                </div>
                <div>
                  <span className="block text-[#5B584C] text-xs uppercase tracking-wider font-semibold">LinkedIn</span>
                  {selectedMember.linkedinUrl ? (
                    <a
                      href={selectedMember.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#A0725B] hover:underline"
                    >
                      View profile
                    </a>
                  ) : (
                    <span className="text-[#191f26]">Not provided</span>
                  )}
                </div>
                <div>
                  <span className="block text-[#5B584C] text-xs uppercase tracking-wider font-semibold">Created</span>
                  <span className="font-semibold text-[#191f26]">
                    {selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="!p-4 !border-t !border-[#C5A880]/20">
          <button type="button" onClick={closeMemberDetail} className="cms-btn-primary">
            Close
          </button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={formDialogOpen}
        onClose={closeFormDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: '!rounded-2xl' }}
      >
        <DialogTitle className="!font-display !text-2xl text-[#191f26]">
          {editingMember ? 'Edit team member' : 'Add team member'}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4">
                <Avatar src={photoPreview} className="!w-20 !h-20 !bg-[#C5A880]/20 !text-[#A0725B]">
                  <PhotoCameraIcon />
                </Avatar>
                <div>
                  <input
                    accept="image/*"
                    type="file"
                    id="photo-upload"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label htmlFor="photo-upload" className="cms-btn-outline inline-flex cursor-pointer">
                    <PhotoCameraIcon className="w-4 h-4" />
                    Upload photo
                  </label>
                  <p className="text-xs text-[#5B584C] mt-1">
                    {editingMember ? 'Leave empty to keep current photo' : 'Photo is required for new members'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Full name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="cms-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="cms-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="cms-input"
                  rows={3}
                  placeholder="Brief description about the team member..."
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={handleLinkedInUrlChange}
                  className={`cms-input ${linkedinUrlError ? 'border-red-400' : ''}`}
                  placeholder="https://linkedin.com/in/username"
                />
                <p className={`text-xs mt-1 ${linkedinUrlError ? 'text-red-600' : 'text-[#5B584C]'}`}>
                  {linkedinUrlError
                    || (formData.linkedinUrl && validateLinkedInUrl(formData.linkedinUrl)
                      ? 'Valid LinkedIn URL'
                      : 'Optional: Enter a valid LinkedIn profile URL')}
                </p>
              </div>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#C5A880' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#C5A880' },
                    }}
                  />
                }
                label="Active member"
              />
            </div>
          </DialogContent>
          <DialogActions className="!p-4 !border-t !border-[#C5A880]/20 gap-2">
            <button type="button" onClick={closeFormDialog} className="cms-btn-outline">
              Cancel
            </button>
            <button type="submit" className="cms-btn-primary">
              {editingMember ? 'Update' : 'Create'}
            </button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        PaperProps={{ className: '!rounded-2xl' }}
      >
        <DialogTitle className="!text-lg !font-semibold text-[#191f26]">
          Delete team member
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="!text-[#5B584C]">
            Remove "{memberToDelete?.fullName || 'this team member'}" permanently? This cannot be undone.
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

export default TeamManagement;
