import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import PageShell from '../components/PageShell';
import { PageHero, StatCards, EmptyState } from '../components/PageHero';

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    rating: 5,
    testimonialText: '',
    date: new Date().toISOString().split('T')[0],
    companyName: '',
    otherFields: {
      position: ''
    }
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/testimonials/');
        const data = await response.json();
        console.log('Fetched testimonials:', data); // Debug log
        setTestimonials(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        toast.error('Failed to fetch testimonials');
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.otherFields) {
      setFormData({
        ...formData,
        otherFields: {
          ...formData.otherFields,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle photo file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = currentTestimonial
        ? `http://localhost:5000/api/testimonials/${currentTestimonial._id}`
        : 'http://localhost:5000/api/testimonials/';

      const method = currentTestimonial ? 'PUT' : 'POST';

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('testimonialText', formData.testimonialText);
      formDataToSend.append('date', formData.date);
      // formDataToSend.append('companyName', formData.companyName);
      // formDataToSend.append('otherFields', JSON.stringify(formData.otherFields));

      // Add photo if selected
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
        console.log('Photo file being sent:', photoFile.name, photoFile.size); // Debug log
      }

      // Debug: Log form data being sent
      console.log('Form data being sent:', {
        fullName: formData.fullName,
        rating: formData.rating,
        testimonialText: formData.testimonialText,
        date: formData.date,
        companyName: formData.companyName,
        hasPhoto: !!photoFile
      });

      const response = await fetch(url, {
        method,
        body: formDataToSend, // Don't set Content-Type header, let browser set it with boundary
      });

      if (!response.ok) throw new Error('Operation failed');

      const data = await response.json();
      console.log('Testimonial response:', data); // Debug log

      if (currentTestimonial) {
        setTestimonials(testimonials.map(t => t._id === data._id ? data : t));
        toast.success('Testimonial updated successfully');
      } else {
        setTestimonials([...testimonials, data]);
        toast.success('Testimonial added successfully');
      }

      setIsModalOpen(false);
      setCurrentTestimonial(null);
      resetForm();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Edit testimonial
  const handleEdit = (testimonial) => {
    console.log('Editing testimonial:', testimonial); // Debug log
    setCurrentTestimonial(testimonial);
    setFormData({
      fullName: testimonial.fullName || '',
      rating: testimonial.rating || 5,
      testimonialText: testimonial.testimonialText || '',
      date: testimonial.date ? testimonial.date.split('T')[0] : new Date().toISOString().split('T')[0],
      companyName: testimonial.companyName || '',
      otherFields: {
        position: testimonial.otherFields?.position || ''
      }
    });
    // Set photo preview if testimonial has a photo
    if (testimonial.photoUrl) {
      setPhotoPreview(testimonial.photoUrl);
    } else {
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  // Delete testimonial
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Deletion failed');

        setTestimonials(testimonials.filter(t => t._id !== id));
        toast.success('Testimonial deleted successfully');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      rating: 5,
      testimonialText: '',
      date: new Date().toISOString().split('T')[0],
      companyName: '',
      otherFields: {
        position: ''
      }
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Open modal for new testimonial
  const openNewTestimonialModal = () => {
    setCurrentTestimonial(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
                    className={`text-lg ${i < rating ? 'text-[#C5A880]' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const list = Array.isArray(testimonials) ? testimonials : [];
  const filteredTestimonials = list.filter((t) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      (t.fullName || '').toLowerCase().includes(q) ||
      (t.testimonialText || '').toLowerCase().includes(q) ||
      (t.companyName || '').toLowerCase().includes(q)
    );
  });

  const stats = [
    { label: 'Stories', value: list.length, hint: 'All testimonials' },
    { label: 'Showing', value: filteredTestimonials.length, hint: 'Current search' },
    { label: '5-star', value: list.filter((t) => Number(t.rating) === 5).length, hint: 'Top rated' },
    { label: 'With photo', value: list.filter((t) => t.photoUrl).length, hint: 'Has portrait' },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="cms-card p-16 flex flex-col items-center justify-center">
          <CircularProgress sx={{ color: '#C5A880' }} />
          <p className="mt-4 text-[#5B584C] text-sm">Loading testimonials...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
    <div className="space-y-5 sm:space-y-6">
      <PageHero
        kicker="Customer Stories"
        title="Testimonials"
        subtitle="Manage reviews shown on the public website."
      >
        <button type="button" onClick={openNewTestimonialModal} className="cms-btn-primary">
          + Add testimonial
        </button>
      </PageHero>

      <StatCards items={stats} />

      <div className="cms-card p-4 sm:p-5">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or story..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cms-input pl-10"
          />
        </div>
      </div>

      {filteredTestimonials.length === 0 ? (
        <EmptyState
          icon={FormatQuoteIcon}
          title="No testimonials yet"
          message={
            searchTerm
              ? 'Nothing matches this search. Clear it and try again.'
              : 'Add the first customer story for the public site.'
          }
          action={
            <button type="button" onClick={openNewTestimonialModal} className="cms-btn-primary">
              + Add testimonial
            </button>
          }
        />
      ) : (
      <div className="space-y-3">
        {filteredTestimonials.map((testimonial) => (
          <article
            key={testimonial._id}
            className="cms-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#C5A880]/20 text-[#A0725B] flex items-center justify-center font-semibold flex-shrink-0">
                {testimonial.photoUrl ? (
                  <img
                    src={testimonial.photoUrl}
                    alt={testimonial.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (testimonial.fullName || '?').charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#191f26] truncate">{testimonial.fullName}</h3>
                <p className="text-sm text-[#5B584C] truncate">
                  {[testimonial.otherFields?.position, testimonial.companyName].filter(Boolean).join(' · ')
                    || 'No company specified'}
                </p>
                <p className="mt-2 text-sm text-[#5B584C] line-clamp-2 italic">"{testimonial.testimonialText}"</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="flex items-center">{renderStars(testimonial.rating)}</span>
                  <span className="text-[11px] text-gray-500">
                    {testimonial.date ? new Date(testimonial.date).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleEdit(testimonial)} className="cms-btn-primary !px-4">
                Edit
              </button>
              <button type="button" onClick={() => handleDelete(testimonial._id)} className="cms-btn-outline !px-4">
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-2xl text-[#191f26]">
                  {currentTestimonial ? 'Edit testimonial' : 'Add testimonial'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#5B584C] hover:text-[#191f26]"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">Profile photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-[#C5A880]/20 flex-shrink-0 flex items-center justify-center text-[#A0725B] font-semibold">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          '?'
                        )}
                      </div>
                      <div className="flex-1">
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="cms-input" />
                        <p className="text-xs text-[#5B584C] mt-1">Optional</p>
                      </div>
                    </div>
                  </div>

                  {[
                    { label: 'Full Name', type: 'text', name: 'fullName', value: formData.fullName },
                    { label: 'Rating', type: 'select', name: 'rating', value: formData.rating, options: [1, 2, 3, 4, 5] },
                    { label: 'Testimonial Text', type: 'textarea', name: 'testimonialText', value: formData.testimonialText },
                    { label: 'Date', type: 'date', name: 'date', value: formData.date },
                  ].map(({ label, type, name, value, options }, index) => (
                    <div key={index}>
                      <label className="block text-xs uppercase tracking-wider text-[#5B584C] font-semibold mb-1.5">{label}</label>
                      {type === 'textarea' ? (
                        <textarea
                          name={name}
                          value={value}
                          onChange={handleInputChange}
                          rows="3"
                          className="cms-input"
                          required
                        />
                      ) : type === 'select' ? (
                        <select
                          name={name}
                          value={value}
                          onChange={handleInputChange}
                          className="cms-input cursor-pointer"
                          required
                        >
                          {options.map((option) => (
                            <option key={option} value={option}>
                              {option} Star{option !== 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={value}
                          onChange={handleInputChange}
                          className="cms-input"
                          required
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-[#C5A880]/20 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="cms-btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="cms-btn-primary">
                    {currentTestimonial ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageShell>
  );
};

export default TestimonialManagement;
