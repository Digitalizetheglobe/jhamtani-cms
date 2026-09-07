import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DesktopWindows as DesktopIcon,
  TabletMac as TabletIcon,
  PhoneIphone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
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
  getBanners,
  deleteBanner,
  toggleBannerStatus,
  getApiBaseUrl,
} from '../api/bannerApi';
import BannerApiGuide from './BannerApiGuide';
import BannerPreviewModal from './BannerPreviewModal';

const BannerManagementDashboard = () => {
  const navigate = useNavigate();
  const baseUrl = getApiBaseUrl();

  const [banners, setBanners] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [guideBanner, setGuideBanner] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBannerList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBanners({
        search: searchTerm || undefined,
        placement: selectedPlacement !== 'all' ? selectedPlacement : undefined,
        isActive: selectedStatus !== 'all' ? selectedStatus : undefined,
      });

      if (res.success) {
        setBanners(res.data || []);
        if (res.placements) {
          setPlacements(res.placements);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerList();
  }, [selectedPlacement, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBannerList();
  };

  const handleToggleStatus = async (banner) => {
    try {
      const res = await toggleBannerStatus(banner._id);
      if (res.success) {
        setBanners((prev) =>
          prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle banner status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;
    try {
      setIsDeleting(true);
      const res = await deleteBanner(bannerToDelete._id);
      if (res.success) {
        setBanners((prev) => prev.filter((b) => b._id !== bannerToDelete._id));
        setBannerToDelete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete banner');
    } finally {
      setIsDeleting(false);
    }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${baseUrl}${url}`;
  };

  // Quick stats
  const totalBanners = banners.length;
  const activeBanners = banners.filter((b) => b.isActive).length;
  const uniquePlacements = new Set(banners.map((b) => b.placement)).size;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Banner Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage multi-device responsive banners & get integration code for all landing pages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBannerList}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-red-600 hover:border-red-200 shadow-sm transition"
            title="Refresh list"
          >
            <RefreshIcon fontSize="small" />
          </button>
          <button
            onClick={() => navigate('/banner-management/create')}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm"
          >
            <AddIcon fontSize="small" />
            <span>Create New Banner</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Banners</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalBanners}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
            🖼️
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active (Live)</p>
            <h3 className="text-2xl font-bold text-green-600 mt-1">{activeBanners}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-lg">
            ⚡
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by banner title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          />
          <SearchIcon className="absolute left-3 top-2.5 text-gray-400 text-sm" />
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mb-6">
          <Alert severity="error" className="rounded-xl shadow-sm">
            {error}
          </Alert>
        </div>
      )}

      {/* Banner Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <CircularProgress />
          <p className="mt-4 text-gray-500 text-sm">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🖼️
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Banners Found</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            {searchTerm || selectedPlacement !== 'all' || selectedStatus !== 'all'
              ? 'No banners match your active filter. Try resetting your search.'
              : 'Get started by creating your first responsive banner for any landing page.'}
          </p>
          <button
            onClick={() => navigate('/banner-management/create')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
          >
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => {
            const hasTablet = Boolean(banner.tabletBanner);
            const hasMobile = Boolean(banner.mobileBanner);

            return (
              <motion.div
                key={banner._id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image / Video Thumbnail */}
                <div>
                  <div className="relative aspect-[16/8] bg-gray-950 overflow-hidden group">
                    {banner.mediaType === 'video' ? (
                      <video
                        src={getFullUrl(banner.desktopBanner)}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                        muted
                      />
                    ) : (
                      <img
                        src={getFullUrl(banner.desktopBanner)}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="font-mono text-[11px] font-bold bg-black/75 text-gray-200 px-2.5 py-1 rounded-lg backdrop-blur-sm shadow border border-white/10">
                        ID: {banner._id?.substring(banner._id.length - 8)}
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm shadow flex items-center gap-1 ${
                          banner.isActive
                            ? 'bg-green-600/90 text-white'
                            : 'bg-gray-800/90 text-gray-300'
                        }`}
                      >
                        {banner.isActive ? 'Live' : 'Inactive'}
                      </span>
                    </div>

                    {/* Quick Preview Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => setPreviewBanner(banner)}
                        className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-lg hover:bg-gray-100 flex items-center gap-1 transition"
                      >
                        <VisibilityIcon fontSize="inherit" />
                        Preview Device View
                      </button>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{banner.description}</p>
                    )}

                    {/* Device compatibility icons */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">Supported Devices:</span>
                      <div className="flex items-center gap-2">
                        <span
                          className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded"
                          title="Desktop Banner Ready"
                        >
                          <DesktopIcon fontSize="inherit" /> Desktop
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                            hasTablet
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-400 bg-gray-100 line-through'
                          }`}
                          title={hasTablet ? 'Custom Tablet Banner' : 'Auto-desktop fallback'}
                        >
                          <TabletIcon fontSize="inherit" /> Tab
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                            hasMobile
                              ? 'text-green-600 bg-green-50'
                              : 'text-gray-400 bg-gray-100 line-through'
                          }`}
                          title={hasMobile ? 'Custom Mobile Banner' : 'Auto-fallback'}
                        >
                          <PhoneIcon fontSize="inherit" /> Mobile
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  {/* Status toggle */}
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={banner.isActive}
                        onChange={() => handleToggleStatus(banner)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {banner.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-1">
                    {/* API Guide Button */}
                    <button
                      onClick={() => setGuideBanner(banner)}
                      className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="API Guide & Code Snippet"
                    >
                      <CodeIcon fontSize="small" />
                    </button>

                    {/* Preview Button */}
                    <button
                      onClick={() => setPreviewBanner(banner)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Device Preview"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => navigate(`/banner-management/edit/${banner._id}`)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Edit Banner"
                    >
                      <EditIcon fontSize="small" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setBannerToDelete(banner)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Banner"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* API Guide Modal */}
      <AnimatePresence>
        {guideBanner && (
          <BannerApiGuide
            bannerData={guideBanner}
            onClose={() => setGuideBanner(null)}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewBanner && (
          <BannerPreviewModal
            banner={previewBanner}
            onClose={() => setPreviewBanner(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(bannerToDelete)}
        onClose={() => setBannerToDelete(null)}
        PaperProps={{ className: 'rounded-2xl p-2' }}
      >
        <DialogTitle className="font-bold text-gray-900">Confirm Banner Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-600 text-sm">
            Are you sure you want to delete the banner{' '}
            <strong className="text-gray-900">"{bannerToDelete?.title}"</strong> (Placement:{' '}
            <code className="text-red-600">{bannerToDelete?.placement}</code>)? This action will
            remove the banner files and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4 gap-2">
          <button
            onClick={() => setBannerToDelete(null)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow transition disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Banner'}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BannerManagementDashboard;
