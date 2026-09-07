import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaPlay } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PageShell from '../PageShell';
import { PageHero, StatCards, EmptyState } from '../PageHero';

const VideoUploads = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch videos
  const fetchVideos = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/video-uploads?page=${page}&limit=20`);
      const data = await response.json();
      setVideos(data.videos || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle video file selection
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        alert('File size must be less than 500MB');
        return;
      }
      setSelectedFile(file);
    }
  };



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isActive', formData.isActive);

      if (selectedFile) {
        formDataToSend.append('video', selectedFile);
      }

      const url = editingVideo 
        ? `/api/video-uploads/${editingVideo._id}`
        : '/api/video-uploads';
      
      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        setShowModal(false);
        setEditingVideo(null);
        setFormData({
          title: '',
          description: '',
          isActive: true
        });
        setSelectedFile(null);
        fetchVideos(currentPage);
      } else {
        const error = await response.json();
        alert(error.message || 'Error saving video');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Error saving video');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        const response = await fetch(`/api/video-uploads/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchVideos(currentPage);
        } else {
          alert('Error deleting video');
        }
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Error deleting video');
      }
    }
  };

  // Handle edit
  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      isActive: video.isActive
    });
    setShowModal(true);
  };



  // Filter videos
  const filteredVideos = videos.filter(video =>
    (video.title && video.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = [
    { label: 'Videos', value: videos.length, hint: 'This page' },
    { label: 'Active', value: videos.filter((v) => v.isActive).length, hint: 'Visible' },
    { label: 'Showing', value: filteredVideos.length, hint: 'Current search' },
    { label: 'Pages', value: totalPages, hint: 'Pagination' },
  ];

  return (
    <PageShell>
    <div className="space-y-5 sm:space-y-6">
      <PageHero
        kicker="Media"
        title="Video uploads"
        subtitle="Hosted videos for the public site."
      >
        <button type="button" onClick={() => fetchVideos(currentPage)} className="cms-btn-outline">
          Refresh
        </button>
        <button type="button" onClick={() => setShowModal(true)} className="cms-btn-primary">
          <FaPlus /> Upload video
        </button>
      </PageHero>

      <StatCards items={stats} />

      <div className="cms-card p-4 sm:p-5">
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cms-input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading videos...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <EmptyState
          icon={VideoLibraryIcon}
          title="No videos yet"
          message={searchTerm ? 'Nothing matches this search.' : 'Upload the first video.'}
          action={
            <button type="button" onClick={() => setShowModal(true)} className="cms-btn-primary">
              <FaPlus /> Upload video
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredVideos.map((video) => (
            <article
              key={video._id}
              className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-[#191f26] text-[#C5A880] flex items-center justify-center flex-shrink-0">
                  <FaPlay />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#191f26] truncate">{video.title || 'Untitled'}</h3>
                  {video.description && (
                    <p className="text-sm text-[#5B584C] line-clamp-2">{video.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full ${
                        video.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {video.isActive ? 'Active' : 'Hidden'}
                    </span>
                    {video.fileSize ? (
                      <span className="text-[11px] text-gray-500">{formatFileSize(video.fileSize)}</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleEdit(video)} className="cms-btn-primary !px-4">
                  <FaEdit className="inline mr-1" /> Edit
                </button>
                <button type="button" onClick={() => handleDelete(video._id)} className="cms-btn-outline !px-4">
                  <FaTrash className="inline mr-1" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="cms-card p-4 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => fetchVideos(page)}
              className={`px-3 py-2 rounded-xl text-sm font-medium ${
                currentPage === page
                  ? 'bg-[#C5A880] text-[#191f26]'
                  : 'bg-[#f5f3ef] text-[#5B584C] hover:bg-[#C5A880]/20'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl text-[#191f26] mb-4">
              {editingVideo ? 'Edit video' : 'Upload video'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Video file</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="cms-input"
                  required={!editingVideo}
                />
                <p className="text-xs text-[#5B584C] mt-1">MP4, AVI, MOV, WMV, FLV, WebM. Max 500MB</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  placeholder="Enter video description"
                  rows="3"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-[#5B584C]">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </label>

              <div className="flex gap-2 pt-4 border-t border-[#C5A880]/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVideo(null);
                    setFormData({ title: '', description: '', isActive: true });
                    setSelectedFile(null);
                  }}
                  className="flex-1 cms-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 cms-btn-primary disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingVideo ? 'Update' : 'Upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </PageShell>
  );
};

export default VideoUploads;
