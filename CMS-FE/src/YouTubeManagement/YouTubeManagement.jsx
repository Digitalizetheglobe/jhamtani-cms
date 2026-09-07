import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Search as SearchIcon,
  YouTube as YouTubeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

/**
 * YouTube Video Management Component
 * 
 * Features:
 * - CRUD operations for YouTube videos
 * - YouTube URL validation with real-time feedback
 * - URL normalization and video ID extraction
 * - Video preview with thumbnails
 * - Search and filter functionality
 * - Active/Inactive status management
 */
const YouTubeManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    isActive: true
  });
  const [urlError, setUrlError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch videos from API
  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/youtube-videos');
      if (!response.ok) {
        throw new Error('Failed to load videos');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setVideos(result.data);
      } else {
        setVideos([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/watch\?.*&v=([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  // Validate YouTube URL
  const validateYouTubeUrl = (url) => {
    if (!url) return true; // Allow empty URLs
    if (url.trim() === '') return true;

    // More permissive patterns that include query parameters
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/watch\?.*&v=([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match) return true;
    }

    return false;
  };

  // Normalize YouTube URL
  const normalizeYouTubeUrl = (url) => {
    if (!url) return url;

    let normalized = url.trim();

    // Add https:// if no protocol is specified
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }

    // Ensure it starts with https://
    if (normalized.startsWith('http://')) {
      normalized = normalized.replace('http://', 'https://');
    }

    // Clean the URL by removing query parameters and keeping only the video ID
    const videoId = extractVideoId(normalized);
    if (videoId) {
      // Convert to standard YouTube watch URL format
      return `https://youtube.com/watch?v=${videoId}`;
    }

    return normalized;
  };

  // Handle URL change with validation
  const handleUrlChange = (e) => {
    const url = e.target.value;
    const normalizedUrl = normalizeYouTubeUrl(url);
    setFormData({ ...formData, url: normalizedUrl });

    if (normalizedUrl && !validateYouTubeUrl(normalizedUrl)) {
      setUrlError('Please enter a valid YouTube video URL');
    } else {
      setUrlError('');
    }
  };

  // Get cleaned URL for display
  const getCleanedUrl = (url) => {
    if (!url) return '';
    const videoId = extractVideoId(url);
    return videoId ? `https://youtube.com/watch?v=${videoId}` : url;
  };

  // Test URL cleaning (for debugging)
  const testUrlCleaning = () => {
    const testUrls = [
      'https://youtu.be/s6lnS-hp_4s?si=JiAgJZhylYzNiYqB',
      'https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
      'https://www.youtube.com/watch?v=VIDEO_ID&feature=share',
      'youtu.be/VIDEO_ID',
      'https://youtube.com/embed/VIDEO_ID'
    ];

    console.log('URL Cleaning Test Results:');
    testUrls.forEach(url => {
      const cleaned = normalizeYouTubeUrl(url);
      const videoId = extractVideoId(url);
      console.log(`Original: ${url}`);
      console.log(`Video ID: ${videoId}`);
      console.log(`Cleaned: ${cleaned}`);
      console.log('---');
    });
  };

  // Filter videos based on search and filter
  const filteredVideos = videos.filter(video => {
    if (!video || !video.name) return false;

    const searchMatch = video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const statusMatch = filterStatus === 'all' ||
      (filterStatus === 'active' && video.isActive) ||
      (filterStatus === 'inactive' && !video.isActive);

    return searchMatch && statusMatch;
  });

  // Open video detail dialog
  const openVideoDetail = (video) => {
    setSelectedVideo(video);
    setDetailDialogOpen(true);
  };

  // Close video detail dialog
  const closeVideoDetail = () => {
    setDetailDialogOpen(false);
    setSelectedVideo(null);
  };

  // Open delete dialog
  const openDeleteDialog = (video) => {
    setVideoToDelete(video);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setVideoToDelete(null);
  };

  // Open form dialog for create/edit
  const openFormDialog = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        name: video.name,
        description: video.description || '',
        url: video.url || '',
        isActive: video.isActive
      });
    } else {
      setEditingVideo(null);
      setFormData({
        name: '',
        description: '',
        url: '',
        isActive: true
      });
    }
    setUrlError('');
    setFormDialogOpen(true);
  };

  // Close form dialog
  const closeFormDialog = () => {
    setFormDialogOpen(false);
    setEditingVideo(null);
    setFormData({
      name: '',
      description: '',
      url: '',
      isActive: true
    });
    setUrlError('');
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate YouTube URL before submission
    if (formData.url && !validateYouTubeUrl(formData.url)) {
      setUrlError('Please provide a valid YouTube video URL');
      return;
    }

    // Normalize the URL before submission
    const normalizedFormData = {
      ...formData,
      url: normalizeYouTubeUrl(formData.url)
    };

    try {
      const response = await fetch(`http://localhost:5000/api/youtube-videos${editingVideo ? `/${editingVideo._id}` : ''}`, {
        method: editingVideo ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedFormData)
      });

      const result = await response.json();

      if (result.success) {
        closeFormDialog();
        fetchVideos();
        setSnackbar({
          open: true,
          message: editingVideo ? 'Video updated successfully!' : 'Video created successfully!',
          severity: 'success'
        });
      } else {
        setError(result.message || 'Failed to save video');
        setSnackbar({
          open: true,
          message: result.message || 'Failed to save video',
          severity: 'error'
        });
      }
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/youtube-videos/${videoToDelete._id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setVideos(videos.filter(v => v._id !== videoToDelete._id));
        closeDeleteDialog();
        setSnackbar({
          open: true,
          message: 'Video deleted successfully!',
          severity: 'success'
        });
      } else {
        setError(result.message || 'Failed to delete video');
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete video',
          severity: 'error'
        });
      }
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
      closeDeleteDialog();
    }
  };

  // Toggle active status
  const toggleStatus = async (video) => {
    try {
      const response = await fetch(`http://localhost:5000/api/youtube-videos/${video._id}/toggle-status`, {
        method: 'PATCH'
      });

      const result = await response.json();

      if (result.success) {
        setVideos(videos.map(v =>
          v._id === video._id ? { ...v, isActive: result.data.isActive } : v
        ));
        setSnackbar({
          open: true,
          message: `Video ${result.data.isActive ? 'activated' : 'deactivated'} successfully!`,
          severity: 'success'
        });
      } else {
        setError(result.message || 'Failed to toggle status');
        setSnackbar({
          open: true,
          message: result.message || 'Failed to toggle status',
          severity: 'error'
        });
      }
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  // Get YouTube thumbnail URL
  const getThumbnailUrl = (videoId) => {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const stats = [
    { label: 'Videos', value: videos.length, hint: 'All YouTube links' },
    { label: 'Active', value: videos.filter((v) => v.isActive).length, hint: 'Visible on site' },
    { label: 'Inactive', value: videos.filter((v) => !v.isActive).length, hint: 'Hidden' },
    { label: 'Showing', value: filteredVideos.length, hint: 'Current filters' },
  ];

  if (loading && videos.length === 0) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading videos...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 sm:space-y-6">
        <PageHero
          kicker="Media"
          title="YouTube Videos"
          subtitle="Manage YouTube videos shown on the public site."
        >
          <button type="button" onClick={fetchVideos} className="cms-btn-outline">
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
          <button type="button" onClick={() => openFormDialog()} className="cms-btn-primary">
            <AddIcon className="w-4 h-4" />
            Add video
          </button>
        </PageHero>

        <StatCards items={stats} />

        {error && (
          <Alert severity="error" className="rounded-xl" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="cms-card p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos..."
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
              <option value="all">All videos</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <EmptyState
            icon={YouTubeIcon}
            title="No videos yet"
            message={
              searchTerm || filterStatus !== 'all'
                ? 'Nothing matches these filters. Clear search and try again.'
                : 'Add the first YouTube video for the public site.'
            }
            action={
              <button type="button" onClick={() => openFormDialog()} className="cms-btn-primary">
                <AddIcon className="w-4 h-4" />
                Add video
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => {
              const videoId = extractVideoId(video.url);
              const thumbnailUrl = getThumbnailUrl(videoId);

              return (
                <article
                  key={video._id}
                  className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => window.open(video.url, '_blank')}
                      className="relative w-28 h-16 rounded-xl overflow-hidden bg-[#191f26] flex-shrink-0"
                    >
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={video.name} className="w-full h-full object-cover" />
                      ) : (
                        <YouTubeIcon className="text-white/50 m-auto" />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <PlayIcon className="text-white" />
                      </span>
                    </button>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#191f26] truncate">{video.name}</h3>
                      <p className="text-sm text-[#5B584C] line-clamp-2">
                        {video.description || 'No description provided'}
                      </p>
                      <span
                        className={`mt-2 inline-flex text-[11px] px-2.5 py-1 rounded-full ${
                          video.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {video.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openVideoDetail(video)} className="cms-btn-outline !px-4">
                      View
                    </button>
                    <button type="button" onClick={() => openFormDialog(video)} className="cms-btn-primary !px-4">
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleStatus(video)} className="cms-btn-outline !px-4">
                      {video.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" onClick={() => openDeleteDialog(video)} className="cms-btn-outline !px-4">
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={detailDialogOpen}
        onClose={closeVideoDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: '!rounded-2xl' }}
      >
        <DialogTitle className="!font-display !text-2xl text-[#191f26]">
          Video details
        </DialogTitle>
        <DialogContent>
          {selectedVideo && (
            <div className="space-y-5 pt-2">
              <div className="bg-[#f5f3ef] p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="block text-[#5B584C] text-xs uppercase tracking-wider font-semibold">Name</span>
                  <span className="font-semibold text-[#191f26]">{selectedVideo.name || 'Not provided'}</span>
                </div>
                <div>
                  <span className="block text-[#5B584C] text-xs uppercase tracking-wider font-semibold">Status</span>
                  <span
                    className={`inline-flex text-[11px] px-2.5 py-1 rounded-full ${
                      selectedVideo.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedVideo.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[#5B584C] text-xs uppercase tracking-wider font-semibold">Description</span>
                  <span className="text-[#191f26]">{selectedVideo.description || 'No description provided'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[#5B584C] text-xs uppercase tracking-wider font-semibold">YouTube URL</span>
                  {selectedVideo.url ? (
                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#A0725B] hover:underline break-all"
                    >
                      {selectedVideo.url}
                    </a>
                  ) : (
                    <span className="text-[#191f26]">Not provided</span>
                  )}
                </div>
              </div>

              {selectedVideo.url && extractVideoId(selectedVideo.url) && (
                <div className="aspect-video bg-[#191f26] rounded-xl overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${extractVideoId(selectedVideo.url)}`}
                    title={selectedVideo.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions className="!p-4 !border-t !border-[#C5A880]/20 gap-2">
          <button type="button" onClick={closeVideoDetail} className="cms-btn-outline">
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              closeVideoDetail();
              openFormDialog(selectedVideo);
            }}
            className="cms-btn-primary"
          >
            Edit video
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
          {editingVideo ? 'Edit YouTube video' : 'Add YouTube video'}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Video name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="cms-input"
                  required
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="cms-input"
                  rows={3}
                  placeholder="Enter video description"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">YouTube URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={handleUrlChange}
                  className={`cms-input ${urlError ? 'border-red-400' : ''}`}
                  placeholder="https://youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
                  required
                />
                <p className={`text-xs mt-1 ${urlError ? 'text-red-600' : 'text-[#5B584C]'}`}>
                  {urlError
                    ? 'Please enter a valid YouTube video URL'
                    : formData.url && validateYouTubeUrl(formData.url)
                      ? `Valid URL (will be saved as: ${getCleanedUrl(formData.url)})`
                      : 'Supports youtu.be and youtube.com links'}
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
                label="Active video"
              />
            </div>
          </DialogContent>
          <DialogActions className="!p-4 !border-t !border-[#C5A880]/20 gap-2">
            <button type="button" onClick={closeFormDialog} className="cms-btn-outline">
              Cancel
            </button>
            <button type="submit" className="cms-btn-primary">
              {editingVideo ? 'Update' : 'Create'}
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
          Delete video
        </DialogTitle>
        <DialogContent>
          <p className="text-[#5B584C] text-sm">
            Remove "{videoToDelete?.name || 'this video'}" permanently? This cannot be undone.
          </p>
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          className="w-full"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageShell>
  );
};

export default YouTubeManagement;
