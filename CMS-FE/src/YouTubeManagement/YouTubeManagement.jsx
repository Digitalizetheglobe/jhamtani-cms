import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material';

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
      const response = await fetch('https://api.risingspaces.in/api/youtube-videos');
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
      const response = await fetch(`https://api.risingspaces.in/api/youtube-videos${editingVideo ? `/${editingVideo._id}` : ''}`, {
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
      const response = await fetch(`https://api.risingspaces.in/api/youtube-videos/${videoToDelete._id}`, {
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
      const response = await fetch(`https://api.risingspaces.in/api/youtube-videos/${video._id}/toggle-status`, {
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

  if (loading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h4" className="text-gray-800 font-bold mb-2">
              YouTube Video Management
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Manage your YouTube videos and playlists
            </Typography>
          </div>
          <div className="flex gap-2">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openFormDialog()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Add Video
            </Button>
            <Button
              variant="outlined"
              onClick={testUrlCleaning}
              className="border-gray-300 text-gray-700"
            >
              Test URL Cleaning
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <TextField
              fullWidth
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('active')}
                className={filterStatus === 'active' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('inactive')}
                className={filterStatus === 'inactive' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Inactive
              </Button>
            </Box>
          </div>
        </CardContent>
      </Card>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <YouTubeIcon className="text-gray-400 text-6xl mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              No videos found
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first YouTube video'
              }
            </Typography>
            {!searchTerm && filterStatus === 'all' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openFormDialog()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Add First Video
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVideos.map((video) => {
            const videoId = extractVideoId(video.url);
            const thumbnailUrl = getThumbnailUrl(videoId);

            return (
              <Card key={video._id} className="hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={video.name}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <YouTubeIcon className="text-gray-400" />
                        </div>
                      )}
                      <IconButton
                        size="small"
                        className="absolute inset-0 m-auto bg-black bg-opacity-50 hover:bg-opacity-70"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <PlayIcon className="text-white" />
                      </IconButton>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Typography variant="h6" className="text-gray-800 font-semibold mb-1 truncate">
                            {video.name}
                          </Typography>
                          <Typography variant="body2" className="text-gray-600 mb-2 line-clamp-2">
                            {video.description || 'No description provided'}
                          </Typography>
                          <div className="flex items-center gap-2">
                            <Chip
                              label={video.isActive ? 'Active' : 'Inactive'}
                              color={video.isActive ? 'success' : 'default'}
                              size="small"
                            />
                            <Typography variant="caption" className="text-gray-500">
                              ID: {video._id}
                            </Typography>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-4">
                          <IconButton
                            size="small"
                            onClick={() => openVideoDetail(video)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openFormDialog(video)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => toggleStatus(video)}
                            className={video.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}
                          >
                            {video.isActive ? <HideIcon /> : <ViewIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(video)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Video Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={closeVideoDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl"
        }}
      >
        <DialogTitle className="text-lg font-semibold text-gray-800">
          Video Details
        </DialogTitle>
        <DialogContent>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Video Name
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    {selectedVideo.name || 'Not provided'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Status
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    <Chip
                      label={selectedVideo.isActive ? 'Active' : 'Inactive'}
                      color={selectedVideo.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Typography>
                </div>
                <div className="md:col-span-2">
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Description
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    {selectedVideo.description || 'No description provided'}
                  </Typography>
                </div>
                <div className="md:col-span-2">
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    YouTube URL
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    {selectedVideo.url ? (
                      <a
                        href={selectedVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {selectedVideo.url}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Video ID
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-mono">
                    {extractVideoId(selectedVideo.url) || 'Invalid URL'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium">
                    Created At
                  </Typography>
                  <Typography variant="body1" className="text-gray-800">
                    {selectedVideo.createdAt ? new Date(selectedVideo.createdAt).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </div>
              </div>

              {/* Video Preview */}
              {selectedVideo.url && extractVideoId(selectedVideo.url) && (
                <div>
                  <Typography variant="subtitle2" className="text-gray-600 font-medium mb-2">
                    Video Preview
                  </Typography>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
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
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-200">
          <Button onClick={closeVideoDetail} className="text-gray-600">
            Close
          </Button>
          <Button
            onClick={() => {
              closeVideoDetail();
              openFormDialog(selectedVideo);
            }}
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Edit Video
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={closeFormDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl"
        }}
      >
        <DialogTitle className="text-lg font-semibold text-gray-800">
          {editingVideo ? 'Edit YouTube Video' : 'Add New YouTube Video'}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Video Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter video title"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                placeholder="Enter video description"
              />
              <TextField
                fullWidth
                label="YouTube URL"
                value={formData.url}
                onChange={handleUrlChange}
                placeholder="https://youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
                error={!!urlError}
                helperText={
                  urlError
                    ? 'Please enter a valid YouTube video URL'
                    : formData.url && validateYouTubeUrl(formData.url)
                      ? `✓ Valid URL (will be saved as: ${getCleanedUrl(formData.url)})`
                      : "Enter a valid YouTube video URL (supports youtu.be, youtube.com, with query parameters)"
                }
                InputProps={{
                  endAdornment: formData.url && validateYouTubeUrl(formData.url) ? (
                    <span style={{ color: 'green', fontSize: '20px' }}>✓</span>
                  ) : null
                }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active Video"
              />
            </div>
          </DialogContent>
          <DialogActions className="px-6 py-4 border-t border-gray-200">
            <Button onClick={closeFormDialog} className="text-gray-600">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {editingVideo ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        PaperProps={{
          className: "rounded-xl"
        }}
      >
        <DialogTitle className="text-lg font-semibold text-gray-800">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography className="text-gray-600">
            Are you sure you want to delete "{videoToDelete?.name || 'this video'}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-200">
          <Button onClick={closeDeleteDialog} className="text-gray-600">
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
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
    </div>
  );
};

export default YouTubeManagement;
