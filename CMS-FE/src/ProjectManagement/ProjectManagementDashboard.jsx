import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  HomeWork as HomeWorkIcon,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  getProjects,
  deleteProject,
  toggleProjectStatus,
  getApiBaseUrl,
} from '../api/projectApi';
import PageShell from '../components/PageShell';
import { PageHero, StatCards } from '../components/PageHero';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'residential', label: 'Residential' },
  { id: 'villas', label: 'Villas' },
  { id: 'studios', label: 'Studios' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'xo-series', label: 'XO Series' },
];

const ProjectManagementDashboard = () => {
  const navigate = useNavigate();
  const baseUrl = getApiBaseUrl();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [previewProject, setPreviewProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjectList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProjects({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        isActive: selectedStatus !== 'all' ? selectedStatus : undefined,
      });

      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectList();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjectList();
  };

  const handleToggleStatus = async (project) => {
    try {
      const res = await toggleProjectStatus(project._id);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === project._id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle project status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      setIsDeleting(true);
      const res = await deleteProject(projectToDelete._id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
        setProjectToDelete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatImageUrl = (url) => {
    if (!url) return '/placeholder.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'villas':
        return { label: 'Villas', classes: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'studios':
        return { label: 'Studios', classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'residential':
        return { label: 'Residential', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'commercial':
        return { label: 'Commercial', classes: 'bg-[#191f26] text-[#C5A880] border-[#191f26]' };
      case 'xo-series':
        return { label: 'XO Series', classes: 'bg-[#C5A880]/20 text-[#A0725B] border-[#C5A880]/40' };
      default:
        return { label: category || 'General', classes: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const stats = [
    { label: 'Projects', value: projects.length, hint: 'Current list' },
    { label: 'Live', value: projects.filter((p) => p.isActive).length, hint: 'Visible on site' },
    { label: 'Draft', value: projects.filter((p) => !p.isActive).length, hint: 'Hidden' },
    { label: 'Category', value: selectedCategory === 'all' ? 'All' : selectedCategory, hint: 'Active tab' },
  ];

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="The Iconic Lifestyles"
          title="Projects"
          subtitle="ACE homes, XO Series, studios, and commercial listings."
        >
          <button type="button" onClick={fetchProjectList} className="cms-btn-outline">
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button type="button" onClick={() => navigate('/project-management/create')} className="cms-btn-primary">
            <AddIcon className="w-4 h-4" />
            Add project
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-tabs">
          {CATEGORY_TABS.map((tab) => {
            const count =
              tab.id === 'all'
                ? projects.length
                : projects.filter((p) => p.category === tab.id).length;
            const isSelected = selectedCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#C5A880] text-[#191f26] shadow-sm'
                    : 'bg-white text-[#191f26] border border-[#C5A880]/30 hover:border-[#C5A880]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-[#A0725B] text-white' : 'bg-[#f5f3ef] text-[#5B584C]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="cms-card p-3 sm:p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search title, location, or size..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cms-input pl-10"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="cms-input sm:w-52 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>

            <button type="submit" className="cms-btn-ink w-full sm:w-auto">
              Filter
            </button>
          </form>
        </div>

        {error && (
          <Alert severity="error" className="rounded-xl shadow-sm" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="cms-card p-16 flex flex-col items-center justify-center">
            <CircularProgress sx={{ color: '#C5A880' }} />
            <p className="mt-4 text-[#5B584C] text-sm font-medium">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="cms-card border-dashed p-10 sm:p-12 text-center">
            <div className="w-16 h-16 bg-[#C5A880]/15 rounded-full flex items-center justify-center mx-auto mb-4 text-[#A0725B]">
              <HomeWorkIcon className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl text-[#191f26] mb-1">No Projects Found</h3>
            <p className="text-[#5B584C] text-sm max-w-md mx-auto mb-6">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'No listing matches these filters. Try a different category or search.'
                : 'Add your first project card for the public website.'}
            </p>
            <button
              onClick={() => navigate('/project-management/create')}
              className="cms-btn-primary"
            >
              <AddIcon className="w-5 h-5" />
              <span>Add Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
            <AnimatePresence>
              {projects.map((project, index) => {
                const categoryBadge = getCategoryBadge(project.category);

                return (
                  <motion.article
                    key={project._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22, delay: index * 0.04 }}
                    className="cms-card overflow-hidden flex flex-col group"
                  >
                    <div className="relative aspect-[4/5] sm:aspect-[4/5] w-full bg-[#191f26] overflow-hidden">
                      <img
                        src={formatImageUrl(project.image)}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#191f26] via-[#191f26]/25 to-transparent" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md ${categoryBadge.classes}`}
                        >
                          {categoryBadge.label}
                        </span>
                        <button
                          onClick={() => handleToggleStatus(project)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border transition cursor-pointer ${
                            project.isActive
                              ? 'bg-emerald-500/90 text-white border-emerald-600'
                              : 'bg-black/50 text-white/80 border-white/20'
                          }`}
                          title="Toggle active status"
                        >
                          {project.isActive ? (
                            <>
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <CancelIcon className="w-3.5 h-3.5" />
                              Hidden
                            </>
                          )}
                        </button>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white">
                        <h3 className="font-display text-2xl leading-tight">{project.title}</h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                          <LocationIcon className="w-4 h-4 text-[#C5A880]" />
                          <span className="truncate">{project.location}</span>
                        </p>
                        {project.naStatus && (
                          <p className="mt-2 text-xs tracking-wide text-[#C5A880] uppercase">
                            {project.naStatus}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-[#f5f3ef] px-3 py-2">
                          <span className="block text-[10px] uppercase tracking-wide text-[#5B584C]">Size</span>
                          <span className="font-semibold text-[#191f26] truncate block">
                            {project.plotSize || '—'}
                          </span>
                        </div>
                        <div className="rounded-lg bg-[#f5f3ef] px-3 py-2">
                          <span className="block text-[10px] uppercase tracking-wide text-[#5B584C]">Route</span>
                          <span className="font-semibold text-[#A0725B] truncate block">
                            {project.pageLink || 'None'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          onClick={() => setPreviewProject(project)}
                          className="flex items-center gap-1 text-xs text-[#5B584C] hover:text-[#191f26] px-2 py-1.5 rounded-lg hover:bg-[#f5f3ef] transition cursor-pointer"
                        >
                          <VisibilityIcon className="w-4 h-4" />
                          Preview
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/project-management/edit/${project._id}`)}
                            className="flex items-center gap-1 text-xs text-[#191f26] bg-[#C5A880]/15 hover:bg-[#C5A880]/30 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setProjectToDelete(project)}
                            className="flex items-center gap-1 text-xs text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                          >
                            <DeleteIcon className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {previewProject && (
        <Dialog
          open={Boolean(previewProject)}
          onClose={() => setPreviewProject(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ className: '!bg-white !text-gray-900 !rounded-2xl !p-2 !shadow-2xl' }}
        >
          <DialogTitle className="!text-xl !font-bold flex justify-between items-center !border-b !border-gray-100 !pb-3 gap-3">
            <span className="font-display text-2xl text-[#191f26]">{previewProject.title}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryBadge(previewProject.category).classes}`}>
              {getCategoryBadge(previewProject.category).label}
            </span>
          </DialogTitle>
          <DialogContent className="space-y-4 !pt-4">
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#191f26]">
              <img
                src={formatImageUrl(previewProject.image)}
                alt={previewProject.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-[#f5f3ef] p-4 rounded-xl">
              <div>
                <span className="text-[#5B584C] text-xs block font-medium">Location</span>
                <span className="text-[#191f26] font-semibold">{previewProject.location}</span>
              </div>
              <div>
                <span className="text-[#5B584C] text-xs block font-medium">Status</span>
                <span className="text-[#191f26] font-semibold">{previewProject.status}</span>
              </div>
              <div>
                <span className="text-[#5B584C] text-xs block font-medium">Size</span>
                <span className="text-[#A0725B] font-semibold">{previewProject.plotSize}</span>
              </div>
              <div>
                <span className="text-[#5B584C] text-xs block font-medium">Type</span>
                <span className="text-[#191f26] font-semibold">{previewProject.naStatus}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#5B584C] text-xs block font-medium">Page Link</span>
                <span className="text-[#A0725B] font-mono text-xs break-all">
                  {previewProject.pageLink || 'None'}
                </span>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="!p-4 !border-t !border-gray-100">
            <button onClick={() => setPreviewProject(null)} className="cms-btn-ink">
              Close
            </button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog
        open={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        PaperProps={{ className: '!bg-white !text-gray-900 !rounded-2xl !p-2 !shadow-2xl' }}
      >
        <DialogTitle className="!text-lg !font-bold text-red-700">Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText className="!text-gray-600">
            Delete{' '}
            <strong className="text-gray-900">"{projectToDelete?.title}"</strong>? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4">
          <button
            onClick={() => setProjectToDelete(null)}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 cursor-pointer"
          >
            {isDeleting && <CircularProgress size={16} color="inherit" />}
            Delete
          </button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
};

export default ProjectManagementDashboard;
