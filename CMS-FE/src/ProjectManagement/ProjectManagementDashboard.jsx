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
  Link as LinkIcon,
  HomeWork as HomeWorkIcon,
  FilterList as FilterIcon,
  Layers as LayersIcon,
  SquareFoot as SquareFootIcon,
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

const CATEGORY_TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'na-plots', label: 'NA Plots' },
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
];

const ProjectManagementDashboard = () => {
  const navigate = useNavigate();
  const baseUrl = getApiBaseUrl();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
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
      case 'na-plots':
        return {
          label: 'NA Plots',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'residential':
        return {
          label: 'Residential',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'commercial':
        return {
          label: 'Commercial',
          classes: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      default:
        return {
          label: category || 'General',
          classes: 'bg-gray-50 text-gray-700 border-gray-200',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
              <HomeWorkIcon className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Ongoing Projects Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage all project cards displayed in the website's Ongoing Projects section
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProjectList}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition shadow-sm cursor-pointer"
              title="Refresh list"
            >
              <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/project-management/create')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium rounded-xl shadow-md shadow-red-600/10 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <AddIcon className="w-5 h-5" />
              <span>Add New Project</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-red-700/80 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, location, status, plot size..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-red-500 focus:bg-white transition cursor-pointer"
            >
              <option value="all">All Status (Active & Inactive)</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition shadow-sm cursor-pointer"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="rounded-xl shadow-sm" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center shadow-sm">
            <CircularProgress color="error" />
            <p className="mt-4 text-gray-500 text-sm font-medium">Loading ongoing projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border border-red-100">
              <HomeWorkIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Projects Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'No project matches your search/filter criteria. Try changing filters.'
                : 'No projects added yet. Click below to add your first ongoing project card.'}
            </p>
            <button
              onClick={() => navigate('/project-management/create')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow transition cursor-pointer"
            >
              <AddIcon className="w-5 h-5" />
              <span>Add New Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.map((project, index) => {
                const categoryBadge = getCategoryBadge(project.category);

                return (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col group"
                  >
                    {/* Project Card Image */}
                    <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden border-b border-gray-100">
                      <img
                        src={formatImageUrl(project.image)}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xs ${categoryBadge.classes}`}
                        >
                          {categoryBadge.label}
                        </span>

                        <button
                          onClick={() => handleToggleStatus(project)}
                          className={`pointer-events-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs transition cursor-pointer ${
                            project.isActive
                              ? 'bg-green-500/90 text-white border-green-600 hover:bg-green-600'
                              : 'bg-gray-800/90 text-gray-200 border-gray-700 hover:bg-gray-900'
                          }`}
                          title="Click to toggle active status"
                        >
                          {project.isActive ? (
                            <>
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <CancelIcon className="w-3.5 h-3.5" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Status Tag on Bottom Left */}
                      {project.status && (
                        <div className="absolute bottom-3 left-3 bg-gray-950/90 backdrop-blur-md px-3 py-1 rounded-lg border border-gray-800 text-xs font-semibold text-amber-300 shadow">
                          {project.status}
                        </div>
                      )}

                      {/* Order Badge on Bottom Right */}
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs text-gray-700 font-medium border border-gray-200 shadow">
                        Order: <span className="font-bold text-gray-900">{project.order ?? 0}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition">
                          {project.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-start gap-1.5 text-xs text-gray-600">
                          <LocationIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{project.location}</span>
                        </div>

                        {/* Project Details Box */}
                        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[11px] font-medium">
                              NA Status
                            </span>
                            <span className="font-semibold text-gray-800 truncate block">
                              {project.naStatus || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px] font-medium">
                              Plot Size
                            </span>
                            <span className="font-bold text-red-600 truncate block">
                              {project.plotSize || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Page Link */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 truncate">
                          <LinkIcon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-400 font-medium">Link:</span>
                          <span className="text-blue-600 truncate font-mono font-medium">
                            {project.pageLink || 'None'}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => setPreviewProject(project)}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        >
                          <VisibilityIcon className="w-4 h-4 text-gray-500" />
                          <span>Preview</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/project-management/edit/${project._id}`)}
                            className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 font-medium transition cursor-pointer"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setProjectToDelete(project)}
                            className="flex items-center gap-1 text-xs text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 font-medium transition cursor-pointer"
                          >
                            <DeleteIcon className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewProject && (
        <Dialog
          open={Boolean(previewProject)}
          onClose={() => setPreviewProject(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            className: '!bg-white !text-gray-900 !rounded-2xl !p-2 !shadow-2xl',
          }}
        >
          <DialogTitle className="!text-xl !font-bold flex justify-between items-center !border-b !border-gray-100 !pb-3">
            <span className="text-gray-900">{previewProject.title}</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                getCategoryBadge(previewProject.category).classes
              }`}
            >
              {getCategoryBadge(previewProject.category).label}
            </span>
          </DialogTitle>
          <DialogContent className="space-y-4 !pt-4">
            <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={formatImageUrl(previewProject.image)}
                alt={previewProject.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-400 text-xs block font-medium">Location</span>
                <span className="text-gray-800 font-semibold">{previewProject.location}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block font-medium">Status Tag</span>
                <span className="text-gray-900 font-bold">{previewProject.status}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block font-medium">Plot Size</span>
                <span className="text-red-600 font-bold">{previewProject.plotSize}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block font-medium">NA Status</span>
                <span className="text-gray-800 font-semibold">{previewProject.naStatus}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 text-xs block font-medium">Page Link</span>
                <span className="text-blue-600 font-mono text-xs font-medium break-all">
                  {previewProject.pageLink || 'None'}
                </span>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="!p-4 !border-t !border-gray-100">
            <button
              onClick={() => setPreviewProject(null)}
              className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        PaperProps={{
          className: '!bg-white !text-gray-900 !rounded-2xl !p-2 !shadow-2xl',
        }}
      >
        <DialogTitle className="!text-lg !font-bold text-red-600">
          Delete Ongoing Project
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="!text-gray-600">
            Are you sure you want to delete project{' '}
            <strong className="text-gray-900">"{projectToDelete?.title}"</strong>? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4">
          <button
            onClick={() => setProjectToDelete(null)}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {isDeleting && <CircularProgress size={16} color="inherit" />}
            <span>Delete</span>
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectManagementDashboard;
