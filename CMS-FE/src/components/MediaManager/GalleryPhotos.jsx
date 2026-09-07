import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PageShell from '../PageShell';
import { PageHero, StatCards, EmptyState } from '../PageHero';

const GalleryPhotos = () => {
  const [photos, setPhotos] = useState([]);
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true,
    category: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const normalizeCategoryValue = useCallback((value) => {
    if (!value) return '';
    const normalized = value.toLowerCase().replace(/-/g, ' ').trim();
    const match = categories.find((cat) => cat.toLowerCase() === normalized);
    return match || normalized;
  }, [categories]);

  // Fetch photos
  const fetchPhotos = async (page = 1) => {
    setLoading(true);
    try {
      console.log('Testing API connection...');

      // Try relative URL first (with proxy)
      let query = `page=${page}&limit=20`;
      if (selectedCategory) {
        query += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      let apiUrl = `/api/gallery-photos?${query}`;
      console.log('Trying relative URL:', apiUrl);

      let response = await fetch(apiUrl);
      console.log('Response status:', response.status);

      // If relative URL fails, try absolute URL
      if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
        console.log('Relative URL failed, trying absolute URL...');
        apiUrl = `http://localhost:5000/api/gallery-photos?${query}`;
        console.log('Trying absolute URL:', apiUrl);
        response = await fetch(apiUrl);
        console.log('Absolute URL response status:', response.status);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);

      setPhotos(data.photos || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching photos:', error);
      alert(`Error fetching photos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('Testing direct backend connection...');
      const response = await fetch('http://localhost:5000/api/gallery-photos');
      console.log('Direct backend response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Direct backend data:', data);
      }
    } catch (error) {
      console.error('Direct backend connection failed:', error);
    }
  };

  // Fetch categories for dropdowns
  const fetchCategories = async () => {
    try {
      let url = 'http://localhost:5000/api/gallery-photos/categories';
      let response = await fetch(url);
      if (!response.ok) {
        url = 'http://localhost:5000/api/gallery-photos/categories';
        response = await fetch(url);
      }
      if (response.ok) {
        const data = await response.json();
        const cats = Array.isArray(data.categories) ? data.categories : [];

        // Define the desired category sequence
        const categoryOrder = ['exhibitions', 'happy clients', 'outings', 'festivals'];

        // Sort categories according to the specified order
        const sortedCats = cats.sort((a, b) => {
          const indexA = categoryOrder.indexOf(a.toLowerCase());
          const indexB = categoryOrder.indexOf(b.toLowerCase());

          // If both categories are in the order array, sort by their position
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          // If only one category is in the order array, prioritize it
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          // If neither category is in the order array, maintain original order
          return 0;
        });

        setCategories(sortedCats);
        // Initialize defaults if empty
        setFormData(prev => ({ ...prev, category: prev.category || (sortedCats[0] || '') }));
      } else {
        console.warn('Failed to load categories, status:', response.status);
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
  };

  useEffect(() => {
    // Test API connection first
    console.log('Testing API connection...');
    testBackendConnection();
    fetchCategories();
    fetchPhotos();
  }, []);

  // Refetch when selectedCategory changes
  useEffect(() => {
    fetchPhotos(1);
  }, [selectedCategory]);

  // Sync with URL query param from sidebar: ?category=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category') || '';
    const normalizedCat = normalizeCategoryValue(catParam);
    setSelectedCategory(normalizedCat);
    setFormData(prev => ({ ...prev, category: normalizedCat || prev.category }));
  }, [location.search, normalizeCategoryValue]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if file is selected for new uploads
    if (!editingPhoto && !selectedFile) {
      alert('Please select an image file');
      return;
    }

    setLoading(true);

    try {
      const resolvedCategory = normalizeCategoryValue(
        formData.category || selectedCategory || (categories[0] || '')
      );

      if (!resolvedCategory) {
        alert('Please select a category');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      // Only append title and description if they have values
      if (formData.title && formData.title.trim()) {
        formDataToSend.append('title', formData.title);
      }
      if (formData.description && formData.description.trim()) {
        formDataToSend.append('description', formData.description);
      }
      formDataToSend.append('category', resolvedCategory);
      formDataToSend.append('isActive', formData.isActive);

      if (selectedFile) {
        // Try 'image' field name (common in many APIs)
        formDataToSend.append('image', selectedFile);
        console.log('File being sent:', selectedFile.name, 'Size:', selectedFile.size);
        console.log('Using field name: image');
      } else {
        console.log('No file selected');
      }

      const url = editingPhoto
        ? `/api/gallery-photos/${editingPhoto._id}`
        : '/api/gallery-photos';

      const method = editingPhoto ? 'PUT' : 'POST';

      console.log('Sending request to:', url);
      console.log('Method:', method);
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ':', value);
      }

      console.log('=== REQUEST DETAILS ===');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(key, ':', `File: ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(key, ':', value);
        }
      }

      let response = await fetch(url, {
        method,
        body: formDataToSend
      });

      // If relative URL fails, try absolute URL
      if (!response.ok && url.startsWith('/api/')) {
        console.log('Relative URL failed, trying absolute URL...');
        const absoluteUrl = `http://localhost:5000${url}`;
        console.log('Trying absolute URL:', absoluteUrl);

        response = await fetch(absoluteUrl, {
          method,
          body: formDataToSend
        });
      }

      console.log('=== RESPONSE DETAILS ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        setShowModal(false);
        setEditingPhoto(null);
        setFormData({
          title: '',
          description: '',
          isActive: true,
          category: normalizeCategoryValue(selectedCategory || (categories[0] || ''))
        });
        setSelectedFile(null);
        fetchPhotos(currentPage);
      } else {
        console.log('=== ERROR RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        try {
          const error = await response.json();
          console.error('Error response JSON:', error);
          alert(error.message || `Error saving photo (${response.status})`);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
          alert(`Error saving photo (${response.status}): ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Error saving photo');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const relativeUrl = `/api/gallery-photos/${id}`;
      let response = await fetch(relativeUrl, { method: 'DELETE' });

      if (!response.ok) {
        const absoluteUrl = `http://localhost:5000/api/gallery-photos/${id}`;
        response = await fetch(absoluteUrl, { method: 'DELETE' });
      }

      if (response.ok) {
        fetchPhotos(currentPage);
      } else {
        const error = await response.json().catch(() => ({}));
        alert(error.message || 'Error deleting photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo');
    }
  };

  // Handle edit
  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description || '',
      isActive: photo.isActive,
      category: photo.category || (categories[0] || '')
    });
    setShowModal(true);
  };



  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (photo.title && photo.title.toLowerCase().includes(searchLower)) ||
      (photo.description && photo.description.toLowerCase().includes(searchLower)) ||
      (photo.category && photo.category.toLowerCase().includes(searchLower))
    );
  });

  const stats = [
    { label: 'Photos', value: photos.length, hint: 'This page' },
    { label: 'Active', value: photos.filter((p) => p.isActive).length, hint: 'Visible' },
    { label: 'Showing', value: filteredPhotos.length, hint: 'Current filters' },
    { label: 'Categories', value: categories.length, hint: 'Albums' },
  ];

  return (
    <PageShell>
    <div className="space-y-5 sm:space-y-6">
      <PageHero
        kicker="Media"
        title="Gallery"
        subtitle="Images for exhibitions, outings, and festivals."
      >
        <button
          type="button"
          onClick={() => {
            setFormData(prev => {
              const preferredCategory = selectedCategory || prev.category || (categories[0] || '');
              return {
                ...prev,
                category: normalizeCategoryValue(preferredCategory)
              };
            });
            setShowModal(true);
          }}
          className="cms-btn-primary"
        >
          <FaPlus /> Add photo
        </button>
      </PageHero>

      <StatCards items={stats} />

      <div className="cms-card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cms-input pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="cms-input cursor-pointer"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading photos...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <EmptyState
          icon={PhotoLibraryIcon}
          title="No photos yet"
          message={searchTerm || selectedCategory ? 'Nothing matches these filters.' : 'Add the first gallery photo.'}
          action={
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => {
                  const preferredCategory = selectedCategory || prev.category || (categories[0] || '');
                  return {
                    ...prev,
                    category: normalizeCategoryValue(preferredCategory),
                  };
                });
                setShowModal(true);
              }}
              className="cms-btn-primary"
            >
              <FaPlus /> Add photo
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredPhotos.map((photo) => (
            <article
              key={photo._id}
              className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <img
                  src={photo.imageUrl?.startsWith('http') ? photo.imageUrl : `http://localhost:5000${photo.imageUrl}`}
                  alt={photo.altText || photo.title}
                  className="w-20 h-14 rounded-xl object-cover flex-shrink-0 bg-[#f5f3ef]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#191f26] truncate">{photo.title || 'Untitled photo'}</h3>
                  {photo.description && (
                    <p className="text-sm text-[#5B584C] line-clamp-2">{photo.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {photo.category && (
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#f5f3ef] text-[#5B584C] border border-[#C5A880]/25 capitalize">
                        {photo.category}
                      </span>
                    )}
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full ${
                        photo.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {photo.isActive ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleEdit(photo)} className="cms-btn-primary !px-4">
                  <FaEdit className="inline mr-1" /> Edit
                </button>
                <button type="button" onClick={() => handleDelete(photo._id)} className="cms-btn-outline !px-4">
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
              onClick={() => fetchPhotos(page)}
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
              {editingPhoto ? 'Edit photo' : 'Add photo'}
            </h2>
            {selectedCategory && !editingPhoto && (
              <p className="mb-3 text-sm text-[#5B584C]">
                Uploading to category:{' '}
                <span className="font-semibold text-[#191f26] capitalize">{selectedCategory}</span>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cms-input"
                  required={!editingPhoto}
                />
                <p className="text-xs text-[#5B584C] mt-1">JPEG, PNG, GIF, WebP. Max 10MB</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="cms-input"
                  placeholder="Optional title"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="cms-input"
                  placeholder="Optional description"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="cms-input cursor-pointer capitalize"
                  required
                  disabled={Boolean(selectedCategory) && !editingPhoto}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
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
                    setEditingPhoto(null);
                    setFormData({
                      title: '',
                      description: '',
                      isActive: true,
                      category: normalizeCategoryValue(selectedCategory || (categories[0] || '')),
                    });
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
                  {loading ? 'Saving...' : (editingPhoto ? 'Update' : 'Save')}
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

export default GalleryPhotos;
