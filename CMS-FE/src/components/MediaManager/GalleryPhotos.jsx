import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaUpload, FaSearch, FaSort } from 'react-icons/fa';

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
        apiUrl = `https://api.risingspaces.in/api/gallery-photos?${query}`;
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
      const response = await fetch('https://api.risingspaces.in/api/gallery-photos');
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
      let url = 'https://api.risingspaces.in/api/gallery-photos/categories';
      let response = await fetch(url);
      if (!response.ok) {
        url = 'https://api.risingspaces.in/api/gallery-photos/categories';
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
        const absoluteUrl = `https://api.risingspaces.in${url}`;
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
        const absoluteUrl = `https://api.risingspaces.in/api/gallery-photos/${id}`;
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gallery Photos Management</h1>
        <div className="text-sm text-gray-500">Component loaded successfully</div>
        <button
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Add New Photo
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => (
            <div key={photo._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={photo.imageUrl?.startsWith('http') ? photo.imageUrl : `https://api.risingspaces.in${photo.imageUrl}`}
                  alt={photo.altText || photo.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', photo.imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              <div className="p-4">
                {photo.title && (
                  <h3 className="font-semibold text-lg mb-2">{photo.title}</h3>
                )}
                {photo.description && (
                  <p className="text-gray-600 text-sm mb-2">{photo.description}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  {photo.category && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 capitalize">
                      {photo.category}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${photo.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {photo.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(photo)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                  >
                    <FaEdit className="inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(photo._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                  >
                    <FaTrash className="inline mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchPhotos(page)}
                className={`px-3 py-2 rounded ${currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingPhoto ? 'Edit Photo' : 'Add New Photo'}
            </h2>
            {selectedCategory && !editingPhoto && (
              <div className="mb-3 text-sm">
                <span className="text-gray-600">Uploading to category:</span>{' '}
                <span className="font-semibold capitalize">{selectedCategory}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required={!editingPhoto}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, GIF, WebP. Max size: 10MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Enter image title (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Enter image description (optional)"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 capitalize"
                  required
                  disabled={Boolean(selectedCategory) && !editingPhoto}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingPhoto ? 'Update' : 'Save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPhoto(null);
                    setFormData({
                      title: '',
                      description: '',
                      isActive: true,
                      category: normalizeCategoryValue(selectedCategory || (categories[0] || ''))
                    });
                    setSelectedFile(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPhotos;
