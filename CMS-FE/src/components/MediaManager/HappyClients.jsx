import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser } from 'react-icons/fa';

const HappyClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE_URL = useMemo(() => {
    const envUrl = import.meta.env?.VITE_API_BASE_URL;
    if (envUrl && envUrl.trim().length > 0) {
      return envUrl.replace(/\/$/, '');
    }
    return 'https://api.risingspaces.in';
  }, []);

  const resolvePhotoUrl = (photoUrl) => {
    if (!photoUrl) return '';
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    return `${API_BASE_URL}${photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`}`;
  };

  // Fetch clients
  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      console.log('Fetching happy clients from backend API...');

      // Try relative URL first (with proxy)
      let apiUrl = `/api/happy-clients?page=${page}&limit=100&isActive=true&sort=order`;
      console.log('Trying relative URL:', apiUrl);

      let response = await fetch(apiUrl);
      console.log('Response status:', response.status);

      // If relative URL fails, try absolute URL
      if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
        console.log('Relative URL failed, trying absolute URL...');
        apiUrl = `https://api.risingspaces.in/api/happy-clients?page=${page}&limit=100&isActive=true&sort=order`;
        console.log('Trying absolute URL:', apiUrl);
        response = await fetch(apiUrl);
        console.log('Absolute URL response status:', response.status);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Happy clients data received:', data);

      setClients(data.clients || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert(`Error fetching clients: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initializing Happy Clients component...');
    fetchClients();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      console.log('File selected:', file.name, 'Size:', file.size);
    }
  };

  const sendClientRequest = async (url, method, formDataToSend) => {
    console.log('Sending request to:', url);
    console.log('Method:', method);

    let response = await fetch(url, {
      method,
      body: formDataToSend
    });

    if (!response.ok && url.startsWith('/api/')) {
      console.log('Relative URL failed, trying absolute URL...');
      const absoluteUrl = `https://api.risingspaces.in${url}`;
      console.log('Trying absolute URL:', absoluteUrl);

      response = await fetch(absoluteUrl, {
        method,
        body: formDataToSend
      });
    }

    return response;
  };

  const resetFormState = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      title: '',
      description: ''
    });
    setSelectedFile(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingClient && !selectedFile) {
      alert('Please select an image file');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.title || '');
      formDataToSend.append('company', formData.description || '');
      formDataToSend.append('position', '');
      formDataToSend.append('isActive', 'true');
      formDataToSend.append('featured', 'false');
      formDataToSend.append('order', '0');

      if (selectedFile) {
        formDataToSend.append('photo', selectedFile);
      }

      const url = editingClient
        ? `/api/happy-clients/${editingClient._id}`
        : '/api/happy-clients';

      const method = editingClient ? 'PUT' : 'POST';

      const response = await sendClientRequest(url, method, formDataToSend);

      if (response.ok) {
        const result = await response.json();
        console.log('Client operation result:', result);

        resetFormState();
        fetchClients(currentPage);
        alert(editingClient ? 'Client updated successfully!' : 'Client added successfully!');
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(error.message || `Error saving client (${response.status})`);
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert(`Error saving client: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle image-only upload
  const handleImageOnlySubmit = async () => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    console.log('Starting image-only upload for file:', selectedFile.name);
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', '');
      formDataToSend.append('company', '');
      formDataToSend.append('position', '');
      formDataToSend.append('isActive', 'true');
      formDataToSend.append('featured', 'false');
      formDataToSend.append('order', '0');
      formDataToSend.append('photo', selectedFile);

      const response = await sendClientRequest('/api/happy-clients', 'POST', formDataToSend);

      if (response.ok) {
        const result = await response.json();
        console.log('Image-only client added successfully:', result);

        resetFormState();
        fetchClients(currentPage);
        alert('Image uploaded successfully!');
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(error.message || `Error uploading image (${response.status})`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        let response = await fetch(`/api/happy-clients/${id}`, {
          method: 'DELETE'
        });

        // If relative URL fails, try absolute URL
        if (!response.ok && response.status !== 404) {
          response = await fetch(`https://api.risingspaces.in/api/happy-clients/${id}`, {
            method: 'DELETE'
          });
        }

        if (response.ok) {
          fetchClients(currentPage);
          alert('Client deleted successfully!');
        } else {
          const error = await response.json();
          alert(error.message || 'Error deleting client');
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        alert(`Error deleting client: ${error.message}`);
      }
    }
  };

  // Handle edit
  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      title: client.title || '',
      description: client.description || ''
    });
    setShowModal(true);
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    // If no search term, show all clients
    if (!searchTerm.trim()) {
      return true;
    }

    // Search in all available text fields
    const searchLower = searchTerm.toLowerCase();
    return (
      (client.name && client.name.toLowerCase().includes(searchLower)) ||
      (client.title && client.title.toLowerCase().includes(searchLower)) ||
      (client.company && client.company.toLowerCase().includes(searchLower)) ||
      (client.position && client.position.toLowerCase().includes(searchLower)) ||
      (client.testimonial && client.testimonial.toLowerCase().includes(searchLower)) ||
      (client.description && client.description.toLowerCase().includes(searchLower)) ||
      (client.category && client.category.toLowerCase().includes(searchLower)) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.toLowerCase().includes(searchLower)) ||
      (client.tags && client.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
      // Include image-only clients in search for "image" keyword
      (searchLower.includes('image') && client.photoUrl && (!client.title || !client.description))
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Happy Clients Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('Manual refresh triggered');
              fetchClients(currentPage);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add New Client
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map((client) => (
            <div key={client._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                {client.photoUrl ? (
                  <img
                    src={resolvePhotoUrl(client.photoUrl)}
                    alt={client.title || client.name || 'Client Photo'}
                    className="w-full h-48 object-cover"
                    onLoad={() => {
                      console.log('Image loaded successfully:', client.photoUrl);
                    }}
                    onError={(e) => {
                      console.log('Image failed to load:', client.photoUrl);
                      console.log('Client data:', client);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (() => {
                  console.log('No photoUrl for client:', client);
                  return null;
                })()}
                <div className={`w-full h-48 bg-gray-200 flex items-center justify-center ${client.photoUrl ? 'hidden' : ''}`}>
                  <FaUser className="text-4xl text-gray-400" />
                </div>
              </div>

              <div className="p-4">
                {/* Basic Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-1">{client.name || client.title || 'Image Upload'}</h3>
                  {client.company && (
                    <p className="text-blue-600 font-medium text-sm">{client.company}</p>
                  )}
                  {client.position && (
                    <p className="text-gray-600 text-sm">{client.position}</p>
                  )}
                </div>

                {/* Testimonial */}
                {client.testimonial && (
                  <p className="text-gray-600 text-sm mb-3 italic">"{client.testimonial}"</p>
                )}

                {/* Description */}
                {client.description && (
                  <p className="text-gray-600 text-sm mb-3">{client.description}</p>
                )}

                {/* Rating */}
                {client.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`text-sm ${i < client.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({client.rating}/5)</span>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-1 mb-3">
                  {client.website && (
                    <div className="text-xs text-blue-500">
                      🌐 <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {client.website}
                      </a>
                    </div>
                  )}
                  {client.email && (
                    <div className="text-xs text-gray-600">
                      📧 {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="text-xs text-gray-600">
                      📞 {client.phone}
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {client.category && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {client.category}
                    </span>
                  )}
                  {client.isActive !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded ${client.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                  {client.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {client.order !== undefined && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      Order: {client.order}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {client.socialLinks && (
                  <div className="flex gap-2 mb-3">
                    {client.socialLinks.linkedin && (
                      <a href={client.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm">
                        LinkedIn
                      </a>
                    )}
                    {client.socialLinks.twitter && (
                      <a href={client.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600 text-sm">
                        Twitter
                      </a>
                    )}
                    {client.socialLinks.facebook && (
                      <a href={client.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900 text-sm">
                        Facebook
                      </a>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                  >
                    <FaEdit className="inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                  >
                    <FaTrash className="inline mr-1" /> Delete
                  </button>
                </div>

                {/* Debug: Show all data */}
                <details className="mt-3">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Show all data (debug)
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                    {JSON.stringify(client, null, 2)}
                  </pre>
                </details>
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
                onClick={() => fetchClients(page)}
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
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo
                </label>
                <div className="flex gap-2 items-end">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1 border border-gray-300 rounded-lg p-2"
                  />
                  <button
                    type="button"
                    onClick={handleImageOnlySubmit}
                    disabled={!selectedFile || loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 whitespace-nowrap"
                  >
                    Upload Image Only
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB. Use "Upload Image Only" to add just the image without title/description.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Enter client title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Enter client description"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingClient ? 'Update' : 'Save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClient(null);
                    setFormData({
                      title: '',
                      description: ''
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

export default HappyClients;
