import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Add as AddIcon,
  Search as SearchIcon,
  DesktopWindows as DesktopIcon,
  TabletMac as TabletIcon,
  PhoneIphone as PhoneIcon,
  Visibility as VisibilityIcon,
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
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

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

  const stats = [
    { label: 'Banners', value: totalBanners, hint: 'All campaigns' },
    { label: 'Live', value: activeBanners, hint: 'Visible on site' },
    { label: 'Draft', value: totalBanners - activeBanners, hint: 'Inactive' },
    { label: 'Placements', value: uniquePlacements, hint: 'Unique slots' },
  ];

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
      <PageHero
        kicker="Homepage"
        title="Banners"
        subtitle="Hero and campaign media for landing pages."
      >
        <button type="button" onClick={fetchBannerList} className="cms-btn-outline">
          <RefreshIcon className="w-4 h-4" />
          Refresh
        </button>
        <button type="button" onClick={() => navigate('/banner-management/create')} className="cms-btn-primary">
          <AddIcon className="w-4 h-4" />
          Create banner
        </button>
      </PageHero>

      <StatCards items={stats} />

      <div className="cms-card p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by banner title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cms-input pl-10"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="cms-input cursor-pointer"
          >
            <option value="all">All status</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
        </form>
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
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <EmptyState
          icon={DesktopIcon}
          title="No banners yet"
          message={
            searchTerm || selectedPlacement !== 'all' || selectedStatus !== 'all'
              ? 'Nothing matches these filters. Clear search and try again.'
              : 'Create the first responsive banner for a landing page.'
          }
          action={
            <button type="button" onClick={() => navigate('/banner-management/create')} className="cms-btn-primary">
              Create banner
            </button>
          }
        />
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
                className="cms-card overflow-hidden flex flex-col justify-between"
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
                <div className="px-4 py-3 bg-[#f5f3ef] border-t border-[#C5A880]/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={banner.isActive}
                        onChange={() => handleToggleStatus(banner)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#C5A880]"></div>
                    </label>
                    <span className="text-[11px] text-[#5B584C] font-medium">
                      {banner.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setGuideBanner(banner)}
                      className="cms-btn-outline !px-3 !py-1.5 text-xs"
                      title="API Guide"
                    >
                      API
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBanner(banner)}
                      className="cms-btn-outline !px-3 !py-1.5 text-xs"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/banner-management/edit/${banner._id}`)}
                      className="cms-btn-primary !px-3 !py-1.5 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerToDelete(banner)}
                      className="cms-btn-outline !px-3 !py-1.5 text-xs"
                    >
                      Delete
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

      <Dialog
        open={Boolean(bannerToDelete)}
        onClose={() => setBannerToDelete(null)}
        PaperProps={{ className: '!rounded-2xl' }}
      >
        <DialogTitle className="!text-lg !font-semibold text-[#191f26]">Delete banner</DialogTitle>
        <DialogContent>
          <DialogContentText className="!text-[#5B584C]">
            Remove "{bannerToDelete?.title}" (placement: {bannerToDelete?.placement}) permanently?
            Banner files will be deleted and this cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4 gap-2">
          <button type="button" onClick={() => setBannerToDelete(null)} className="cms-btn-outline">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="cms-btn-primary disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </DialogActions>
      </Dialog>
      </div>
    </PageShell>
  );
};

export default BannerManagementDashboard;
