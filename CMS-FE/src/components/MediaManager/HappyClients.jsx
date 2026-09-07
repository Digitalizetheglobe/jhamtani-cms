import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import PageShell from '../PageShell';
import { PageHero, StatCards, EmptyState } from '../PageHero';

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
    return 'http://localhost:5000';
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
        apiUrl = `http://localhost:5000/api/happy-clients?page=${page}&limit=100&isActive=true&sort=order`;
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
      const absoluteUrl = `http://localhost:5000${url}`;
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
          response = await fetch(`http://localhost:5000/api/happy-clients/${id}`, {
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

  const stats = [
    { label: 'Faces', value: clients.length, hint: 'This page' },
    { label: 'Showing', value: filteredClients.length, hint: 'Current search' },
    { label: 'With photo', value: clients.filter((c) => c.photoUrl).length, hint: 'Portraits' },
    { label: 'Pages', value: totalPages, hint: 'Pagination' },
  ];

  return (
    <PageShell>
    <div className="space-y-5 sm:space-y-6">
      <PageHero
        kicker="Media"
        title="Happy Faces"
        subtitle="Client portraits for the public site."
      >
        <button type="button" onClick={() => fetchClients(currentPage)} className="cms-btn-outline">
          Refresh
        </button>
        <button type="button" onClick={() => setShowModal(true)} className="cms-btn-primary">
          <FaPlus /> Add client
        </button>
      </PageHero>

      <StatCards items={stats} />

      <div className="cms-card p-4 sm:p-5">
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cms-input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon={FaUser}
          title="No happy faces yet"
          message={searchTerm ? 'Nothing matches this search.' : 'Add the first client portrait.'}
          action={
            <button type="button" onClick={() => setShowModal(true)} className="cms-btn-primary">
              <FaPlus /> Add client
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <article
              key={client._id}
              className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#C5A880]/20 flex-shrink-0 flex items-center justify-center">
                  {client.photoUrl ? (
                    <img
                      src={resolvePhotoUrl(client.photoUrl)}
                      alt={client.title || client.name || 'Client'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <FaUser className="text-[#A0725B]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#191f26] truncate">
                    {client.name || client.title || 'Image upload'}
                  </h3>
                  <p className="text-sm text-[#5B584C] truncate">
                    {[client.position, client.company].filter(Boolean).join(' · ')
                      || client.description
                      || 'No details'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {client.category && (
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#f5f3ef] text-[#5B584C] border border-[#C5A880]/25">
                        {client.category}
                      </span>
                    )}
                    {client.isActive !== undefined && (
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full ${
                          client.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {client.isActive ? 'Active' : 'Hidden'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleEdit(client)} className="cms-btn-primary !px-4">
                  <FaEdit className="inline mr-1" /> Edit
                </button>
                <button type="button" onClick={() => handleDelete(client._id)} className="cms-btn-outline !px-4">
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
              onClick={() => fetchClients(page)}
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
              {editingClient ? 'Edit client' : 'Add client'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Photo</label>
                <div className="flex gap-2 items-end">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1 cms-input"
                  />
                  <button
                    type="button"
                    onClick={handleImageOnlySubmit}
                    disabled={!selectedFile || loading}
                    className="cms-btn-outline disabled:opacity-50 whitespace-nowrap"
                  >
                    Image only
                  </button>
                </div>
                <p className="text-xs text-[#5B584C] mt-1">JPEG, PNG, GIF, WebP. Max 5MB</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="cms-input"
                  placeholder="Enter client title"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="cms-input"
                  placeholder="Enter client description"
                  rows="3"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-[#C5A880]/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClient(null);
                    setFormData({ title: '', description: '' });
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
                  {loading ? 'Saving...' : (editingClient ? 'Update' : 'Save')}
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

export default HappyClients;
