import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaPlay } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PageShell from '../PageShell';
import { PageHero, StatCards, EmptyState } from '../PageHero';

const emptyForm = {
  sourceType: 'local',
  youtubeUrl: '',
  projectName: '',
  tagline: '',
  title: '',
  location: '',
  isActive: true,
};

const VideoUploads = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedFile(null);
    setEditingVideo(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSourceChange = (sourceType) => {
    setFormData((prev) => ({
      ...prev,
      sourceType,
      youtubeUrl: sourceType === 'youtube' ? prev.youtubeUrl : '',
    }));
    if (sourceType === 'youtube') {
      setSelectedFile(null);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      alert('File size must be less than 500MB');
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.sourceType === 'youtube' && !formData.youtubeUrl.trim()) {
      alert('Please enter a YouTube URL');
      return;
    }
    if (formData.sourceType === 'local' && !editingVideo && !selectedFile) {
      alert('Please choose a local video file');
      return;
    }
    if (formData.sourceType === 'local' && editingVideo && !selectedFile && !editingVideo.videoUrl) {
      alert('Please choose a local video file');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('sourceType', formData.sourceType);
      formDataToSend.append('projectName', formData.projectName.trim());
      formDataToSend.append('tagline', formData.tagline.trim());
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('location', formData.location.trim());
      formDataToSend.append('isActive', formData.isActive);

      if (formData.sourceType === 'youtube') {
        formDataToSend.append('youtubeUrl', formData.youtubeUrl.trim());
      } else if (selectedFile) {
        formDataToSend.append('video', selectedFile);
      }

      const url = editingVideo
        ? `/api/video-uploads/${editingVideo._id}`
        : '/api/video-uploads';
      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        closeModal();
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      const response = await fetch(`/api/video-uploads/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchVideos(currentPage);
      } else {
        alert('Error deleting video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      sourceType: video.sourceType === 'youtube' ? 'youtube' : 'local',
      youtubeUrl: video.youtubeUrl || '',
      projectName: video.projectName || '',
      tagline: video.tagline || '',
      title: video.title || '',
      location: video.location || '',
      isActive: video.isActive !== false,
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const filteredVideos = videos.filter((video) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      (video.title && video.title.toLowerCase().includes(q)) ||
      (video.projectName && video.projectName.toLowerCase().includes(q)) ||
      (video.tagline && video.tagline.toLowerCase().includes(q)) ||
      (video.location && video.location.toLowerCase().includes(q)) ||
      (video.youtubeUrl && video.youtubeUrl.toLowerCase().includes(q))
    );
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const stats = [
    { label: 'Videos', value: videos.length, hint: 'This page' },
    { label: 'YouTube', value: videos.filter((v) => v.sourceType === 'youtube').length, hint: 'Linked' },
    { label: 'Local', value: videos.filter((v) => v.sourceType !== 'youtube').length, hint: 'Uploaded' },
    { label: 'Showing', value: filteredVideos.length, hint: 'Current search' },
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
          <button type="button" onClick={openCreateModal} className="cms-btn-primary">
            <FaPlus /> Upload video
          </button>
        </PageHero>

        <StatCards items={stats} />

        <div className="cms-card p-4 sm:p-5">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, project, tagline, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cms-input pl-10"
            />
          </div>
        </div>

        {loading && !showModal ? (
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
              <button type="button" onClick={openCreateModal} className="cms-btn-primary">
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
                    {video.projectName && (
                      <p className="text-sm text-[#5B584C] truncate">{video.projectName}</p>
                    )}
                    {video.tagline && (
                      <p className="text-sm text-[#5B584C] line-clamp-1 italic">{video.tagline}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full ${
                          video.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {video.isActive ? 'Active' : 'Hidden'}
                      </span>
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#C5A880]/15 text-[#A0725B]">
                        {video.sourceType === 'youtube' ? 'YouTube' : 'Local'}
                      </span>
                      {video.location && (
                        <span className="text-[11px] text-gray-500">{video.location}</span>
                      )}
                      {video.sourceType !== 'youtube' && video.fileSize ? (
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
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="font-display text-2xl text-[#191f26] mb-4">
                {editingVideo ? 'Edit video' : 'Upload video'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-2">
                    Video source
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSourceChange('youtube')}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold border transition ${
                        formData.sourceType === 'youtube'
                          ? 'bg-[#191f26] text-[#C5A880] border-[#191f26]'
                          : 'bg-[#f5f3ef] text-[#5B584C] border-transparent hover:border-[#C5A880]'
                      }`}
                    >
                      YouTube URL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSourceChange('local')}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold border transition ${
                        formData.sourceType === 'local'
                          ? 'bg-[#191f26] text-[#C5A880] border-[#191f26]'
                          : 'bg-[#f5f3ef] text-[#5B584C] border-transparent hover:border-[#C5A880]'
                      }`}
                    >
                      Local
                    </button>
                  </div>
                  <p className="text-xs text-[#5B584C] mt-1.5">Choose only one source at a time.</p>
                </div>

                {formData.sourceType === 'youtube' ? (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      className="cms-input"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                      Video file
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="cms-input"
                      required={!editingVideo || !editingVideo.videoUrl}
                    />
                    <p className="text-xs text-[#5B584C] mt-1">
                      MP4, AVI, MOV, WMV, FLV, WebM. Max 500MB
                      {editingVideo?.videoUrl && !selectedFile ? ' · Leave empty to keep current file' : ''}
                    </p>
                    {selectedFile && (
                      <p className="text-xs text-[#A0725B] mt-1 truncate">{selectedFile.name}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Project name
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="cms-input"
                    placeholder="e.g. ACE Residences"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="cms-input"
                    placeholder="Short line under the title"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="cms-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="cms-input"
                    placeholder="e.g. Baner, Pune"
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
                  <button type="button" onClick={closeModal} className="flex-1 cms-btn-outline">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 cms-btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingVideo ? 'Update' : 'Upload'}
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
